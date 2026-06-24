import Link from 'next/link'
import OrderButton from './OrderButton'

// Hero de la page d'accueil — texte piloté par la config (dashboard > Infos).
export default function Hero({ config }) {
  const hero = config?.hero || {}
  const badge = hero.badge || 'Fast-food & Pizzeria — Pontault-Combault'
  const title = hero.title || 'LE GOÛT QUI DÉCHIRE'
  const subtitle = hero.subtitle || "Pizzas fait maison, sandwichs qui tuent, naans dorés. Ouvert 7j/7 jusqu'à 1h du mat'."
  const slogan = config?.slogan || "O'77 par nous, pour vous !"

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end', paddingBottom: 80 }}>
      <img
        src="/imagehero.png"
        alt="O'77 — fast-food & pizzeria à Pontault-Combault"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#000 0%,rgba(0,0,0,0.6) 40%,rgba(0,0,0,0.15) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ maxWidth: 620 }}>
          <div className="anim-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ width: 30, height: 2, background: '#FFD600', display: 'block' }} />
            <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {badge}
            </span>
          </div>
          <h1 className="hero-big anim-up anim-d1" style={{ fontFamily: 'Oswald', fontSize: '4.5rem', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 20 }}>
            O'77<br />{title.includes('<') ? title : <span style={{ color: '#FFD600' }}>{title}</span>}
          </h1>
          <p className="anim-up anim-d2" style={{ color: '#ccc', fontSize: '1rem', lineHeight: 1.7, marginBottom: 14, maxWidth: 440 }}>
            {subtitle} <span style={{ color: '#FFD600', fontWeight: 600 }}>Pontault-Combault.</span>
          </p>
          <p className="anim-up anim-d2" style={{ color: '#FFD600', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 32 }}>
            « {slogan} »
          </p>
          <div className="anim-up anim-d3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/carte" className="btn-jaune">Voir la carte</Link>
            <OrderButton delivery={config?.delivery} className="btn-outline" label="Commander" />
          </div>
        </div>
      </div>
    </div>
  )
}
