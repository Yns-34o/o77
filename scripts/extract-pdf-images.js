// Extrait les images JPEG brutes embarquées dans les PDF du menu.
// Pourquoi : le PDF est un scan (pas de couche texte), et les PNG de
// reference/menu sont en résolution moyenne. Le PDF contient l'image source
// en haute résolution (flux JPEG). On l'extrait directement depuis le binaire
// (marqueurs SOI FF D8 FF -> EOI FF D9) pour relire les prix nettement.
const fs = require('fs')
const path = require('path')

const DL = 'C:/Users/clayt/Downloads'
const OUT = path.join(__dirname, '..', 'reference', 'menu-hires')
fs.mkdirSync(OUT, { recursive: true })

const PDFS = [
  'p1-2_260518_093950 - compta bsgroup.pdf',
  'p2-3 - compta bsgroup.pdf',
  'p4_260518_094031 - compta bsgroup.pdf',
]

const SOI = Buffer.from([0xff, 0xd8, 0xff]) // début d'un JPEG
const EOI = Buffer.from([0xff, 0xd9])       // fin d'un JPEG

for (const pdf of PDFS) {
  const buf = fs.readFileSync(path.join(DL, pdf))
  const base = pdf.replace(/_?260518_[0-9]+ ?-? ?compta bsgroup\.pdf$/i, '').replace(/ - compta bsgroup\.pdf$/i, '').replace(/\s+/g, '-')
  let idx = 0, count = 0
  while (true) {
    const start = buf.indexOf(SOI, idx)
    if (start === -1) break
    const end = buf.indexOf(EOI, start)
    if (end === -1) break
    const jpg = buf.slice(start, end + 2)
    if (jpg.length > 20000) { // ignore miniatures / artefacts
      const out = path.join(OUT, `${base}-img${count}.jpg`)
      fs.writeFileSync(out, jpg)
      console.log(`✓ ${path.basename(out)}  (${(jpg.length / 1024).toFixed(0)} KB)`)
      count++
    }
    idx = end + 2
  }
  console.log(`→ ${pdf} : ${count} image(s)`)
}
