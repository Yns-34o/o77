import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

const ALLOWED = ['new', 'confirmed', 'cancelled', 'completed']

// POST { id, status } -> change le statut d'une pré-commande
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })
  if (req.method !== 'POST') return res.status(405).end()

  const { id, status } = req.body || {}
  if (!id || !ALLOWED.includes(status)) return res.status(400).json({ error: 'Paramètres invalides' })

  await db.collection('preorders').doc(id).update({ status })
  return res.status(200).json({ ok: true })
}
