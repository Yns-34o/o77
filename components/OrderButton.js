import { useState } from 'react'
import OrderModal from './OrderModal'

// Plateformes de livraison connues (icône simple-icons + libellé).
const PLATFORMS = [
  { key: 'deliveroo', label: 'Deliveroo', icon: 'simple-icons:deliveroo' },
  { key: 'ubereats', label: 'Uber Eats', icon: 'simple-icons:ubereats' },
  { key: 'justeat', label: 'Just Eat', icon: 'simple-icons:justeat' },
]

// Bouton « Commander » adaptatif.
//   delivery = { deliveroo?, ubereats?, justeat? }  (URLs, éventuellement vides)
//   - 0 plateforme  -> libellé désactivé « Commande bientôt en ligne »
//   - 1 plateforme  -> <a> direct vers cette plateforme (SSR-friendly)
//   - 2+ plateformes -> <button> qui ouvre la modale de choix (OrderModal)
// La classe (btn-jaune / btn-outline) et le libellé sont pilotés par props.
export default function OrderButton({ delivery = {}, className = 'btn-jaune', label = 'Commander', disabledLabel = 'Commande bientôt en ligne', style }) {
  const [open, setOpen] = useState(false)
  const platforms = PLATFORMS
    .map((p) => ({ ...p, url: delivery && delivery[p.key] }))
    .filter((p) => p.url)

  if (platforms.length === 0) {
    // Aucune plateforme configurée -> le bouton disparaît (au lieu d'un libellé désactivé).
    return null
  }

  if (platforms.length === 1) {
    return (
      <a href={platforms[0].url} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {label}
      </a>
    )
  }

  // 2+ plateformes -> modale de choix
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {label}
      </button>
      {open && <OrderModal platforms={platforms} onClose={() => setOpen(false)} />}
    </>
  )
}
