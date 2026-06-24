import { useState } from 'react'
import { Flame } from 'lucide-react'
import { priceDisplay, priceSale } from '@/lib/format'
import CategoryIcon from './CategoryIcon'

// Carte produit premium — clic => ouvre la modale détail.
// displayOnly=true => carte « vitrine » (non interactive) : pas de clic, pas
// d'overlay « Voir le plat ». Utilisé sur la page Commander.
// L'image est protégée par un repli élégant (onError) : en cas d'URL
// indisponible, un pavé brandé (dégradé noir/jaune + icône Lucide) s'affiche
// à la place d'une icône d'image cassée.
export default function ProductCard({ product, index = 0, onOpen, displayOnly = false }) {
  const [imgError, setImgError] = useState(false)
  const sale = priceSale(product) // {old,now} si promo, sinon null

  return (
    <article
      className={`product-card${displayOnly ? ' product-card--static' : ''}`}
      onClick={displayOnly ? undefined : () => onOpen(product)}
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
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="product-card__img"
          />
        ) : (
          <div className="product-card__fallback" aria-label={product.name}>
            <CategoryIcon category={product.category} size={64} strokeWidth={1.5} className="product-card__fallback-icon" />
          </div>
        )}

        <div className="product-card__sheen" />

        {product.badge && (
          <span className="product-card__badge">
            <Flame size={11} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: 5 }} />
            {product.badge}
          </span>
        )}

        {sale && <span className="product-card__deal">PROMO</span>}

        {!displayOnly && <span className="product-card__view">Voir le plat →</span>}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__foot">
          <div className="product-card__price">
            {sale ? (
              <>
                <span className="product-card__price-old">{sale.old}</span>
                <span className="product-card__price-now">{sale.now}</span>
              </>
            ) : (
              <span className={`product-card__price-now${product.priceLabel ? ' product-card__price-now--label' : ''}`}>{priceDisplay(product)}</span>
            )}
          </div>
          <span className="product-card__dot" />
        </div>
      </div>
    </article>
  )
}
