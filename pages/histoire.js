import { Flame, Leaf, Moon } from 'lucide-react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'

const VALUES = [
  { Icon: Flame, title: 'Fait Maison', text: "Pizzas et naans pétris à la commande, sauces 100% créa, panures maison. Zéro industriel." },
  { Icon: Leaf, title: 'Frais Toujours', text: 'Produits livrés chaque matin, rien de congelé. La qualité, c’est non-négociable.' },
  { Icon: Moon, title: 'Night Food', text: "Ouvert jusqu'à 1h du mat'. Parce que la faim, elle a pas d'heure." },
]

export default function Histoire() {
  return (
    <>
      <Seo title="Notre Histoire — O'77 Street Food & Pizzeria Pontault-Combault" description="L'histoire d'O'77, le spot de fast-food & pizzeria à Pontault-Combault. Pizzas et naans faits maison, produits frais, ouvert jusqu'à 1h." path="/histoire" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ maxWidth: 700, marginBottom: 80 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Notre Story</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '4rem', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 20 }}>
            NÉ DANS<br />LA <span style={{ color: '#FFD600' }}>RUE</span>
          </h1>
          <div style={{ width: 60, height: 3, background: '#FFD600' }} />
        </Reveal>

        <Reveal className="hist-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 80, alignItems: 'center' }}>
          <img src="/histoire-fastfood.webp" alt="O'77 — street food de renom à Pontault-Combault" loading="lazy" style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block', borderRadius: 16, border: '1px solid #1c1c1c' }} />
          <div>
            <h2 style={{ fontFamily: 'Oswald', fontSize: '1.6rem', color: '#FFD600', textTransform: 'uppercase', marginBottom: 20 }}>Le début</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 2, marginBottom: 16 }}>
              O'77, c'est parti d'un truc simple : on en avait marre des fast-foods sans âme. Des sandwichs industriels, des pizzas qui ont voyagé 3 jours en camion, des sauces en sachet.
            </p>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 2 }}>
              Alors on a ouvert au 146 Avenue Charles Rouxel, à Pontault-Combault. Pizzas pétries main, naans dorés, sauces 100% créa. Ouvert 7j/7, jusqu'à 1h du mat', parce que la night hunger, c'est réel. <strong style={{ color: '#FFD600' }}>O'77 par nous, pour vous !</strong>
            </p>
          </div>
        </Reveal>

        <Reveal className="val-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {VALUES.map((v) => (
            <div key={v.title} className="val-card">
              <span className="val-card__icon">
                <v.Icon size={28} strokeWidth={1.75} />
              </span>
              <h3 className="val-card__title">{v.title}</h3>
              <p className="val-card__text">{v.text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </>
  )
}
