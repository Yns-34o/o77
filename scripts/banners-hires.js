// Re-télécharge les 7 bannières de catégorie en haute résolution (1600x520)
// pour un rendu net en pleine largeur. Mêmes noms de fichiers -> aucune mise
// à jour de menu.json nécessaire.  node scripts/banners-hires.js
const fs = require('fs')
const path = require('path')
const https = require('https')
const sharp = require('sharp')

const OUT = path.join(__dirname, '..', 'public', 'carte')
const BANNERS = {
  'pizza-tomate.webp': 'photo-1574071318508-1cdbab80d002',
  'pizza-creme.webp': 'photo-1565299624946-b28f40a0ae38',
  'burger.webp': 'photo-1568901346375-23c9450c58cd',
  'sandwich.webp': 'photo-1630384060421-cb20d0e0649d',
  'tacos.webp': 'photo-1565299585323-38d6b0865b47',
  'tex-mex.webp': 'photo-1562967914-608f82629710',
  'panini.webp': 'photo-1528735602780-2552fd46c7af',
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
  for (const [name, id] of Object.entries(BANNERS)) {
    try {
      const buf = await dl(`https://images.unsplash.com/${id}?w=1800&h=600&fit=crop&q=85`)
      await sharp(buf).resize(1600, 520, { fit: 'cover', position: 'centre' }).webp({ quality: 85 }).toFile(path.join(OUT, name))
      const kb = (fs.statSync(path.join(OUT, name)).size / 1024).toFixed(0)
      console.log(`✓ ${name}  (${kb} KB, 1600x520)`)
    } catch (e) {
      console.log(`✗ ${name} : ${e.message}`)
    }
  }
})()
