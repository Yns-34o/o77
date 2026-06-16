export default function Marquee() {
  const text =
    "★ OUVERT 7J/7 JUSQU'À 1H ★ FAST-FOOD & PIZZERIA ★ PIZZAS FAIT MAISON ★ SANDWICHS ARTISANAUX ★ NAANS DORÉS ★ LIVRAISON DELIVEROO ★ PONTAULT-COMBAULT ★ O'77 ★"
  return (
    <div style={{ padding: '12px 0', background: '#FFD600', overflow: 'hidden' }}>
      <div className="marquee-inner">
        <span style={{ fontFamily: 'Oswald', color: '#000', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', padding: '0 24px' }}>{text}</span>
        <span style={{ fontFamily: 'Oswald', color: '#000', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', padding: '0 24px' }}>{text}</span>
      </div>
    </div>
  )
}
