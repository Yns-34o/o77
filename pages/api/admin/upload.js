import busboy from 'busboy'
import sharp from 'sharp'
import { bucket } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

// Upload d'une image (produit OU catégorie) -> Firebase Storage.
// Objectif : qualité maximale SANS altérer le contenu (pas de crop, pas de filtre
// artistique). On préserve/améliore seulement la définition :
//   - rotation EXIF (orientation correcte des photos de téléphone)
//   - qualité WebP 95 (quasi sans perte visuelle)
//   - résolution préservée : grand côté plafonné à 2000px (au lieu de 1000 avant)
//   - UPSCALE x2 des petites images (< 900px) au noyau Lanczos3 + sharpen léger,
//     pour gagner en netteté perçue même sur une photo prise sur le moment.
//
// POST multipart/form-data :
//   - file : l'image (obligatoire)
//   - id   : identifiant pour le nommage (productId / categoryId) — optionnel
//   - kind : 'product' (défaut) | 'category' -> dossier de stockage
// Réponse : { url, path }
export const config = { api: { bodyParser: false } }

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_BYTES = 12 * 1024 * 1024 // 12 Mo (tolérance : on ré-encode ensuite)
const MAX_DIM = 2000              // dimension maximale de sortie (grand côté)
const UPSCALE_BELOW = 900         // en dessous : on agrandit x2 (jusqu'à ~1800)

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

    // Décide du resize/upscale selon la résolution source.
    const meta = await sharp(file.buffer).metadata()
    const w = meta.width || 0
    let pipeline = sharp(file.buffer).rotate() // orientation EXIF corrigée
    if (w > 0 && w < UPSCALE_BELOW) {
      // Petite photo : on augmente la définition x2 (Lanczos3) sans dépasser MAX_DIM.
      pipeline = pipeline.resize({ width: Math.min(MAX_DIM, w * 2), kernel: 'lanczos3' })
    } else if (w > MAX_DIM) {
      // Grande image : on plafonne (sans agrandir) pour rester raisonnable.
      pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
    }

    const optimized = await pipeline
      .sharpen({ sigma: 0.6 })  // netteté perçue (compense le resize/upscale)
      .webp({ quality: 95 })    // qualité maximale, quasi sans perte
      .toBuffer()

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
    return res.status(500).json({ error: e.message || 'Échec de l\'upload' })
  }
}
