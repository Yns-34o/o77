// Fetchers côté serveur pour les pages publiques (getServerSideProps).
// Si Firebase n'est pas configuré, on retombe sur les données locales (data/menu.json).
import { db } from './firebase-admin'
import { PRODUCTS, CATEGORIES, DEFAULT_CONFIG } from './menu-data'
import { pricesToLabel, hasSizeSales, lineSalePrice } from './format'

function firestoreAvailable() {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT
}

// Convertit les objets non-sérialisables de Firestore (Timestamp, etc.) en JSON.
export function toSerializable(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (typeof obj.toDate === 'function') return obj.toDate().toISOString() // Firestore Timestamp
  if (Array.isArray(obj)) return obj.map(toSerializable)
  const out = {}
  for (const k of Object.keys(obj)) out[k] = toSerializable(obj[k])
  return out
}

export async function getProducts() {
  if (!firestoreAvailable()) return PRODUCTS
  try {
    // Tri en Firestore, filtre "active" en JS -> évite un index composite.
    const snap = await db.collection('products').orderBy('sortOrder').get()
    if (snap.empty) return PRODUCTS
    return snap.docs
      .map((d) => toSerializable({ id: d.id, ...d.data() }))
      .filter((p) => p.active !== false)
  } catch (e) {
    console.error('[site-data] getProducts -> fallback locale :', e.code || e.message)
    return PRODUCTS
  }
}

export async function getCategories() {
  if (!firestoreAvailable()) return CATEGORIES
  try {
    const snap = await db.collection('categories').orderBy('sortOrder').get()
    if (snap.empty) return CATEGORIES
    return snap.docs
      .map((d) => toSerializable({ id: d.id, ...d.data() }))
      .filter((c) => c.active !== false)
  } catch (e) {
    console.error('[site-data] getCategories -> fallback locale :', e.code || e.message)
    return CATEGORIES
  }
}

export async function getSiteConfig() {
  if (!firestoreAvailable()) return DEFAULT_CONFIG
  try {
    const snap = await db.collection('site_config').doc('main').get()
    return snap.exists ? { ...DEFAULT_CONFIG, ...toSerializable(snap.data()) } : DEFAULT_CONFIG
  } catch (e) {
    console.error('[site-data] getSiteConfig -> fallback locale :', e.code || e.message)
    return DEFAULT_CONFIG
  }
}

export async function getMenu() {
  const [products, categories, config, deal] = await Promise.all([getProducts(), getCategories(), getSiteConfig(), getActiveDeal()])
  return { products: applyDeal(products, deal), categories, config, deal }
}

// Promo « deal » active maintenant : -X% sur des catégories ciblées, certains jours.
// Collection 'promos', type 'deal'. Actif si active + text + percent>0 + (jours vides = tous, sinon aujourd'hui inclus).
const DAY_IDS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export async function getActiveDeal() {
  if (!firestoreAvailable()) return null
  try {
    const snap = await db.collection('promos').where('type', '==', 'deal').get()
    const items = snap.docs.map((d) => toSerializable({ id: d.id, ...d.data() }))
    const today = DAY_IDS[new Date().getDay()]
    return items.find((p) => p && p.active && p.text && Number(p.percent) > 0 && (!p.days || !p.days.length || p.days.includes(today))) || null
  } catch (e) {
    console.error('[site-data] getActiveDeal -> aucune :', e.code || e.message)
    return null
  }
}

// Applique un deal à une liste de produits : -X% sur les catégories ciblées
// (ou tous si `cats` vide). `sizes` (labels de taille) restreint la réduction à
// certaines tailles uniquement (ex: ["S"]) — sinon toutes les tailles sont soldées.
// Prix simple -> prix barré (saleActive/salePrice) ; multi-tailles -> soit prix
// réduits dans priceLabel (sizes vide), soit prix barré par taille via pricedLines (sizes ciblées).
export function applyDeal(products, deal) {
  if (!deal || !deal.active || !(Number(deal.percent) > 0)) return products
  const cats = Array.isArray(deal.cats) ? deal.cats : []
  const sizes = Array.isArray(deal.sizes) ? deal.sizes.filter(Boolean) : []
  const target = (p) => !cats.length || cats.includes(p.category)
  const reduce = (v) => Math.round((Number(v) || 0) * (100 - Number(deal.percent))) / 100
  return products.map((p) => {
    if (!target(p)) return p
    const np = { ...p }
    const multi = Array.isArray(np.prices) && (np.prices.length > 1 || (np.prices[0] && np.prices[0].label))

    // --- Ciblage par taille : on ne touche que les tailles listées (et sans promo
    // manuelle déjà posée). On pose salePercent -> l'affichage bascule en pricedLines
    // (prix barré sur la taille ciblée). On NE modifie ni price ni priceLabel.
    if (sizes.length) {
      if (!multi) return p // taille unique : pas de label -> non applicable
      let touched = false
      np.prices = np.prices.map((l) => {
        if (!sizes.includes(l.label)) return l            // taille non ciblée
        if (lineSalePrice(l) != null) return l            // promo manuelle déjà présente -> prioritaire
        touched = true
        return { ...l, salePercent: Number(deal.percent) }
      })
      if (!touched) return p                               // aucune taille éligible -> inchangé
      np.badge = np.badge || `-${deal.percent}%`
      return np
    }

    // --- Mode classique (sizes vide) : comportement historique.
    // Une promo manuelle par taille (saisie au dashboard) est prioritaire :
    // on ne lui applique pas le deal global -X% par-dessus.
    if (hasSizeSales(p)) return p
    if (multi) {
      np.prices = np.prices.map((l) => ({ ...l, price: reduce(l.price) }))
      np.price = reduce(np.price)
      np.priceLabel = pricesToLabel(np.prices)
    } else {
      np.saleActive = true
      np.salePrice = reduce(np.price)
    }
    np.badge = np.badge || `-${deal.percent}%`
    return np
  })
}
