import Seo from '@/components/Seo'
import Reveal from '@/components/Reveal'

const ITEMS = [
  { src: '/photo-resto.jpg', label: "Le restaurant" },
  { src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=600&fit=crop', label: 'Naan' },
  { src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=380&fit=crop', label: 'Pizza' },
  { src: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&h=380&fit=crop', label: 'Frites' },
  { src: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&h=500&fit=crop', label: 'Poulet' },
  { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=620&fit=crop', label: 'En cuisine' },
  { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=480&fit=crop', label: 'Burger' },
  { src: 'https://images.unsplash.com/photo-1528735602780-2552fd9c8074?w=500&h=520&fit=crop', label: 'Sandwich' },
  { src: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=580&fit=crop', label: 'Milkshake' },
  { src: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=420&fit=crop', label: 'Nuggets' },
  { src: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&h=500&fit=crop', label: 'Limonade' },
]

export default function Galerie() {
  return (
    <>
      <Seo
        title="Galerie — Photos Fast-food & Pizzas | O'77 Pontault-Combault"
        description="Découvrez en photos les pizzas, sandwichs, naans et burgers faits maison d'O'77, fast-food & pizzeria à Pontault-Combault."
        path="/galerie"
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ color: '#FFD600', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Galerie</span>
          <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '4rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>FOOD PORN</h1>
        </Reveal>

        <Reveal>
          <div className="masonry">
            {ITEMS.map((it, i) => (
              <div className="masonry-item" key={i}>
                <img src={it.src} alt={`${it.label} — O'77 Pontault-Combault`} loading="lazy" />
                <div className="masonry-overlay">
                  <span style={{ fontFamily: 'Oswald', fontSize: '1.1rem', color: '#FFD600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{it.label}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </>
  )
}
