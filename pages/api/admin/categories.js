import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

function slugify(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// POST { id?, label, icon, sortOrder, active } -> crée / met à jour
// DELETE { id }                                 -> supprime
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })

  if (req.method === 'POST') {
    const { id, ...data } = req.body || {}
    const docId = id || slugify(data.label) || 'c-' + Date.now()
    await db.collection('categories').doc(docId).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true })
    return res.status(200).json({ ok: true, id: docId })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id manquant' })
    await db.collection('categories').doc(id).delete()
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
