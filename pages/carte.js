import { useState } from 'react'
import Seo from '@/components/Seo'
import MenuSection from '@/components/MenuSection'
import ProductModal from '@/components/ProductModal'
import { getMenu } from '@/lib/site-data'

// Page « Voir la carte » : tout le menu réel, classé par catégorie.
// Réutilise MenuSection (cartes cliquables -> ProductModal pour le détail).
export default function Carte({ products, categories }) {
  const [selected, setSelected] = useState(null)
  const cats = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  return (
    <>
      <Seo
        title="La Carte — Pizzas, Burgers, Tacos, Sandwichs, Paninis | O'77"
        description="Toute la carte d'O'77 à Pontault-Combault : pizzas fait maison, burgers, tacos M/L/XL, sandwichs, tex-max et paninis. Commande en livraison ou à emporter."
        path="/carte"
      />

      {/* En-tête */}
      <div style={{ paddingTop: 120, paddingBottom: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>La Carte</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>TOUS NOS PLATS</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 16, maxWidth: 620 }}>
            Pizzas fait maison, burgers généreux, tacos M/L/XL, sandwichs artisanaux, tex-max et paninis. Tu composes, puis tu commandes en livraison ou à emporter.
          </p>
        </div>
      </div>

      {/* Barre sticky d'ancres catégories */}
      <nav className="carte-nav" aria-label="Catégories de la carte">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 10, overflowX: 'auto' }}>
          {cats.map((c) => (
            <a key={c.id} href={`#cat-${c.id}`} className="carte-nav__pill">
              <span aria-hidden="true">{c.icon}</span> {c.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Sections par catégorie */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 80px' }}>
        {cats.map((cat, i) => {
          const items = products.filter((p) => p.category === cat.id)
          if (!items.length) return null
          return <MenuSection key={cat.id} category={cat} products={items} index={i} onOpen={setSelected} />
        })}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export async function getServerSideProps() {
  const { products, categories } = await getMenu()
  return { props: { products, categories } }
}
