import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import OpenStatus from './OpenStatus'
import SocialLinks from './SocialLinks'
import { useConfig } from '@/context/ConfigContext'
import { RESTAURANT } from '@/lib/constants'

// Icône inline alignée avec le texte (utilisé dans les coordonnées).
const inlineIcon = { display: 'inline-block', verticalAlign: '-3px', marginRight: 8, flexShrink: 0 }

const NAV = [
  ['/', 'Accueil'],
  ['/histoire', 'Histoire'],
  ['/commander', 'Commander'],
  ['/contact', 'Contact'],
]

const LEGAL = [
  ['/mentions-legales', 'Mentions légales'],
  ['/cgv', 'CGV'],
  ['/cgu', 'CGU'],
  ['/politique-confidentialite', 'Confidentialité'],
  ['/politique-cookies', 'Cookies'],
]

export default function Footer() {
  const cfg = useConfig()
  const phone = cfg?.phone || RESTAURANT.phone
  const email = cfg?.email || RESTAURANT.email
  const slogan = cfg?.slogan || RESTAURANT.slogan
  const addr = cfg?.address || RESTAURANT.address

  return (
    <footer style={{ borderTop: '2px solid rgba(255,214,0,0.15)', background: '#000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 20px' }}>
        <div className="foot-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <img src="/logo.png" alt="O'77" style={{ height: 56, width: 'auto', display: 'block', marginBottom: 16 }} />
            <p style={{ color: '#888', fontSize: '0.75rem', lineHeight: 1.9, maxWidth: 260, marginTop: 12 }}>
              Fast-food &amp; pizzeria à Pontault-Combault. Sandwichs artisanaux, pizzas, produits frais. Ouvert 7j/7 jusqu'à 1h du mat'.
            </p>
            <p style={{ color: '#FFD600', fontFamily: 'Oswald', fontSize: '0.8rem', marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              « {slogan} »
            </p>
            <SocialLinks size={36} style={{ marginTop: 20 }} />
          </div>

          <div>
            <h4 style={{ color: '#FFD600', fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>Contact</h4>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(addr.street + ' ' + addr.postalCode)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', color: '#888', fontSize: '0.8rem', textDecoration: 'none', marginBottom: 12, lineHeight: 1.6 }}>
              <MapPin size={13} style={inlineIcon} /> <span>{addr.street}<br />{addr.postalCode} {addr.city}</span>
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: '0.8rem', textDecoration: 'none' }}><Phone size={13} style={inlineIcon} /> {phone}</a>
            <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: '0.8rem', textDecoration: 'none', marginTop: 12 }}><Mail size={13} style={inlineIcon} /> {email}</a>
          </div>

          <div>
            <h4 style={{ color: '#FFD600', fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>Horaires</h4>
            <div style={{ fontSize: '0.8rem', marginBottom: 8 }}>
              <span style={{ color: '#888' }}>Lun — Dim</span> <span style={{ fontWeight: 600, marginLeft: 8 }}>{RESTAURANT.hoursLabel}</span>
            </div>
            <div style={{ marginTop: 12 }}><OpenStatus /></div>
          </div>

          <div>
            <h4 style={{ color: '#FFD600', fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NAV.map(([h, l]) => (
                <Link key={h} href={h} style={{ color: '#888', fontSize: '0.8rem', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ color: '#333', fontSize: '0.7rem' }}>© 2026 O'77 — Tous droits réservés</span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {LEGAL.map(([h, l]) => (
              <Link key={h} href={h} style={{ color: '#555', fontSize: '0.7rem', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
