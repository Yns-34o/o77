// Fetchers côté serveur pour les pages publiques (getServerSideProps).
// Si Firebase n'est pas configuré, on retombe sur les données locales (data/menu.json).
import { db } from './firebase-admin'
import { PRODUCTS, CATEGORIES, DEFAULT_CONFIG } from './menu-data'

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
  const [products, categories, config] = await Promise.all([getProducts(), getCategories(), getSiteConfig()])
  return { products, categories, config }
}

// Bannière promo active (collection 'promos', type 'banner'). Null si aucune.
export async function getActiveBanner() {
  if (!firestoreAvailable()) return null
  try {
    const snap = await db.collection('promos').where('type', '==', 'banner').get()
    const items = snap.docs.map((d) => toSerializable({ id: d.id, ...d.data() }))
    return items.find((p) => p.active && p.text) || null
  } catch (e) {
    console.error('[site-data] getActiveBanner -> aucune :', e.code || e.message)
    return null
  }
}
