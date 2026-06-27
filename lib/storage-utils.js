import { bucket } from './firebase-admin'

// URL publique Firebase Storage -> path interne du fichier.
// Gère les 2 formats possibles :
//   - v0 (généré par upload.js) : .../v0/b/BUCKET/o/products%2Fx.webp?alt=media
//   - storage.googleapis.com    : .../BUCKET/products/x.webp
export function parseStorageUrl(url) {
  if (!url || typeof url !== 'string') return null
  const m = url.match(/\/o\/([^?]+)/)
  if (m) return decodeURIComponent(m[1])
  const m2 = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/)
  return m2 ? m2[1] : null
}

// Supprime un fichier Storage depuis son URL publique. Jamais bloquant :
// renvoie false si l'URL n'est pas exploitable ou si le fichier n'existe pas (404).
// À appeler quand l'image d'un produit/catégorie est remplacée ou supprimée, pour ne
// pas accumuler de fichiers fantômes dans les 5 Go gratuits.
export async function deleteStorageFile(url) {
  const path = parseStorageUrl(url)
  if (!path) return false
  try {
    const f = bucket.file(path)
    const [exists] = await f.exists()
    if (!exists) return false
    await f.delete()
    return true
  } catch (e) {
    console.error('[storage] delete:', e.message)
    return false
  }
}
