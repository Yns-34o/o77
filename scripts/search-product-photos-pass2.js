// Passe 2 : raffine les photos des produits restés "par catégorie" (rate-limit
// ou 0 résultat de la passe 1). Attend que la fenêtre de rate-limit démo (50/h)
// se réinitialise, puis recherche par plat reformulé, télécharge, optimise,
// assigne dans menu.json, et REPUSSE en base (reset-menu.js) — automatique.
//
//   PAUSE=<secondes> UNSPLASH_KEY=xxxx node scripts/search-product-photos-pass2.js
// (PAUSE défaut 3300s ≈ 55 min après la passe 1)
const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')
const sharp = require('sharp')

const KEY = process.env.UNSPLASH_KEY
if (!KEY) { console.error('✗ UNSPLASH_KEY manquant'); process.exit(1) }
const PAUSE = Number(process.env.PAUSE || 3300)

const OUT = path.join(__dirname, '..', 'public', 'carte')
const MENU = path.join(__dirname, '..', 'data', 'menu.json')

// 17 produits à raffiner, termes reformulés (plus larges / anglais).
const QUERIES = [
  { products: ['marguerita'], term: 'margherita' },
  { products: ['4-saisons'], term: 'quattro stagioni' },
  { products: ['calzone'], term: 'calzone' },
  { products: ['orientale'], term: 'spicy sausage pizza' },
  { products: ['norvegienne'], term: 'salmon pizza' },
  { products: ['tasty'], term: 'hamburger' },
  { products: ['tasty-max'], term: 'double burger' },
  { products: ['giant'], term: 'big burger' },
  { products: ['mozza-sticks'], term: 'fried mozzarella sticks' },
  { products: ['calamar-frits'], term: 'fried calamari' },
  { products: ['viande-hachee-panini'], term: 'panini' },
  { products: ['chevre-miel-panini'], term: 'goat cheese panini' },
  { products: ['fermier'], term: 'chicken panini' },
  { products: ['fromage-panini'], term: 'cheese panini' },
  { products: ['pecheur-panini'], term: 'tuna panini' },
  { products: ['ocean'], term: 'salmon panini' },
  { products: ['jambon'], term: 'ham cheese panini' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function search(term) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=1&orientation=squarish&content_filter=high`
  const opts = { headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' } }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await new Promise((res, rej) => https.get(url, opts, (r) => {
        if (r.statusCode === 403) { r.resume(); return rej(new Error('RATE_LIMIT')) }
        if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)) }
        const c = []
        r.on('data', (d) => c.push(d))
        r.on('end', () => { try { res(JSON.parse(Buffer.concat(c))) } catch (e) { rej(e) } })
      }).on('error', rej))
    } catch (e) {
      if (e.message === 'RATE_LIMIT') { console.log(`   ⏳ rate-limit sur "${term}", pause 60s (essai ${attempt + 1}/3)`); await sleep(60000); continue }
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
  console.log(`⏳ Pause initiale ${PAUSE}s (rate-limit Unsplash)…`)
  await sleep(PAUSE * 1000)
  console.log('→ Début de la passe 2.\n')

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
      console.log(`✓ ${q.term} -> ${file}`)
    } catch (e) {
      console.log(`✗ ${q.term} : ${e.message}`)
      fail++
    }
    await sleep(1100)
  }

  fs.writeFileSync(MENU, JSON.stringify(menu, null, 2))
  const precise = menu.products.filter((p) => p.image === `/carte/prod-${p.id}.webp` || (p.id.endsWith('-15') && p.image === '/carte/prod-nuggets-8.webp') || (p.id.endsWith('-10') && p.image === '/carte/prod-wings-6.webp')).length
  console.log(`\nPasse 2 terminée : ${ok} ok, ${fail} échecs. ${precise}/${menu.products.length} produits précis.`)

  // Repousse en base automatiquement.
  console.log('\n→ Re-seed Firebase…')
  execSync('node scripts/reset-menu.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  console.log('✓ Menu re-poussé en base.')
})()
