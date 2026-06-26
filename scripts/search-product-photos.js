// Recherche une photo Unsplash POUR CHAQUE PLAT via l'API (terme précis dérivé
// de la recette), télécharge, optimise en webp 700x700, et assigne à menu.json.
//
// Clé API passée par variable d'environnement (ne pas coder en dur) :
//   UNSPLASH_KEY=xxxx node scripts/search-product-photos.js
//
// Respecte la rate-limit démo (~50/h) : délai entre requêtes + pause + retry sur 403.
const fs = require('fs')
const path = require('path')
const https = require('https')
const sharp = require('sharp')

const KEY = process.env.UNSPLASH_KEY
if (!KEY) { console.error('✗ UNSPLASH_KEY manquant. Lancez avec UNSPLASH_KEY=... node script.js'); process.exit(1) }

const OUT = path.join(__dirname, '..', 'public', 'carte')
const MENU = path.join(__dirname, '..', 'data', 'menu.json')

// Une recherche par plat (terme Unsplash pertinent, souvent en anglais = plus de résultats).
// "products" peut regrouper des doublons (ex. Nuggets x8/x15 = même photo).
const QUERIES = [
  // --- Pizzas base sauce tomate ---
  { products: ['marguerita'], term: 'margherita pizza' },
  { products: ['la-reine'], term: 'pizza prosciutto mushroom' },
  { products: ['campione'], term: 'minced beef pizza egg' },
  { products: ['fruits-de-mer'], term: 'seafood pizza' },
  { products: ['regina'], term: 'chorizo pizza' },
  { products: ['4-saisons'], term: 'quattro stagioni pizza' },
  { products: ['kebab-pizza'], term: 'kebab pizza' },
  { products: ['calzone'], term: 'calzone pizza' },
  { products: ['vegetarienne'], term: 'vegetarian pizza' },
  { products: ['4-fromages'], term: 'four cheese pizza' },
  { products: ['pecheur'], term: 'tuna pizza' },
  { products: ['orientale'], term: 'merguez spicy pizza' },
  { products: ['mexicaine'], term: 'spicy pepperoni pizza' },
  // --- Pizzas base crème fraîche ---
  { products: ['norvegienne'], term: 'smoked salmon pizza' },
  { products: ['chevre-miel'], term: 'goat cheese pizza honey' },
  { products: ['chicken'], term: 'chicken cream pizza' },
  { products: ['paysanne'], term: 'potato bacon pizza' },
  { products: ['tacoseria'], term: 'chicken pepper pizza' },
  { products: ['country'], term: 'minced meat potato pizza' },
  { products: ['western'], term: 'chicken mushroom pizza' },
  { products: ['boursin'], term: 'cheese loaded pizza' },
  { products: ['milano'], term: 'ham cheese pizza' },
  { products: ['chicago'], term: 'chicago deep dish pizza' },
  // --- Burgers ---
  { products: ['cheese'], term: 'cheeseburger' },
  { products: ['double-cheese'], term: 'double cheeseburger' },
  { products: ['chicken-burger'], term: 'chicken burger' },
  { products: ['max-chicken'], term: 'crispy chicken burger' },
  { products: ['claque'], term: 'beef burger' },
  { products: ['double-claque'], term: 'double beef burger' },
  { products: ['big'], term: 'classic burger' },
  { products: ['big-max'], term: 'triple stacked burger' },
  { products: ['tasty'], term: 'smash burger' },
  { products: ['tasty-max'], term: 'double smash burger' },
  { products: ['giant'], term: 'big mac burger' },
  { products: ['big-chef'], term: 'double bacon cheeseburger' },
  // --- Sandwichs ---
  { products: ['kebab'], term: 'doner kebab sandwich' },
  { products: ['o77'], term: 'loaded meat sandwich' },
  { products: ['radical'], term: 'cordon bleu sandwich' },
  { products: ['chicken-curry-tandoori'], term: 'chicken curry sandwich' },
  { products: ['chicken-boursin'], term: 'chicken cheese sandwich' },
  { products: ['mix'], term: 'chicken steak sandwich' },
  { products: ['triple'], term: 'triple decker sandwich' },
  { products: ['escalope-du-chef'], term: 'breaded chicken sandwich' },
  { products: ['mexicain'], term: 'spicy chicken sandwich' },
  // --- Tacos ---
  { products: ['tacos'], term: 'french tacos' },
  // --- Tex-Mex (doublons regroupés) ---
  { products: ['nuggets-8', 'nuggets-15'], term: 'chicken nuggets' },
  { products: ['wings-6', 'wings-10'], term: 'chicken wings' },
  { products: ['onion-rings'], term: 'onion rings' },
  { products: ['mozza-sticks'], term: 'mozzarella sticks' },
  { products: ['calamar-frits'], term: 'fried calamari rings' },
  // --- Paninis ---
  { products: ['viande-hachee-panini'], term: 'meat panini' },
  { products: ['chevre-miel-panini'], term: 'goat cheese panini' },
  { products: ['fermier'], term: 'chicken panini' },
  { products: ['fromage-panini'], term: 'melted cheese panini' },
  { products: ['pecheur-panini'], term: 'tuna melt panini' },
  { products: ['ocean'], term: 'salmon panini sandwich' },
  { products: ['jambon'], term: 'ham cheese panini' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Appelle l'API search ; retry une fois après pause si rate-limit (403).
async function search(term) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=1&orientation=squarish&content_filter=high`
  const opts = { headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' } }
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await new Promise((res, rej) => https.get(url, opts, (r) => {
        if (r.statusCode === 403) { r.resume(); return rej(new Error('RATE_LIMIT')) }
        if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)) }
        const c = []
        r.on('data', (d) => c.push(d))
        r.on('end', () => { try { res(JSON.parse(Buffer.concat(c))) } catch (e) { rej(e) } })
      }).on('error', rej))
    } catch (e) {
      if (e.message === 'RATE_LIMIT' && attempt === 0) { console.log('   ⏳ rate-limit, pause 35s…'); await sleep(35000); continue }
      throw e
    }
  }
  return { results: [] }
}

function dl(url) {
  return new Promise((res, rej) => https.get(url, (r) => {
    if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)) }
    const c = []
    r.on('data', (d) => c.push(d))
    r.on('end', () => res(Buffer.concat(c)))
  }).on('error', rej))
}

;(async () => {
  const menu = JSON.parse(fs.readFileSync(MENU, 'utf8'))
  const byId = {}
  menu.products.forEach((p) => (byId[p.id] = p))

  let ok = 0, fail = 0
  for (const q of QUERIES) {
    try {
      const j = await search(q.term)
      const results = j.results || []
      if (!results.length) { console.log(`— 0 résultat: ${q.term}`); fail++; await sleep(1100); continue }
      const buf = await dl(results[0].urls.regular)
      const file = `prod-${q.products[0]}.webp`
      await sharp(buf).resize(700, 700, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(path.join(OUT, file))
      const webPath = '/carte/' + file
      q.products.forEach((pid) => { if (byId[pid]) byId[pid].image = webPath })
      ok++
      console.log(`✓ ${q.term}  ->  ${file}`)
    } catch (e) {
      console.log(`✗ ${q.term} : ${e.message}`)
      fail++
    }
    await sleep(1100)
  }

  fs.writeFileSync(MENU, JSON.stringify(menu, null, 2))
  const withPhoto = menu.products.filter((p) => p.image && p.image.includes('prod-')).length
  console.log(`\nTerminé : ${ok} ok, ${fail} échecs. ${withPhoto}/${menu.products.length} produits avec photo précise.`)
})()
