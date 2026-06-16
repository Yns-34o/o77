import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

// POST { id?, type:'banner', text, active } -> crée / met à jour une promo (bannière)
// DELETE { id }                             -> supprime
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })

  if (req.method === 'POST') {
    const { id, ...data } = req.body || {}
    const docId = id || 'promo-' + Date.now()
    const payload = { type: 'banner', ...data, updatedAt: new Date().toISOString() }
    await db.collection('promos').doc(docId).set(payload, { merge: true })
    return res.status(200).json({ ok: true, id: docId })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id manquant' })
    await db.collection('promos').doc(id).delete()
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
