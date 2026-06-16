import { fmtP, hasSale } from '@/lib/format'

// Carte produit — clic => ouvre la modale détail.
export default function ProductCard({ product, onOpen }) {
  const sale = hasSale(product)
  return (
    <div className="product-card" style={{ background: '#111', border: '1px solid #1c1c1c', overflow: 'hidden' }} onClick={() => onOpen(product)}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }}
        />
        {product.badge && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#FFD600', color: '#000', fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
            {product.badge}
          </span>
        )}
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'Oswald', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 4 }}>{product.name}</h3>
        <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {sale ? (
            <>
              <span style={{ color: '#555', textDecoration: 'line-through', fontSize: '0.9rem' }}>{fmtP(product.price)}</span>
              <span style={{ fontFamily: 'Oswald', fontSize: '1.5rem', color: '#FFD600' }}>{fmtP(product.salePrice)}</span>
            </>
          ) : (
            <span style={{ fontFamily: 'Oswald', fontSize: '1.5rem', color: '#FFD600' }}>{fmtP(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
