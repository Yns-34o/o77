import { useEffect, useState } from 'react'

// Barre de navigation par catégorie, collante sous le header.
// - Clic : défilement doux vers la section (avec décalage pour header + barre).
// - Scroll-spy : la catégorie active est mise en surbrillance via IntersectionObserver.
export default function CategoryNav({ categories }) {
  const [active, setActive] = useState(categories[0]?.id || null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter(Boolean)
    if (!sections.length) return

    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          setActive(visible[0].target.id.replace('cat-', ''))
        }
      },
      // Déclenche quand le haut d'une section entre/sort de la zone sous la barre collante.
      { rootMargin: '-140px 0px -65% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    sections.forEach((s) => spy.observe(s))

    const onScroll = () => setStuck(window.scrollY > 240)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      spy.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [categories])

  const goTo = (id) => {
    const el = document.getElementById(`cat-${id}`)
    if (!el) return
    // Header fixe (~72px) + barre collante (~56px) + respiration.
    const top = el.getBoundingClientRect().top + window.scrollY - 130
    window.scrollTo({ top, behavior: 'smooth' })
    setActive(id)
  }

  return (
    <div className={`catnav ${stuck ? 'is-stuck' : ''}`}>
      <div className="catnav__inner">
        <nav className="catnav__list" aria-label="Catégories de la carte">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => goTo(c.id)}
              className={`catnav__btn ${active === c.id ? 'is-active' : ''}`}
            >
              <span className="catnav__icon" aria-hidden="true">{c.icon}</span>
              {c.label}
              <span className="catnav__underline" />
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
