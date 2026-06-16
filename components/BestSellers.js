import Reveal from './Reveal'
import ProductCard from './ProductCard'

export default function BestSellers({ products, onOpen }) {
  const featured = products.filter((p) => p.featured).slice(0, 3)
  const list = featured.length ? featured : products.slice(0, 3)
  return (
    <Reveal style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Les Incontournables
          </span>
          <h2 style={{ fontFamily: 'Oswald', fontSize: '2.8rem', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Best-Sellers</h2>
        </div>
        <div className="bs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </Reveal>
  )
}
