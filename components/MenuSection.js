import { fmtP, hasSale } from '@/lib/format'

// Une catégorie + ses produits (style liste, porté de la maquette buildMenu).
export default function MenuSection({ category, products, onOpen }) {
  if (!products || products.length === 0) return null
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'Oswald', fontSize: '1.6rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {category.icon} {category.label}
        </h2>
        <div style={{ flex: 1, height: 1, background: '#1c1c1c' }} />
      </div>

      {products.map((pr) => {
        const sale = hasSale(pr)
        return (
          <div
            key={pr.id}
            onClick={() => onOpen(pr)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(28,28,28,0.5)', cursor: 'pointer', transition: 'padding 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.paddingLeft = '12px')}
            onMouseOut={(e) => (e.currentTarget.style.paddingLeft = '0')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 8, height: 8, background: 'rgba(255,214,0,0.3)', display: 'block' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {pr.name}
                  {pr.badge && <span style={{ color: '#FFD600', fontSize: '0.65rem', fontFamily: 'Oswald', fontWeight: 700, marginLeft: 8 }}>{pr.badge}</span>}
                </div>
                <div style={{ color: '#888', fontSize: '0.7rem', marginTop: 2 }}>{pr.description}</div>
              </div>
            </div>
            <span style={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#FFD600', whiteSpace: 'nowrap', marginLeft: 16 }}>
              {sale ? (
                <>
                  {fmtP(pr.salePrice)} <span style={{ color: '#555', textDecoration: 'line-through', fontSize: '0.8rem' }}>{fmtP(pr.price)}</span>
                </>
              ) : (
                fmtP(pr.price)
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
