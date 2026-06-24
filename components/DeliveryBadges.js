import { DELIVEROO_URL } from '@/lib/constants'
import Reveal from './Reveal'

// Badges de livraison — liens pilotés par la config (dashboard > Infos > Livraison).
export default function DeliveryBadges({ config }) {
  const deliveroo = config?.delivery?.deliveroo || DELIVEROO_URL
  const ubereats = config?.delivery?.ubereats
  const justeat = config?.delivery?.justeat

  const linkStyle = {
    textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8, transition: 'transform 0.2s',
  }

  return (
    <Reveal style={{ padding: '64px 0', borderTop: '1px solid #1c1c1c' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
        <span style={{ color: '#888', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 28 }}>
          Commande en livraison
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
          <a href={deliveroo} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
            <iconify-icon icon="simple-icons:deliveroo" width="36" style={{ color: '#888' }} />
            <span style={{ fontSize: 9, color: '#555', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deliveroo</span>
          </a>
          {ubereats && (
            <>
              <div style={{ width: 1, height: 40, background: '#1c1c1c' }} />
              <a href={ubereats} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                <iconify-icon icon="simple-icons:ubereats" width="36" style={{ color: '#888' }} />
                <span style={{ fontSize: 9, color: '#555', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Uber Eats</span>
              </a>
            </>
          )}
          {justeat && (
            <>
              <div style={{ width: 1, height: 40, background: '#1c1c1c' }} />
              <a href={justeat} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                <iconify-icon icon="simple-icons:justeat" width="36" style={{ color: '#888' }} />
                <span style={{ fontSize: 9, color: '#555', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Just Eat</span>
              </a>
            </>
          )}
        </div>
        <p style={{ color: '#555', fontSize: '0.7rem', marginTop: 24 }}>Commande aussi sur place ou en Click &amp; Collect.</p>
      </div>
    </Reveal>
  )
}
