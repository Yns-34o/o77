import { Info } from 'lucide-react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import ProductCard from '@/components/ProductCard'
import { getMenu } from '@/lib/site-data'
import { DELIVEROO_URL } from '@/lib/constants'

export default function Commander({ products, deliverooUrl }) {
  return (
    <>
      <Seo
        title="Commander — Fast-food en livraison Pontault-Combault | O'77"
        description="Commandez chez O'77 à Pontault-Combault. Pizzas, sandwichs, naans livrés via Deliveroo. Retrouvez toute la carte et finalisez votre commande sur Deliveroo."
        path="/commander"
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ marginBottom: 32 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Commander</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>COMPOSE TON REPAS</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 16, maxWidth: 620 }}>
            La commande se finalise sur <strong style={{ color: '#FFD600' }}>Deliveroo</strong>. Choisis tes plats, puis clique pour être redirigé vers la plateforme.
          </p>
        </Reveal>

        {/* CTA principal — Deliveroo */}
        <Reveal>
          <a href={deliverooUrl} target="_blank" rel="noopener noreferrer" className="btn-jaune" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 36px', marginBottom: 24, fontSize: '1rem' }}>
            <iconify-icon icon="simple-icons:deliveroo" width="22" /> Commander maintenant sur Deliveroo →
          </a>
        </Reveal>

        {/* Note professionnelle : la carte détaillée vit sur Deliveroo */}
        <Reveal>
          <div className="cmd-note" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#111', border: '1px solid rgba(255,214,0,0.25)', borderLeft: '3px solid #FFD600', padding: '20px 24px', marginBottom: 16 }}>
            <Info size={20} style={{ color: '#FFD600', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.85rem' }}>Carte complète sur Deliveroo</strong>
              <p style={{ color: '#999', fontSize: '0.82rem', lineHeight: 1.7, marginTop: 8, maxWidth: 720 }}>
                Pour consulter l'intégralité de nos produits — compositions détaillées, options, allergènes et prix en vigueur — cliquez sur le lien <a href={deliverooUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD600', textDecoration: 'underline' }}>Deliveroo</a> ci-dessus. La sélection, le panier et le paiement s'y finalisent directement, en livraison ou à emporter.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Vitrine produits (aperçu visuel, non cliquable) */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '56px 0 24px' }}>
            <span style={{ width: 30, height: 2, background: '#FFD600', display: 'block' }} />
            <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '1.05rem' }}>Aperçu de la carte</h2>
          </div>
        </Reveal>
        <div className="shop-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} displayOnly />
          ))}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const { products, config } = await getMenu()
  const deliverooUrl = (config?.delivery && config.delivery.deliveroo) || DELIVEROO_URL
  return { props: { products, deliverooUrl } }
}
