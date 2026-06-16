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

// POST { id?, name, price, ... }  -> crée / met à jour un produit
// DELETE { id }                   -> supprime
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })

  if (req.method === 'POST') {
    const { id, ...data } = req.body || {}
    const docId = id || slugify(data.name) || 'p-' + Date.now()
    const now = new Date().toISOString()
    const payload = { ...data, updatedAt: now }
    if (!id) payload.createdAt = now
    await db.collection('products').doc(docId).set(payload, { merge: true })
    return res.status(200).json({ ok: true, id: docId })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id manquant' })
    await db.collection('products').doc(id).delete()
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
