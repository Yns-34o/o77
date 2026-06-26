// Convertit le menu du format imbriqué (fourni par le client :
// { categories: [{ id, nom, note, produits: [{ id, nom, description, prix }] }] })
// vers le format attendu par le code du site et Firebase :
//   { categories: [{id,label,icon,sortOrder,active,image,note}],
//     products:   [{id,name,description,price,priceLabel,category,image,...}],
//     config:     {... livraison, hero, adresse ...} }
//
// RÔLE : source unique de vérité pour le fallback local et le seed Firestore.
// Lancer :  node scripts/convert-menu.js
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', 'data')

// 1) Lecture du menu imbriqué d'origine (source canonique, figée au 1er run).
const SRC = path.join(DATA, 'menu-nested-backup.json')
if (!fs.existsSync(SRC)) {
  // 1er run : menu.json est encore au format imbriqué -> on le sauvegarde avant d'écraser.
  const initial = JSON.parse(fs.readFileSync(path.join(DATA, 'menu.json'), 'utf8'))
  if (!initial.categories || !initial.categories[0] || !initial.categories[0].produits) {
    console.error('✗ menu-nested-backup.json absent et menu.json déjà converti. Source imbriquée perdue.')
    process.exit(1)
  }
  fs.writeFileSync(SRC, JSON.stringify(initial, null, 2))
}
const nested = JSON.parse(fs.readFileSync(SRC, 'utf8'))

// 2) Icône + image de catégorie par id.
const META = {
  'pizzas-tomate': { icon: '🍕', image: '/carte/pizza-tomate.webp' },
  'pizzas-creme': { icon: '🍕', image: '/carte/pizza-creme.webp' },
  burgers: { icon: '🍔', image: '/carte/burger.webp' },
  sandwichs: { icon: '🥪', image: '/carte/sandwich.webp' },
  tacos: { icon: '🌮', image: '/carte/tacos.webp' },
  'tex-mex': { icon: '🍟', image: '/carte/tex-mex.webp' },
  paninis: { icon: '🥖', image: '/carte/panini.webp' },
}

// Produits mis en avant (page d'accueil / BestSellers). Choix de présentation.
const FEATURED = new Set(['marguerita', 'campione', 'double-cheese', 'big-chef', 'o77', 'tacos-base'])

const fmt = (v) => Number(v).toFixed(2).replace('.', ',') + ' €'

// pricesToLabel — copie CJS de lib/format.js (ESM là-bas). Les 2 doivent rester identiques.
function pricesToLabelCJS(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return null
  if (prices.length === 1 && !prices[0].label) return null
  return prices.map((l) => (l.label ? l.label + ' ' + fmt(l.price) : fmt(l.price))).join(' · ')
}

// Transforme l'objet prix du client en { price, priceLabel, prices }.
// `prices` est la source structurée (éditable dans le dashboard) ; price/priceLabel
// en sont dérivés (compat ProductCard qui lit priceLabel).
function priceOf(prix) {
  if (prix == null || (typeof prix === 'object' && Object.keys(prix).length === 0)) {
    return { price: 0, priceLabel: 'Prix sur place', prices: [{ label: '', price: 0 }] }
  }
  let prices
  if (typeof prix === 'number') {
    // Tex-mex : prix simple.
    prices = [{ label: '', price: prix }]
  } else if (prix.M && typeof prix.M === 'object') {
    // Tacos : M / L / XL × Seul / Menu.
    prices = []
    for (const sz of ['M', 'L', 'XL']) {
      if (prix[sz]) {
        prices.push({ label: sz + ' — Seul', price: prix[sz].seul })
        prices.push({ label: sz + ' — Menu', price: prix[sz].menu })
      }
    }
  } else if (prix.J != null) {
    // Pizzas : Junior / S / M.
    prices = ['J', 'S', 'M'].filter((k) => prix[k] != null).map((k) => ({ label: k, price: prix[k] }))
  } else if (prix.seul != null || prix.menu != null) {
    // Burgers / Sandwichs / Paninis : Seul / Menu.
    prices = []
    if (prix.seul != null) prices.push({ label: 'Seul', price: prix.seul })
    if (prix.menu != null) prices.push({ label: 'Menu', price: prix.menu })
  } else {
    prices = [{ label: '', price: 0 }]
  }
  const price = Number(prices[0] && prices[0].price) || 0
  return { price, priceLabel: pricesToLabelCJS(prices), prices }
}

