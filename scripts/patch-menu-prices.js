// Complète les prix manquants dans la source imbriquée (menu-nested-backup.json) :
//   - Tacos : grille M / L / XL × Seul / Menu (catégorie qui n'avait qu'une note).
//   - Paninis : Seul 7,70 € / Menu 9,50 € (les 7 variétés).
// Idempotent : peut être relancé sans effet de bord.
// À lancer AVANT convert-menu.js.  node scripts/patch-menu-prices.js
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'data', 'menu-nested-backup.json')
const data = JSON.parse(fs.readFileSync(SRC, 'utf8'))

// Tacos : tailles M / L / XL, chacune Seul / Menu.
const TACOS_PRIX = { M: { seul: 8.5, menu: 10.5 }, L: { seul: 9.5, menu: 11.5 }, XL: { seul: 11.5, menu: 13.5 } }
// Paninis : toutes variétés au même tarif Seul / Menu.
const PANINI_PRIX = { seul: 7.7, menu: 9.5 }

let touched = 0
for (const c of data.categories) {
  if (c.id === 'tacos') {
    c.produits = [{
      id: 'tacos',
      nom: 'Tacos',
      description: c.note || 'Viande au choix',
      prix: TACOS_PRIX,
    }]
    touched++
  }
  if (c.id === 'paninis') {
    c.produits = (c.produits || []).map((p) => ({ ...p, prix: { ...PANINI_PRIX } }))
    touched += c.produits.length
  }
}

fs.writeFileSync(SRC, JSON.stringify(data, null, 2))
console.log(`✓ Source imbriquée patchée : tacos (M/L/XL × seul/menu) + ${touched - 1 || 0} paninis.`)
