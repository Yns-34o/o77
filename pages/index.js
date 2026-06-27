import { useState } from 'react'
import { Star } from 'lucide-react'
import Seo from '@/components/Seo'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import PromoBanner from '@/components/PromoBanner'
import BestSellers from '@/components/BestSellers'
import StoryPreview from '@/components/StoryPreview'
import DeliveryBadges from '@/components/DeliveryBadges'
import ProductModal from '@/components/ProductModal'
import { getMenu } from '@/lib/site-data'

export default function Home({ products, banner, config }) {
  const [selected, setSelected] = useState(null)

  return (
    <>
      <Seo
        title="O'77 — Fast-food & Pizzeria à Pontault-Combault (77340)"
        description="O'77, fast-food & pizzeria à Pontault-Combault. Pizzas fait maison, sandwichs artisanaux, naans dorés. Ouvert 7j/7 jusqu'à 1h. Commandez sur Deliveroo ou à emporter."
        path="/"
      />

      {banner && <PromoBanner text={banner.text} sticky />}
      <Hero config={config} />
      <Marquee />

      {/* Badge Google */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid #1c1c1c' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div className="g-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
            <span style={{ display: 'inline-flex', color: '#FFD600' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={15} fill="#FFD600" strokeWidth={0} style={{ marginLeft: i ? 2 : 0 }} />
              ))}
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>5,0/5</span>
            <span style={{ color: '#888', fontSize: '0.75rem' }}>Google Reviews</span>
          </div>
        </div>
      </div>

      <BestSellers products={products} onOpen={setSelected} />
      <StoryPreview />
      <DeliveryBadges />

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export async function getStaticProps() {
  // getMenu() applique déjà le deal actif aux produits ET le renvoie dans `deal`
  // (servira de bannière). Un seul accès Firestore au lieu de deux.
  const { products, config, deal } = await getMenu()
  // ISR : page régénérée au max toutes les 10 min, et à la demande (cf. lib/revalidate.js)
  // après chaque modif dans le dashboard -> lecture Firestore au moment de la revalidation seulement.
  return { props: { products, banner: deal, config }, revalidate: 600 }
}
