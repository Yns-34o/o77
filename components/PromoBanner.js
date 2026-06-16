import { useState } from 'react'

// Bannière promo (jaune) affichée sur la home. Fermable par le visiteur.
export default function PromoBanner({ text }) {
  const [show, setShow] = useState(true)
  if (!show || !text) return null
  return (
    <div style={{
      background: '#FFD600', color: '#000', padding: '12px 48px', textAlign: 'center',
      fontFamily: 'Oswald', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      fontSize: '0.9rem', position: 'relative',
    }}>
      {text}
      <button
        onClick={() => setShow(false)}
        aria-label="Fermer"
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontSize: 20, fontWeight: 700 }}
      >
        ✕
      </button>
    </div>
  )
}
