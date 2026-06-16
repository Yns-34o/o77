import { useState } from 'react'
import Seo from '@/components/Seo'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import PromoBanner from '@/components/PromoBanner'
import BestSellers from '@/components/BestSellers'
import StoryPreview from '@/components/StoryPreview'
import DeliveryBadges from '@/components/DeliveryBadges'
import ProductModal from '@/components/ProductModal'
import { getMenu, getActiveBanner } from '@/lib/site-data'

export default function Home({ products, banner }) {
  const [selected, setSelected] = useState(null)

  return (
    <>
      <Seo
        title="O'77 — Fast-food & Pizzeria à Pontault-Combault (77340)"
        description="O'77, fast-food & pizzeria à Pontault-Combault. Pizzas fait maison, sandwichs artisanaux, naans dorés. Ouvert 7j/7 jusqu'à 1h. Commandez sur Deliveroo ou en Click & Collect."
        path="/"
      />

      <Hero />
      {banner && <PromoBanner text={banner.text} />}
      <Marquee />

      {/* Badge Google */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid #1c1c1c' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div className="g-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
            <span style={{ color: '#FFD600', fontSize: 16 }}>★★★★★</span>
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

export async function getServerSideProps() {
  const { products } = await getMenu()
  const banner = await getActiveBanner()
  return { props: { products, banner } }
}
