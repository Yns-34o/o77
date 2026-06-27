import { useConfig } from '@/context/ConfigContext'

// Icône (iconify simple-icons) associée à chaque clé du champ `social`.
// TheFork n'existe pas dans simple-icons : fallback fourchette/couteau (mdi).
const SOCIAL_ICONS = {
  instagram: 'simple-icons:instagram',
  tiktok: 'simple-icons:tiktok',
  snapchat: 'simple-icons:snapchat',
  facebook: 'simple-icons:facebook',
  thefork: 'mdi:silverware-fork-knife',
  tripadvisor: 'simple-icons:tripadvisor',
}

// Libellé lisible (title) associé à chaque clé (sinon capitale initiale).
const SOCIAL_LABELS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  facebook: 'Facebook',
  thefork: 'The Fork',
  tripadvisor: 'Tripadvisor',
}

// Affiche les réseaux sociaux (config Firestore) sous forme d'icônes cliquables.
// Récupère les URLs via le ConfigContext (chargé côté client). Ne rend rien si
// aucun réseau n'est renseigné. `size` = côté des carrés (px).
export default function SocialLinks({ size = 36, style }) {
  const cfg = useConfig()
  const social = cfg?.social || {}
  const items = Object.entries(social).filter(([, v]) => v)
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
      {items.map(([k, url]) => (
        <a key={k} href={url} target="_blank" rel="noopener noreferrer" title={SOCIAL_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1))}
          style={{ width: size, height: size, border: '1px solid #1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', textDecoration: 'none', borderRadius: 9 }}>
          <iconify-icon icon={SOCIAL_ICONS[k] || 'simple-icons:linktree'} width={Math.round(size * 0.42)} />
        </a>
      ))}
    </div>
  )
}
