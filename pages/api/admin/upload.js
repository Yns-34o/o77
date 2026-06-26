import busboy from 'busboy'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { checkAuth } from '@/lib/auth-session'

// Upload d'une image (produit OU catégorie) -> dossier public/uploads/ du site.
// Stockage local gratuit : aucun service externe, aucune carte bancaire requise.
// Qualité maximale SANS altérer le contenu :
//   - rotation EXIF (orientation correcte des photos de téléphone)
//   - qualité WebP 95 (quasi sans perte visuelle)
//   - grand côté plafonné à 2000px
//
// POST multipart/form-data :
//   - file : l'image (obligatoire)
//   - id   : identifiant pour le nommage (productId / categoryId) — optionnel
//   - kind : 'product' (défaut) | 'category' -> sous-dossier
// Réponse : { url, path }
export const config = { api: { bodyParser: false } }

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_BYTES = 12 * 1024 * 1024 // 12 Mo (tolérance : on ré-encode ensuite)
const MAX_DIM = 2000              // dimension maximale de sortie (grand côté)

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

    // Optimisation : orientation EXIF + plafond de résolution + WebP qualité 95.
    const meta = await sharp(file.buffer).metadata()
    const w = meta.width || 0
    let pipeline = sharp(file.buffer).rotate() // orientation EXIF corrigée
    if (w > MAX_DIM) {
      pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
    }
    const optimized = await pipeline
      .sharpen({ sigma: 0.6 })  // netteté perçue (compense le resize)
      .webp({ quality: 95 })    // qualité maximale, quasi sans perte
      .toBuffer()

    const sub = kind === 'category' ? 'categories' : 'products'
    const slug = (id || (kind === 'category' ? 'cat' : 'prod')).toString().replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40)
    const filename = `${slug}-${Date.now()}.webp`
    const dir = path.join(process.cwd(), 'public', 'uploads', sub)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, filename), optimized)

    const url = `/uploads/${sub}/${filename}`
    return res.status(200).json({ url, path: `uploads/${sub}/${filename}` })
  } catch (e) {
    console.error('upload:', e)
    const msg = (e.message || '').toLowerCase()
    if (msg.includes('enospc')) {
      return res.status(500).json({ error: "Plus d'espace disque disponible sur le serveur." })
    }
    return res.status(500).json({ error: e.message || 'Échec de l\'upload' })
  }
}
