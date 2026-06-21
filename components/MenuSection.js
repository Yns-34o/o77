import ProductCard from './ProductCard'

// Une catégorie + ses produits, rendus en grille de cartes image (style premium).
export default function MenuSection({ category, products, index = 0, onOpen }) {
  if (!products || products.length === 0) return null
  const count = products.length

  return (
    <section id={`cat-${category.id}`} className="menusection" style={{ scrollMarginTop: 130 }}>
      <header className="menusection__head">
        <span className="menusection__index">0{index + 1}</span>
        <div className="menusection__heading">
          <span className="menusection__icon" aria-hidden="true">{category.icon}</span>
          <h2 className="menusection__title">{category.label}</h2>
        </div>
        <span className="menusection__count">{count} produit{count > 1 ? 's' : ''}</span>
        <span className="menusection__rule" />
      </header>

      <div className="menusection__grid">
        {products.map((pr, i) => (
          <ProductCard key={pr.id} product={pr} index={i} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
