// Réception d'une pré-commande Click & Collect -> collection Firestore 'preorders'.
import { db } from '../../lib/firebase-admin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(503).json({ error: 'Réservation en ligne bientôt disponible — appelez-nous au 09 85 00 27 73.' })
  }

  const { firstName, lastName, email, phone, pickupDate, pickupTime, details } = req.body || {}

  if (!firstName || !lastName || !phone || !pickupDate || !pickupTime) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' })
  }

  try {
    const ref = await db.collection('preorders').add({
      firstName,
      lastName,
      email: email || '',
      phone,
      pickupDate,
      pickupTime,
      details: details || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    })
    return res.status(200).json({ ok: true, id: ref.id })
  } catch (e) {
    console.error('reservation:', e)
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}
