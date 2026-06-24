import { useEffect } from 'react'

// Modale de choix de plateforme de livraison (Deliveroo / Uber Eats / Just Eat).
// `platforms` : [{ key, url, label, icon }, ...]. Au clic, ouvre l'URL dans un
// nouvel onglet puis ferme la modale. Fermeture : clic hors zone + Échap.
export default function OrderModal({ platforms = [], onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!platforms.length) return null

  const go = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: 440, padding: 32, textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} aria-label="Fermer" style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 22 }}>✕</button>
        <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block' }}>
          Commander en livraison
        </span>
        <h2 style={{ fontFamily: 'Oswald', fontSize: '1.7rem', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '10px 0 6px' }}>Choisis ta plateforme</h2>
        <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: 26 }}>Sélectionne ton application de livraison préférée.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {platforms.map((p) => (
            <button key={p.key} type="button" onClick={() => go(p.url)} className="btn-jaune" style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '16px 22px', fontSize: '1rem' }}>
              <iconify-icon icon={p.icon} width="24" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{p.label}</span>
              <span style={{ opacity: 0.7 }}>↗</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
