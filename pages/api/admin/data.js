import { db } from '@/lib/firebase-admin'
import { checkAuth } from '@/lib/auth-session'
import { toSerializable } from '@/lib/site-data'
import { DEFAULT_CONFIG } from '@/lib/menu-data'

// GET : toutes les données pour le dashboard (admin only).
export default async function handler(req, res) {
  const user = await checkAuth(req)
  if (!user) return res.status(401).json({ error: 'Non autorisé' })
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [pSnap, cSnap, prSnap, oSnap, cfgSnap] = await Promise.all([
      db.collection('products').orderBy('sortOrder').get(),
      db.collection('categories').orderBy('sortOrder').get(),
      db.collection('promos').get(),
      db.collection('preorders').orderBy('createdAt', 'desc').limit(200).get(),
      db.collection('site_config').doc('main').get(),
    ])
    const map = (s) => s.docs.map((d) => toSerializable({ id: d.id, ...d.data() }))

    res.status(200).json({
      user: { email: user.email, uid: user.uid },
      products: map(pSnap),
      categories: map(cSnap),
      promos: map(prSnap),
      preorders: map(oSnap),
      config: cfgSnap.exists ? { ...DEFAULT_CONFIG, ...toSerializable(cfgSnap.data()) } : DEFAULT_CONFIG,
    })
  } catch (e) {
    console.error('admin/data:', e)
    res.status(500).json({ error: e.message })
  }
}
