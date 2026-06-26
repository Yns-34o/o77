// Télécharge 7 photos de catégorie depuis Unsplash (URLs d'images directes,
// libres de droits) et les optimise en .webp 400x300 dans public/carte/.
// Pour chaque catégorie, on essaie plusieurs URLs candidates et on garde la
// première qui se télécharge + s'ouvre comme image valide.
// Lancer :  node scripts/download-photos.js
const fs = require('fs')
const path = require('path')
const https = require('https')
const sharp = require('sharp')

const OUT = path.join(__dirname, '..', 'public', 'carte')
fs.mkdirSync(OUT, { recursive: true })

// Plusieurs photo-IDs Unsplash pertinents par catégorie (premier qui marche gagne).
const CANDIDATES = {
  'pizza-tomate.webp': ['photo-1574071318508-1cdbab80d002', 'photo-1513104890138-7c749659a591', 'photo-1571997478779-2adcbbe9ab2f'],
  'pizza-creme.webp': ['photo-1565299624946-b28f40a0ae38', 'photo-1552868856-9c2243e8e23a', 'photo-1604382354936-07c5d9983bd3'],
  'burger.webp': ['photo-1568901346375-23c9450c58cd', 'photo-1571091718767-18b5b1457add', 'photo-1550547660-d9450f859349'],
  'sandwich.webp': ['photo-1630384060421-cb20d0e0649d', 'photo-1526901193447-1f006f2a4194', 'photo-1567234669003-dce7a7a88821'],
  'tacos.webp': ['photo-1565299585323-38d6b0865b47', 'photo-1599974579688-8dbdd335c77f', 'photo-1551504734-5ee1c4a1479b'],
  'tex-mex.webp': ['photo-1562967914-608f82629710', 'photo-1639024471283-03518883512d', 'photo-1606755962773-d324e0a13086'],
  'panini.webp': ['photo-1528735602780-2552fd46c7af', 'photo-1551782450-a2132b4ba21d', 'photo-1565299624946-b28f40a0ae38'],
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

;(async () => {
  let ok = 0
  const failed = []
  for (const [name, ids] of Object.entries(CANDIDATES)) {
    let done = false
    for (const id of ids) {
      const url = `https://images.unsplash.com/${id}?w=600&h=450&fit=crop&q=80`
      try {
        const buf = await download(url)
        await sharp(buf).metadata() // lève si pas une image valide
        await sharp(buf).resize(400, 300, { fit: 'cover', position: 'centre' }).webp({ quality: 80 }).toFile(path.join(OUT, name))
        console.log(`✓ ${name}  <-  ${id}`)
        done = true
        ok++
        break
      } catch (e) {
        console.log(`  · ${id} : ${e.message}`)
      }
    }
    if (!done) { console.log(`✗ AUCUNE URL valide pour ${name}`); failed.push(name) }
  }
  console.log(`\nTerminé : ${ok}/${Object.keys(CANDIDATES).length} photos téléchargées.`)
  if (failed.length) console.log('À remplacer :', failed.join(', '))
})()