const categories = []
const products = []
let catOrder = 0

for (const c of nested.categories) {
  const meta = META[c.id] || { icon: '🍽️', image: null }
  categories.push({
    id: c.id,
    label: c.nom,
    icon: meta.icon,
    sortOrder: catOrder++,
    active: true,
    image: meta.image,
    note: c.note || null,
  })

  const items = c.produits || []
  items.forEach((p, i) => {
    const { price, priceLabel, prices } = priceOf(p.prix)
    const id = p.id || `${c.id}-${p.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
    products.push({
      id,
      name: p.nom,
      description: p.description || '',
      price,
      priceLabel,
      prices,
      salePrice: null,
      saleActive: false,
      category: c.id,
      image: null, // pas d'image sur chaque produit (photo portée par la catégorie)
      allergens: [],
      badge: null,
      featured: FEATURED.has(id),
      active: true,
      sortOrder: i,
    })
  })

  // Catégorie sans produits listés (ex. tacos) : un produit qui porte la note.
  if (items.length === 0) {
    const id = `${c.id}-base`
    products.push({
      id,
      name: c.nom.replace(/^Nos\s+/, ''),
      description: c.note || '',
      price: 0,
      priceLabel: 'Prix sur place',
      prices: [{ label: '', price: 0 }],
      salePrice: null,
      saleActive: false,
      category: c.id,
      image: null,
      allergens: [],
      badge: null,
      featured: FEATURED.has(id),
      active: true,
      sortOrder: 0,
    })
  }
}

// 3) Config du restaurant (livraison, hero, contact) — réintégrée car absente du menu fourni.
const config = {
  restaurantName: "O'77",
  slogan: "O'77 par nous, pour vous !",
  cuisine: "Fast-food & pizzeria",
  address: { street: '146 Av. Charles Rouxel', postalCode: '77340', city: 'Pontault-Combault', country: 'FR' },
  phone: '09 85 00 27 73',
  email: 'o77pizzeria@gmail.com',
  hours: {
    monday: { open: '11:00', close: '01:00', closed: false },
    tuesday: { open: '11:00', close: '01:00', closed: false },
    wednesday: { open: '11:00', close: '01:00', closed: false },
    thursday: { open: '11:00', close: '01:00', closed: false },
    friday: { open: '11:00', close: '01:00', closed: false },
    saturday: { open: '11:00', close: '01:00', closed: false },
    sunday: { open: '11:00', close: '01:00', closed: false },
  },
  hero: { badge: 'Fast-food & Pizzeria — Pontault-Combault', title: 'LE GOÛT QUI DÉCHIRE', subtitle: "Pizzas fait maison, sandwichs qui tuent, naans dorés. Ouvert 7j/7 jusqu'à 1h du mat'." },
  social: { instagram: '', tiktok: '', snapchat: '' },
  delivery: {
    deliveroo: 'https://deliveroo.fr/fr/menu/Paris/pontault-combault/o77-146-avenue-charles-rouxel/?day=today&geohash=u09ve1x2509h&time=ASAP&fulfillment_method=DELIVERY',
    ubereats: '',
    justeat: '',
  },
  promoBanner: { active: false, text: '' },
  seo: { googleRating: 5.0, googleReviewCount: 21 },
}

fs.writeFileSync(path.join(DATA, 'menu.json'), JSON.stringify({ categories, products, config }, null, 2))

const missing = products.filter((p) => p.priceLabel === 'Prix sur place').map((p) => `${p.category}: ${p.name}`)
console.log(`✓ Conversion terminée : ${categories.length} catégories, ${products.length} produits.`)
console.log(`✓ Menu imbriqué sauvegardé dans data/menu-nested-backup.json.`)
console.log(missing.length ? `⚠ Sans prix (« Prix sur place ») à compléter : ${[...new Set(missing.map((m) => m.split(':')[0]))].join(', ')}` : '✓ Tous les produits ont un prix.')
