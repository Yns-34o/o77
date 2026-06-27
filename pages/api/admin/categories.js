import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'
import { deleteStorageFile } from '@/lib/storage-utils'
import { revalidateMenu } from '@/lib/revalidate'

function slugify(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// POST { id?, label, icon, image, sortOrder, active } -> crée / met à jour
// DELETE { id }                                         -> supprime (avec nettoyage image)
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })

  if (req.method === 'POST') {
    const { id, ...data } = req.body || {}
    const docId = id || slugify(data.label) || 'c-' + Date.now()
    // Nettoyage de l'ancienne image Storage si elle a été remplacée.
    if (id && data.image !== undefined) {
      try {
        const old = await db.collection('categories').doc(id).get()
        const oldImage = old.exists ? old.data().image : null
        if (oldImage && oldImage !== data.image) await deleteStorageFile(oldImage)
      } catch (e) {
        console.error('cleanup image:', e.message)
      }
    }
    await db.collection('categories').doc(docId).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true })
    try { await revalidateMenu(res) } catch (e) { console.error('revalidate:', e.message) }
    return res.status(200).json({ ok: true, id: docId })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id manquant' })
    // Nettoyage de l'image Storage avant suppression de la catégorie.
    try {
      const old = await db.collection('categories').doc(id).get()
      if (old.exists && old.data().image) await deleteStorageFile(old.data().image)
    } catch (e) {
      console.error('cleanup image:', e.message)
    }
    await db.collection('categories').doc(id).delete()
    try { await revalidateMenu(res) } catch (e) { console.error('revalidate:', e.message) }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
