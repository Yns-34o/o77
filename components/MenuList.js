import MenuSection from './MenuSection'

// Affiche toutes les catégories, chacune avec ses produits.
export default function MenuList({ categories, products, onOpen }) {
  return (
    <>
      {categories.map((cat) => (
        <MenuSection key={cat.id} category={cat} products={products.filter((p) => p.category === cat.id)} onOpen={onOpen} />
      ))}
    </>
  )
}
