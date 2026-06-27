import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'
import { revalidateMenu, revalidateLegal } from '@/lib/revalidate'

// POST { config } -> sauvegarde site_config/main (infos resto + mentions légales, hero…)
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
  // La config porte le hero (menu) ET les infos légales -> on revalide les deux familles.
  try { await revalidateMenu(res); await revalidateLegal(res) } catch (e) { console.error('revalidate:', e.message) }
  return res.status(200).json({ ok: true })
}
