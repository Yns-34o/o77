import { useState } from 'react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import JsonLd from '@/components/JsonLd'
import MenuList from '@/components/MenuList'
import ProductModal from '@/components/ProductModal'
import { getMenu } from '@/lib/site-data'
import { hasSale } from '@/lib/format'

function buildMenuSchema(categories, products) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: "Carte O'77",
    inLanguage: 'fr-FR',
    hasMenuSection: categories.map((cat) => ({
      '@type': 'MenuSection',
      name: cat.label,
      hasMenuItem: products
        .filter((p) => p.category === cat.id)
        .map((p) => ({
          '@type': 'MenuItem',
          name: p.name,
          description: p.description,
          suitableForDiet: p.allergens && p.allergens.length === 0 ? 'https://schema.org/VegetarianDiet' : undefined,
          offers: {
            '@type': 'Offer',
            price: String(hasSale(p) ? p.salePrice : p.price),
            priceCurrency: 'EUR',
          },
        })),
    })),
  }
}

export default function Carte({ categories, products }) {
  const [selected, setSelected] = useState(null)
  const menuSchema = buildMenuSchema(categories, products)

  return (
    <>
      <Seo
        title="Notre Carte — Fast-food & Pizzeria Pontault-Combault | O'77"
        description="Découvrez la carte O'77 : pizzas fait maison, sandwichs, naans, accompagnements, boissons. Fast-food à Pontault-Combault (77340). Prix à partir de 2,50 €."
        path="/carte"
      />
      <JsonLd data={menuSchema} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>La Carte</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '4rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>NOS SAVEURS</h1>
        </Reveal>

        <Reveal>
          <MenuList categories={categories} products={products} onOpen={setSelected} />
        </Reveal>

        <p style={{ color: '#555', fontSize: '0.7rem', marginTop: 48, textAlign: 'center', lineHeight: 1.7 }}>
          ⚠ La liste des allergènes est disponible sur demande auprès de notre personnel. Conformément au règlement (UE) n°1169/2011 (INCO), les informations obligatoires sont affichées sur place.
        </p>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export async function getServerSideProps() {
  const { categories, products } = await getMenu()
  return { props: { categories, products } }
}
