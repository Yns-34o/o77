import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import OpenStatus from '@/components/OpenStatus'
import { RESTAURANT } from '@/lib/constants'

export default function Contact() {
  return (
    <>
      <Seo title="Contact & Horaires — O'77 Fast-food Pontault-Combault" description="O'77, 146 Av. Charles Rouxel, 77340 Pontault-Combault. Tél : 09 85 00 27 73. Fast-food & pizzeria ouvert 7j/7 de 11h à 1h." path="/contact" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ maxWidth: 700, marginBottom: 64 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Contact</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '4rem', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            ON EST <span style={{ color: '#FFD600' }}>OÙ</span> ?
          </h1>
        </Reveal>

        <Reveal className="resa-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 60 }}>
          <div>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 16 }}>Adresse</h3>
              <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.8 }}>
                146 Av. Charles Rouxel<br />77340 Pontault-Combault
              </p>
            </div>
            <div className="map-wrap" style={{ overflow: 'hidden', marginBottom: 32 }}>
              <iframe
                title="Carte O'77 Pontault-Combault"
                src="https://www.google.com/maps?q=146+Av+Charles+Rouxel,+77340+Pontault-Combault&output=embed"
                width="100%"
                height="320"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 16 }}>Horaires</h3>
              <div style={{ background: '#111', border: '1px solid #1c1c1c', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                  <span style={{ color: '#888' }}>Lundi — Dimanche</span>
                  <span style={{ fontWeight: 600 }}>{RESTAURANT.hoursLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid #1c1c1c', marginTop: 12 }}>
                  <OpenStatus />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 16 }}>Téléphone</h3>
              <a href={RESTAURANT.phoneHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#111', border: '1px solid #1c1c1c', padding: '14px 20px', textDecoration: 'none', color: '#fff', fontFamily: 'Oswald', fontSize: '1.1rem' }}>
                📞 09 85 00 27 73
              </a>
            </div>

            <div>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 16 }}>Email</h3>
              <a href={`mailto:${RESTAURANT.email}`} style={{ color: '#888', fontSize: '0.9rem', textDecoration: 'none' }}>{RESTAURANT.email}</a>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}
