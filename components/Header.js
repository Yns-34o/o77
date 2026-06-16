import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NAV_LINKS } from '@/lib/constants'

export default function Header() {
  const router = useRouter()
  const isHome = router.pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const solid = scrolled || !isHome
  const hdrStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.3s',
    background: solid ? 'rgba(0,0,0,0.95)' : 'transparent',
    backdropFilter: solid ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: solid ? 'blur(10px)' : 'none',
    borderBottom: solid ? '2px solid #FFD600' : 'none',
  }

  const close = () => setMenuOpen(false)

  return (
    <>
      <header id="hdr" style={hdrStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" onClick={close} style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="O'77 — Fast-food Pontault-Combault" style={{ height: 52, width: 'auto', display: 'block' }} />
          </Link>

          <nav className="desk-nav" style={{ alignItems: 'center', gap: 28 }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ccc', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
            <Link href="/commander" className="btn-jaune" style={{ fontSize: '0.75rem', padding: '10px 24px' }}>
              Commander
            </Link>
          </nav>

          <button className="mob-btn" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24 }}>
            ☰
          </button>
        </div>
      </header>

      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        <button onClick={close} aria-label="Fermer le menu" style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 28 }}>✕</button>
        <Link href="/" onClick={close} style={{ fontFamily: 'Oswald', fontSize: '2rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Accueil</Link>
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} style={{ fontFamily: 'Oswald', fontSize: '2rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {l.label}
          </Link>
        ))}
        <div style={{ width: 60, height: 2, background: '#FFD600', margin: '8px 0' }} />
        <Link href="/commander" onClick={close} className="btn-jaune">Commander</Link>
      </div>
    </>
  )
}
