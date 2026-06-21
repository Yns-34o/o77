import { useState } from 'react'
import { fmtP, hasSale } from '@/lib/format'

// Emoji de repli par catégorie si l'image ne charge pas.
const CAT_EMOJI = {
  pizzas: '🍕',
  sandwichs: '🥪',
  accompagnements: '🍟',
  boissons: '🥤',
}

// Carte produit premium — clic => ouvre la modale détail.
// L'image est protégée par un repli élégant (onError) : en cas d'URL
// indisponible, un pavé brandé (dégradé noir/jaune + emoji) s'affiche
// à la place d'une icône d'image cassée.
export default function ProductCard({ product, index = 0, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const sale = hasSale(product)
  const emoji = CAT_EMOJI[product.category] || '🍽️'

  return (
    <article
      className="product-card"
      onClick={() => onOpen(product)}
      style={{
        animationDelay: `${Math.min(index, 8) * 0.06}s`,
        background: '#0e0e0e',
        border: '1px solid #1c1c1c',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="product-card__media">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="product-card__img"
          />
        ) : (
          <div className="product-card__fallback" aria-label={product.name}>
            <span className="product-card__fallback-emoji">{emoji}</span>
          </div>
        )}

        <div className="product-card__sheen" />

        {product.badge && (
          <span className="product-card__badge">{product.badge}</span>
        )}

        {sale && <span className="product-card__deal">PROMO</span>}

        <span className="product-card__view">Voir le plat →</span>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__foot">
          <div className="product-card__price">
            {sale ? (
              <>
                <span className="product-card__price-old">{fmtP(product.price)}</span>
                <span className="product-card__price-now">{fmtP(product.salePrice)}</span>
              </>
            ) : (
              <span className="product-card__price-now">{fmtP(product.price)}</span>
            )}
          </div>
          <span className="product-card__dot" />
        </div>
      </div>
    </article>
  )
}
