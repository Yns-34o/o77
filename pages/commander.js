import { useState } from 'react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import CategoryIcon from '@/components/CategoryIcon'
import { getMenu } from '@/lib/site-data'
import { DELIVEROO_URL } from '@/lib/constants'

export default function Commander({ categories, products }) {
  const [cat, setCat] = useState('all')
  const [selected, setSelected] = useState(null)
  const list = cat === 'all' ? products : products.filter((p) => p.category === cat)
  const cats = [{ id: 'all', label: 'Tout' }, ...categories]

  return (
    <>
      <Seo
        title="Commander — Fast-food en livraison Pontault-Combault | O'77"
        description="Commandez chez O'77 à Pontault-Combault. Pizzas, sandwichs, naans livrés via Deliveroo, ou retirez votre commande en Click & Collect."
        path="/commander"
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ marginBottom: 32 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Commander</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>COMPOSE TON REPAS</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 16, maxWidth: 620 }}>
            La commande se finalise sur <strong style={{ color: '#FFD600' }}>Deliveroo</strong>. Compose ton repas, puis clique pour être redirigé. Click &amp; Collect aussi disponible.
          </p>
        </Reveal>

        <Reveal>
          <a href={DELIVEROO_URL} target="_blank" rel="noopener noreferrer" className="btn-jaune" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 36px', marginBottom: 40, fontSize: '1rem' }}>
            <iconify-icon icon="simple-icons:deliveroo" width="22" /> Commander maintenant sur Deliveroo →
          </a>
        </Reveal>

        <Reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {cats.map((c) => (
            <button key={c.id} className={`fbtn ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #1c1c1c', background: 'none', color: '#888' }}>
              <CategoryIcon category={c.id} size={15} /> {c.label}
            </button>
          ))}
        </Reveal>

        <div className="shop-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={setSelected} />
          ))}
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export async function getServerSideProps() {
  const { categories, products } = await getMenu()
  return { props: { categories, products } }
}
