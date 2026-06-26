import busboy from 'busboy'
import sharp from 'sharp'
import { bucket } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

// Upload d'une image produit (PNG/JPG/WebP) -> Firebase Storage.
// Le fichier est optimisé (sharp : rotation EXIF + resize max 1000px + webp q82),
// rendu public, et l'URL publique est retournée.
//
// POST multipart/form-data :
//   - file      : l'image (obligatoire)
//   - productId : id du produit (optionnel, pour le nommage)
// Réponse : { url, path }
export const config = { api: { bodyParser: false } }

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_BYTES = 8 * 1024 * 1024 // 8 Mo

// Parse multipart -> { file: { buffer, mimeType, size }, productId }
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES } })
    const out = { file: null, productId: '' }
    let chunks = []
    let size = 0
    let mimeType = ''

    bb.on('file', (_name, stream, info) => {
      mimeType = info.mimeType
      stream.on('data', (d) => { chunks.push(d); size += d.length })
      stream.on('end', () => {
        out.file = { buffer: Buffer.concat(chunks), mimeType, size }
      })
    })
    bb.on('field', (name, val) => {
      if (name === 'productId') out.productId = val
    })
    bb.on('limit', () => reject(new Error('Fichier trop volumineux (max 8 Mo)')))
    bb.on('error', reject)
    bb.on('close', () => resolve(out))

    req.pipe(bb)
  })
}

export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { file, productId } = await parseMultipart(req)
    if (!file) return res.status(400).json({ error: 'Aucun fichier reçu' })
    if (!ALLOWED.has(file.mimeType)) return res.status(415).json({ error: 'Format non supporté (PNG, JPG ou WebP uniquement)' })
    if (file.size > MAX_BYTES) return res.status(413).json({ error: 'Fichier trop volumineux (max 8 Mo)' })

    // Optimisation : rotation EXIF + resize <= 1000px + webp.
    const optimized = await sharp(file.buffer)
      .rotate()
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const slug = (productId || 'prod').toString().replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40)
    const path = `products/${slug}-${Date.now()}.webp`
    const f = bucket.file(path)
    await f.save(optimized, { metadata: { contentType: 'image/webp' } })
    await f.makePublic()

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`
    return res.status(200).json({ url, path })
  } catch (e) {
    console.error('upload:', e)
    return res.status(500).json({ error: e.message || 'Échec de l\'upload' })
  }
}
