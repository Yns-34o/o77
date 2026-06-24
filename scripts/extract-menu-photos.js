// Découpe les photos de plats depuis les scans du menu (reference/menu/*.png)
// et les exporte en WebP optimisées dans public/carte/.
//
// Approche : un visuel représentatif par catégorie (photo de plat bien cadrée),
// partagé par tous les produits de la catégorie. Les coordonnées (en pixels)
// ont été calibrées visuellement. Lancer :  node scripts/extract-menu-photos.js
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const SRC = path.join(__dirname, '..', 'reference', 'menu')
const OUT = path.join(__dirname, '..', 'public', 'carte')
fs.mkdirSync(OUT, { recursive: true })

// Nettoyage des anciens crops de calibration (_test-*).
for (const f of fs.readdirSync(OUT)) {
  if (f.startsWith('_test-')) fs.unlinkSync(path.join(OUT, f))
}

// Découpe -> fichier source + rectangle (left, top, width, height en px) + nom.
const crops = [
  // p12-1.png (1488 x 2105) : page de présentation (pizza, sandwich, burger)
  { file: 'p12-1.png', name: 'pizzas',     left: 430, top: 480,  width: 780, height: 760 },
  { file: 'p12-1.png', name: 'burgers',    left: 485, top: 1450, width: 520, height: 540 },
  { file: 'p12-1.png', name: 'sandwichs',  left: 25,  top: 1230, width: 420, height: 620 },
  // p23-1.png (2126 x 1488) : tacos + paninis
  { file: 'p23-1.png', name: 'tacos',      left: 30,  top: 300,  width: 1280, height: 620 },
  { file: 'p23-1.png', name: 'paninis',    left: 600, top: 1090, width: 1490, height: 370 },
]

;(async () => {
  for (const c of crops) {
    const src = path.join(SRC, c.file)
    try {
      await sharp(src)
        .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
        .resize(600, 600, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toFile(path.join(OUT, `${c.name}.webp`))
      console.log('✓', c.name)
    } catch (e) {
      console.error('✗', c.name, e.message)
    }
  }
  console.log('Terminé. Visuels de catégorie dans public/carte/*.webp')
})()
