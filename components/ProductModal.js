import { useEffect } from 'react'
import { fmtP, hasSale } from '@/lib/format'

const CAT_LABELS = {
  pizzas: 'Pizza',
  sandwichs: 'Sandwich',
  accompagnements: 'Accompagnement',
  boissons: 'Boisson',
}

// Modale détail produit — pas de panier : CTA vers Deliveroo.
export default function ProductModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [product, onClose])

  if (!product) return null
  const sale = hasSale(product)

  return (
    <div className="modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ position: 'relative', overflow: 'hidden', background: '#111' }}>
            <img src={product.image} alt={product.name} className="modal-img" style={{ width: '100%', height: 300, objectFit: 'cover' }} />
          </div>
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
            <button onClick={onClose} aria-label="Fermer" style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20, marginBottom: 16 }}>✕</button>
            <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              {CAT_LABELS[product.category] || 'Produit'}
            </span>
            <h2 style={{ fontFamily: 'Oswald', fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 12 }}>{product.name}</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 16 }}>{product.description}</p>

            {product.allergens && product.allergens.length > 0 && (
              <p style={{ color: '#666', fontSize: '0.7rem', marginBottom: 16 }}>
                <strong style={{ color: '#888' }}>Allergènes :</strong> {product.allergens.join(', ')}
              </p>
            )}

            <div style={{ fontFamily: 'Oswald', fontSize: '2.2rem', color: '#FFD600', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              {sale ? (
                <>
                  <span style={{ color: '#555', textDecoration: 'line-through', fontSize: '1.2rem' }}>{fmtP(product.price)}</span>
                  {fmtP(product.salePrice)}
                </>
              ) : fmtP(product.price)}
            </div>

            <p style={{ marginTop: 'auto', color: '#666', fontSize: '0.72rem', lineHeight: 1.6, paddingTop: 16, borderTop: '1px solid #1c1c1c' }}>
              Commande centralisée via le bouton <strong style={{ color: '#FFD600' }}>Commander</strong> en haut de page (livraison Deliveroo ou Click &amp; Collect).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
