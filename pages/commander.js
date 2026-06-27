import Link from 'next/link'
import { Info, Phone } from 'lucide-react'
import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'
import ProductCard from '@/components/ProductCard'
import OrderButton from '@/components/OrderButton'
import { getMenu } from '@/lib/site-data'
import { RESTAURANT } from '@/lib/constants'

export default function Commander({ products, delivery, platformCount }) {
  const featured = products.filter((p) => p.featured).slice(0, 8)

  return (
    <>
      <Seo
        title="Commander — Fast-food en livraison Pontault-Combault | O'77"
        description="Commandez chez O'77 à Pontault-Combault. Pizzas, burgers, tacos, sandwichs livrés via Deliveroo, Uber Eats ou Just Eat. Toute la carte sur le site."
        path="/commander"
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ marginBottom: 32 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Commander</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>COMPOSE TON REPAS</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 16, maxWidth: 620 }}>
            {platformCount >= 2
              ? "Choisis tes plats dans la carte, puis finalise ta commande sur ta plateforme de livraison préférée."
              : platformCount === 1
                ? "Choisis tes plats dans la carte, puis finalise ta commande sur notre plateforme de livraison."
                : "Découvre toute notre carte ci-dessous. La commande en ligne arrive bientôt — en attendant, passe commande par téléphone !"}
          </p>
        </Reveal>

        {/* CTA adaptatif selon le nombre de plateformes configurées */}
        {platformCount === 0 ? (
          <Reveal>
            <div className="cmd-note" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#111', border: '1px solid rgba(255,214,0,0.25)', borderLeft: '3px solid #FFD600', padding: '20px 24px', marginBottom: 16 }}>
              <Phone size={20} style={{ color: '#FFD600', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.85rem' }}>Commande en ligne bientôt disponible</strong>
                <p style={{ color: '#999', fontSize: '0.82rem', lineHeight: 1.7, marginTop: 8, maxWidth: 720 }}>
                  En attendant, appelle-nous au <a href={RESTAURANT.phoneHref} style={{ color: '#FFD600', textDecoration: 'underline' }}>{RESTAURANT.phone}</a> ou passe nous voir au {RESTAURANT.address.street}, {RESTAURANT.address.city}.
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <OrderButton
              delivery={delivery}
              className="btn-jaune"
              label={platformCount >= 2 ? 'Choisir ma plateforme' : 'Commander maintenant'}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 36px', marginBottom: 24, fontSize: '1rem' }}
            />
          </Reveal>
        )}

        {/* Note : la carte détaillée vit sur les plateformes */}
        <Reveal>
          <div className="cmd-note" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#111', border: '1px solid rgba(255,214,0,0.25)', borderLeft: '3px solid #FFD600', padding: '20px 24px', marginBottom: 16 }}>
            <Info size={20} style={{ color: '#FFD600', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.85rem' }}>{platformCount >= 2 ? 'Plusieurs plateformes de livraison' : 'Carte complète sur la plateforme'}</strong>
              <p style={{ color: '#999', fontSize: '0.82rem', lineHeight: 1.7, marginTop: 8, maxWidth: 720 }}>
                Pour les compositions détaillées, options, allergènes et prix en vigueur, finalise ta commande via le bouton ci-dessus. Tu peux aussi consulter <Link href="/carte" style={{ color: '#FFD600', textDecoration: 'underline' }}>toute la carte</Link> sur le site, en livraison ou à emporter.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Vitrine produits (aperçu visuel, non cliquable) */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '56px 0 24px' }}>
            <span style={{ width: 30, height: 2, background: '#FFD600', display: 'block' }} />
            <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '1.05rem' }}>Quelques incontournables</h2>
          </div>
        </Reveal>
        <div className="shop-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} displayOnly />
          ))}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const { products, config } = await getMenu()
  const delivery = config?.delivery || {}
  const platformCount = ['deliveroo', 'ubereats', 'justeat'].filter((k) => delivery[k]).length
  // ISR : régénération au max toutes les 10 min + à la demande après modif dashboard.
  return { props: { products, delivery, platformCount }, revalidate: 600 }
}
