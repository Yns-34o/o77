import { useState } from 'react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import JsonLd from '@/components/JsonLd'
import MenuList from '@/components/MenuList'
import CategoryNav from '@/components/CategoryNav'
import ProductModal from '@/components/ProductModal'
import { getMenu } from '@/lib/site-data'
import { hasSale } from '@/lib/format'
import { DELIVEROO_URL } from '@/lib/constants'

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

  const featured = products.filter((p) => p.featured).slice(0, 3)
  const minPrice = products.reduce((m, p) => Math.min(m, hasSale(p) ? p.salePrice : p.price), Infinity)

  return (
    <>
      <Seo
        title="Notre Carte — Fast-food & Pizzeria Pontault-Combault | O'77"
        description="Découvrez la carte O'77 : pizzas fait maison, sandwichs, naans, accompagnements, boissons. Fast-food à Pontault-Combault (77340). Prix à partir de 2,50 €."
        path="/carte"
      />
      <JsonLd data={menuSchema} />

      {/* ===== Hero de la carte ===== */}
      <header className="carte-hero">
        <div className="carte-hero__bg" aria-hidden="true" />
        <div className="carte-hero__glow" aria-hidden="true" />
        <div className="carte-hero__inner">
          <Reveal>
            <span className="carte-hero__eyebrow">La Carte — Pontault-Combault</span>
          </Reveal>
          <Reveal>
            <h1 className="carte-hero__title hero-big">
              NOS <span className="carte-hero__title-accent">SAVEURS</span>
            </h1>
          </Reveal>
          <Reveal>
            <p className="carte-hero__sub">
              Pizzas tournées main, naans dorés minute, accompagnements maison et boissons fraîches.
              Tout est préparé sur place, à commander en livraison ou à emporter.
            </p>
          </Reveal>
          <Reveal>
            <div className="carte-hero__meta">
              <span className="carte-hero__meta-item">
                <strong>{products.length}</strong> plats
              </span>
              <span className="carte-hero__meta-sep" />
              <span className="carte-hero__meta-item">
                dès <strong>{Number(minPrice).toFixed(2).replace('.', ',')} €</strong>
              </span>
              <span className="carte-hero__meta-sep" />
              <span className="carte-hero__meta-item">
                <strong>7j/7</strong> · 11h–01h
              </span>
            </div>
          </Reveal>
          <Reveal>
            <div className="carte-hero__cta">
              <a href={DELIVEROO_URL} target="_blank" rel="noopener noreferrer" className="btn-jaune">
                Commander maintenant →
              </a>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ===== Signatures (mise en avant) ===== */}
      {featured.length > 0 && (
        <section className="carte-featured">
          <Reveal>
            <div className="carte-featured__label">
              <span className="carte-featured__dot" /> Les signatures O'77
            </div>
          </Reveal>
          <div className="carte-featured__row">
            {featured.map((p, i) => (
              <Reveal key={p.id} style={{ flex: '1 1 0', minWidth: 0 }}>
                <button className="feat-chip" onClick={() => setSelected(p)} type="button">
                  <span className="feat-chip__badge">{p.badge || '★'}</span>
                  <span className="feat-chip__name">{p.name}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== Navigation par catégorie (collante) ===== */}
      <CategoryNav categories={categories} />

      {/* ===== La carte ===== */}
      <div className="carte-wrap">
        <MenuList categories={categories} products={products} onOpen={setSelected} />

        <p className="carte-allergens">
          ⚠ La liste des allergènes est disponible sur demande auprès de notre personnel.
          Conformément au règlement (UE) n°1169/2011 (INCO), les informations obligatoires sont affichées sur place.
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
