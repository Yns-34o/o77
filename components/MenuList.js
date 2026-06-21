import MenuSection from './MenuSection'

// Affiche toutes les catégories, chacune avec ses produits en grille.
export default function MenuList({ categories, products, onOpen }) {
  return (
    <>
      {categories.map((cat, i) => (
        <MenuSection
          key={cat.id}
          category={cat}
          index={i}
          products={products.filter((p) => p.category === cat.id)}
          onOpen={onOpen}
        />
      ))}
    </>
  )
}
