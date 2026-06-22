import { Pizza, Sandwich, Wheat, GlassWater, UtensilsCrossed } from 'lucide-react'

// Mapping catégorie -> icône premium (Lucide).
// Remplace les emojis (🍕🥪🍟🥤) par des icônes fines et cohérentes.
// Toute catégorie inconnue ou "Tout" retombe sur l'icône couverts.
const MAP = {
  pizzas: Pizza,
  sandwichs: Sandwich,
  accompagnements: Wheat,
  boissons: GlassWater,
}

export default function CategoryIcon({ category, size = 18, strokeWidth = 2, className, style }) {
  const Icon = MAP[category] || UtensilsCrossed
  return <Icon size={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true" />
}
