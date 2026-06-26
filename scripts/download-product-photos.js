// Ajoute une photo appétissante par PRODUIT (pas seulement par catégorie).
// Étapes :
//   1. Pour chaque catégorie, télécharge un POOL de photos Unsplash (URLs directes,
//      libres de droits) ; ne garde que celles qui se téléchargent + s'ouvrent
//      comme images valides (sharp). Optimisation webp 700x700 (quality 82).
//   2. Répartit le pool sur les produits de la catégorie (round-robin déterministe
//      par ordre de produit) et inscrit le chemin dans product.image de menu.json.
//
// ⚠ À lancer APRÈS convert-menu.js (qui fixe image=null) et AVANT reset-menu.js.
//    node scripts/download-product-photos.js
const fs = require('fs')
const path = require('path')
const https = require('https')
const sharp = require('sharp')

const OUT = path.join(__dirname, '..', 'public', 'carte')
const MENU = path.join(__dirname, '..', 'data', 'menu.json')
fs.mkdirSync(OUT, { recursive: true })

// Pools de photo-IDs Unsplash pertinents et appétissants, par catégorie.
// (pizzas-tomate et pizzas-creme partagent un pool pizza varié.)
const POOL_PIZZA = [
  'photo-1574071318508-1cdbab80d002', 'photo-1513104890138-7c749659a591',
  'photo-1565299624946-b28f40a0ae38', 'photo-1604382354936-07c5d9983bd3',
  'photo-1571997478779-2adcbbe9ab2f', 'photo-1593560708920-61dd98c46a4e',
  'photo-1560616871-25b00f9c9b0c', 'photo-1534308983496-4fabb1a015ee',
  'photo-1595854341625-f33ee10dbf94', 'photo-1571066811602-716837d681de',
  'photo-1513639776629-7b61b0ac49cb', 'photo-1613564834361-9436948817d1',
]
const POOLS = {
  'pizzas-tomate': POOL_PIZZA,
  'pizzas-creme': POOL_PIZZA,
  burgers: [
    'photo-1568901346375-23c9450c58cd', 'photo-1571091718767-18b5b1457add',
    'photo-1550547660-d9450f859349', 'photo-1586190848861-99aa4a171e90',
    'photo-1551782450-a2132b4ba21d', 'photo-1572802419224-296b0aeee0d9',
    'photo-1607013251379-e6eecfffe234', 'photo-1610614819513-58e34989e381',
    'photo-1550317138-23200c3ef838', 'photo-1561758033-d89a9ad46330',
    'photo-1552566626-52f8b828add9', 'photo-1585237247814-1c3c45f7c4e3',
  ],
  sandwichs: [
    'photo-1630384060421-cb20d0e0649d', 'photo-1526901193447-1f006f2a4194',
    'photo-1528735602780-2552fd46c7af', 'photo-1521305916504-4a1121188589',
    'photo-1567234669003-dce7a7a88821', 'photo-1559054663-e8d23213f55c',
    'photo-1539252554935-80c8cb20fb42', 'photo-1481070414801-51fd732d7184',
    'photo-1509722747041-616f39b575fc',
  ],
  tacos: [
    'photo-1565299585323-38d6b0865b47', 'photo-1599974579688-8dbdd335c77f',
    'photo-1551504734-5ee1c4a1479b',
  ],
  'tex-mex': [
    'photo-1562967914-608f82629710', 'photo-1639024471283-03518883512d',
    'photo-1606755962773-d324e0a13086', 'photo-1567620832903-9fc6debc209f',
    'photo-1544025162-d76694265947', 'photo-1576107232684-1279f390859f',
  ],
  paninis: [
    'photo-1528735602780-2552fd46c7af', 'photo-1551782450-a2132b4ba21d',
    'photo-1521305916504-4a1121188589', 'photo-1559054663-e8d23213f55c',
    'photo-1528736235302-4e6f1ffb6375', 'photo-1481070414801-51fd732d7184',
  ],
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)) }
      const chunks = []
      res.on('data', (d) => chunks.push(d))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

// Télécharge le pool d'une catégorie -> liste de chemins webp valides.
async function buildPool(catkey, ids) {
  const paths = []
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const url = `https://images.unsplash.com/${id}?w=800&h=800&fit=crop&q=80`
    const file = path.join(OUT, `prod-${catkey}-${i + 1}.webp`)
    try {
      const buf = await download(url)
      await sharp(buf).metadata()
      await sharp(buf).resize(700, 700, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(file)
      paths.push('/carte/prod-' + catkey + '-' + (i + 1) + '.webp')
    } catch (e) {
      // ID invalide -> ignoré.
    }
  }
  return paths
}

;(async () => {
  const available = {}
  for (const [catkey, ids] of Object.entries(POOLS)) {
    available[catkey] = await buildPool(catkey, ids)
    console.log(`${catkey}: ${available[catkey].length}/${ids.length} photos valides`)
  }

  // Assignation round-robin sur les produits de menu.json.
  const menu = JSON.parse(fs.readFileSync(MENU, 'utf8'))
  const byCat = {}
  menu.products.forEach((p) => { (byCat[p.category] = byCat[p.category] || []).push(p) })

  let withImg = 0
  for (const [cat, prods] of Object.entries(byCat)) {
    const pool = available[cat] || []
    if (!pool.length) continue
    prods.forEach((p, i) => {
      p.image = pool[i % pool.length]
      withImg++
    })
  }
  fs.writeFileSync(MENU, JSON.stringify(menu, null, 2))
  const stillIcons = menu.products.filter((p) => !p.image).length
  console.log(`\n✓ ${withImg} produits ont une photo. Reste sans photo (icône): ${stillIcons}.`)
  if (stillIcons) console.log('⚠ Catégories sans pool valide :', Object.keys(byCat).filter((c) => !available[c] || !available[c].length).join(', '))
})()
