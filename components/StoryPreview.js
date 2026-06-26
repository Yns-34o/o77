import Link from 'next/link'
import Reveal from './Reveal'

export default function StoryPreview() {
  return (
    <Reveal style={{ padding: '80px 0', borderTop: '1px solid #1c1c1c' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="hist-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <img
              src="/photo-resto.jpg"
              alt="Le restaurant O'77 à Pontault-Combault"
              loading="lazy"
              style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div>
            <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              Notre Story
            </span>
            <h2 style={{ fontFamily: 'Oswald', fontSize: '2.8rem', textTransform: 'uppercase', marginBottom: 20, letterSpacing: '-0.01em' }}>
              Pas juste<br />du fast-food.
            </h2>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 2, marginBottom: 28 }}>
              O'77 c'est le spot où la pâte à pizza est travaillée maison, où les naans sont pétris à la main, où chaque sauce est notre créa. Pas de chaînes industrielles. Juste du bon, du frais, du lourd. Ouvert jusqu'à 1h du mat' parce que la faim, elle dort jamais.
            </p>
            <Link href="/histoire" className="btn-outline">Lire l'histoire</Link>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
