import Seo from './Seo'

// Coquille commune aux 5 pages légales (titre + date + zone de contenu).
export default function LegalLayout({ title, path, description, updated, children }) {
  return (
    <>
      <Seo title={`${title} — O'77 Pontault-Combault`} description={description} path={path} />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 80px' }}>
        <h1 className="hero-big" style={{ fontFamily: 'Oswald', fontSize: '2.6rem', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        <p style={{ color: '#666', fontSize: '0.75rem', marginBottom: 40 }}>Dernière mise à jour : {updated}</p>
        <div className="legal-content">{children}</div>
      </div>
    </>
  )
}
