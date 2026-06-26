import { useState } from 'react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import OpenStatus from '@/components/OpenStatus'
import { toast } from '@/lib/toast'
import { RESTAURANT } from '@/lib/constants'

const TIMES = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30']

const labelStyle = { fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ccc', display: 'block', marginBottom: 8 }

export default function Reserver() {
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    const form = e.target
    const payload = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      phone: form.phone.value,
      pickupDate: form.pickupDate.value,
      pickupTime: form.pickupTime.value,
      details: form.details.value,
    }
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast('Pré-commande envoyée ! 🎉')
        form.reset()
      } else {
        toast(data.error || 'Erreur, appelez-nous.')
      }
    } catch {
      toast('Erreur réseau, appelez-nous.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Seo
        title="Pré-commande à emporter | O'77 Pontault-Combault"
        description="Pré-commande ton repas chez O'77 à Pontault-Combault et retire-le à l'heure choisie. Fast-food & pizzeria, 7j/7 de 11h à 1h."
        path="/reserver"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ maxWidth: 700, marginBottom: 64 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>À emporter</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '4rem', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            PRÉ-COMMANDE<br />À <span style={{ color: '#FFD600' }}>EMPORTER</span>
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 16 }}>
            Choisis ta date et ton heure de retrait. On prépare, tu passes chercher. Simple.
          </p>
        </Reveal>

        <Reveal className="resa-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 60 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={labelStyle}>Prénom</label><input name="firstName" type="text" className="form-input" placeholder="Ton prénom" required /></div>
              <div><label style={labelStyle}>Nom</label><input name="lastName" type="text" className="form-input" placeholder="Ton nom" required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={labelStyle}>Email</label><input name="email" type="email" className="form-input" placeholder="email@example.com" required /></div>
              <div><label style={labelStyle}>Téléphone</label><input name="phone" type="tel" className="form-input" placeholder="06 XX XX XX XX" required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={labelStyle}>Date de retrait</label><input name="pickupDate" type="date" className="form-input" required /></div>
              <div><label style={labelStyle}>Heure de retrait</label>
                <select name="pickupTime" className="form-input" required defaultValue="">
                  <option value="" disabled>Choisir</option>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Ta commande / remarques</label>
              <textarea name="details" className="form-input" rows={4} placeholder="Ex : 1 Pizza O'77, 1 Naan Cheesy, des frites… Allergies, préférences…" required />
            </div>
            <button type="submit" className="btn-jaune" disabled={sending} style={{ opacity: sending ? 0.6 : 1 }}>
              {sending ? 'Envoi…' : 'Envoyer ma pré-commande'}
            </button>
          </form>

          <div>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 16 }}>Retrait</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.8 }}>146 Av. Charles Rouxel<br />77340 Pontault-Combault</p>
            </div>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 16 }}>Horaires</h3>
              <div style={{ background: '#111', border: '1px solid #1c1c1c', padding: 20, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 12 }}>
                  <span style={{ color: '#888' }}>Lun — Dim</span><span style={{ fontWeight: 600 }}>{RESTAURANT.hoursLabel}</span>
                </div>
                <OpenStatus />
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 12 }}>Une question ?</h3>
              <a href={RESTAURANT.phoneHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#111', border: '1px solid #1c1c1c', padding: '14px 20px', textDecoration: 'none', color: '#fff', fontFamily: 'Oswald', fontSize: '1.1rem', borderRadius: 8 }}>📞 09 85 00 27 73</a>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}
