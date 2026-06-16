import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'

// POST { config } -> sauvegarde site_config/main (infos resto + mentions légales, etc.)
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })
  if (req.method !== 'POST') return res.status(405).end()

  const { config } = req.body || {}
  if (!config) return res.status(400).json({ error: 'config manquante' })

  await db.collection('site_config').doc('main').set(
    { ...config, updatedAt: new Date().toISOString() },
    { merge: true }
  )
  return res.status(200).json({ ok: true })
}
