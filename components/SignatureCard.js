import { useState } from 'react'
import { Flame, ArrowRight } from 'lucide-react'
import { fmtP, hasSale } from '@/lib/format'
import CategoryIcon from './CategoryIcon'

// Carte "signature" premium — mise en avant des plats featured en haut de la carte.
// Grande photo, badge, nom, description courte, prix et invitation au clic (=> modale).
export default function SignatureCard({ product, index = 0, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const sale = hasSale(product)

  return (
    <article
      className="sig-card"
      onClick={() => onOpen(product)}
      style={{ animationDelay: `${Math.min(index, 6) * 0.08}s` }}
    >
      <div className="sig-card__media">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="sig-card__img"
          />
        ) : (
          <div className="sig-card__fallback" aria-label={product.name}>
            <CategoryIcon category={product.category} size={72} strokeWidth={1.5} className="product-card__fallback-icon" />
          </div>
        )}

        <div className="sig-card__shade" />

        {product.badge && (
          <span className="sig-card__badge">
            <Flame size={12} style={{ display: 'inline-block', verticalAlign: '-1px' }} />
            {product.badge}
          </span>
        )}

        <span className="sig-card__price">{fmtP(sale ? product.salePrice : product.price)}</span>
      </div>

      <div className="sig-card__body">
        <h3 className="sig-card__name">{product.name}</h3>
        <p className="sig-card__desc">{product.description}</p>
        <span className="sig-card__cta">
          Découvrir
          <ArrowRight size={14} />
        </span>
      </div>
    </article>
  )
}
