import ProductCard from './ProductCard'
import CategoryIcon from './CategoryIcon'

// Une catégorie + ses produits, rendus en grille de cartes image (style premium).
// Affiche en tête de section une bannière photo (image de catégorie) en lazy-loading,
// puis le titre et la note éventuelle (ex. "Menu servi avec frites et boisson").
export default function MenuSection({ category, products, index = 0, onOpen }) {
  if (!products || products.length === 0) return null
  const count = products.length

  return (
    <section id={`cat-${category.id}`} className="menusection" style={{ scrollMarginTop: 130 }}>
      {/* Bannière photo de la catégorie (lazy-loading) */}
      {category.image && (
        <div style={{ position: 'relative', marginBottom: 20, borderRadius: 14, overflow: 'hidden', height: 170 }}>
          <img
            src={category.image}
            alt={category.label}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)' }} />
          <div style={{ position: 'absolute', left: 20, bottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CategoryIcon category={category.id} size={22} strokeWidth={2} style={{ color: '#FFD600' }} />
            <span style={{ color: '#fff', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '1.1rem' }}>{category.label}</span>
          </div>
        </div>
      )}

      <header className="menusection__head">
        <span className="menusection__index">0{index + 1}</span>
        <div className="menusection__heading">
          <CategoryIcon category={category.id} size={26} strokeWidth={1.75} className="menusection__icon" />
          <h2 className="menusection__title">{category.label}</h2>
        </div>
        <span className="menusection__count">{count} produit{count > 1 ? 's' : ''}</span>
        <span className="menusection__rule" />
      </header>

      {category.note && (
        <p style={{ color: '#FFD600', fontSize: '0.78rem', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '-8px 0 18px' }}>
          {category.note}
        </p>
      )}

      <div className="menusection__grid">
        {products.map((pr, i) => (
          <ProductCard key={pr.id} product={pr} index={i} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
