import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'
import { revalidateMenu } from '@/lib/revalidate'

// POST   { id?, text, active, percent, cats, days } -> crée/met à jour la promo « deal »
//        (-X% sur des catégories ciblées, certains jours). Collection 'promos', type 'deal'.
// DELETE { id } -> supprime la promo.
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })

  if (req.method === 'POST') {
    const { id, text, active, percent, cats, days, sizes } = req.body || {}
    const docId = id || 'promo-' + Date.now()
    const payload = {
      type: 'deal',
      text: String(text || ''),
      active: !!active,
      percent: Math.min(100, Math.max(0, Number(percent) || 0)), // 0–100
      cats: Array.isArray(cats) ? cats.filter(Boolean) : [],
      days: Array.isArray(days) ? days.filter(Boolean) : [],
      sizes: Array.isArray(sizes) ? sizes.filter(Boolean) : [],
      updatedAt: new Date().toISOString(),
    }
    await db.collection('promos').doc(docId).set(payload, { merge: true })
    try { await revalidateMenu(res) } catch (e) { console.error('revalidate:', e.message) }
    return res.status(200).json({ ok: true, id: docId })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id manquant' })
    await db.collection('promos').doc(id).delete()
    try { await revalidateMenu(res) } catch (e) { console.error('revalidate:', e.message) }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
