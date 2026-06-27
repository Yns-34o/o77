import busboy from 'busboy'
import sharp from 'sharp'
import { bucket } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

// Upload d'une image (produit OU catégorie) -> Firebase Storage.
// La compression principale se fait côté client (browser-image-compression : WebP
// ≤ 1200px / ~150 Ko). Ici, simple filet de sécurité : on ne ré-encode QUE si
// l'image arrive dans un autre format ou plus large que 1200px (rotation EXIF incluse),
// afin d'éviter une double compression destructrice quand le client a déjà fait le travail.
//
// POST multipart/form-data :
//   - file : l'image (obligatoire)
//   - id   : identifiant pour le nommage (productId / categoryId) — optionnel
//   - kind : 'product' (défaut) | 'category' -> dossier de stockage
// Réponse : { url, path }
export const config = { api: { bodyParser: false } }

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_BYTES = 12 * 1024 * 1024 // 12 Mo (tolérance : on ré-encode ensuite)
const MAX_DIM = 1200               // grand côté max (la compression client vise déjà 1200px)

// Parse multipart -> { file: { buffer, mimeType, size }, id, kind }
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES } })
    const out = { file: null, id: '', kind: 'product' }
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
      if (name === 'id' || name === 'productId') out.id = val
      else if (name === 'kind') out.kind = val
    })
    bb.on('limit', () => reject(new Error('Fichier trop volumineux (max 12 Mo)')))
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
    const { file, id, kind } = await parseMultipart(req)
    if (!file) return res.status(400).json({ error: 'Aucun fichier reçu' })
    if (!ALLOWED.has(file.mimeType)) return res.status(415).json({ error: 'Format non supporté (PNG, JPG ou WebP uniquement)' })

    // Filet de sécurité : on ne ré-encode que si le format n'est pas du WebP ou si
    // l'image dépasse 1200px de large (cas d'un contournement de la compression client).
    const meta = await sharp(file.buffer).metadata()
    const w = meta.width || 0
    let optimized = file.buffer
    if (file.mimeType !== 'image/webp' || w > MAX_DIM) {
      let pipeline = sharp(file.buffer).rotate() // orientation EXIF corrigée
      if (w > MAX_DIM) {
        pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      }
      optimized = await pipeline.webp({ quality: 80 }).toBuffer()
    }

    const folder = kind === 'category' ? 'categories' : 'products'
    const slug = (id || (kind === 'category' ? 'cat' : 'prod')).toString().replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40)
    const path = `${folder}/${slug}-${Date.now()}.webp`
    const f = bucket.file(path)
    await f.save(optimized, { metadata: { contentType: 'image/webp' } })
    await f.makePublic()

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`
    return res.status(200).json({ url, path })
  } catch (e) {
    console.error('upload:', e)
    const msg = (e.message || '').toLowerCase()
    if (msg.includes('bucket') && msg.includes('not exist')) {
      return res.status(500).json({ error: "Le stockage des images (Firebase Storage) n'est pas encore activé. Ouvre la console Firebase > Storage > Commencer, puis réessaie." })
    }
    return res.status(500).json({ error: e.message || 'Échec de l\'upload' })
  }
}
