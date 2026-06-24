// Réinitialise le menu Firestore depuis data/menu.json (source de vérité).
//
// Pourquoi : quand la structure du menu change (nouvelles catégories, suppression
// d'anciens produits), un simple "set par id" laisse les anciens produits orphelins
// dans Firestore (ex. naans, anciennes catégories). Ce script fait un reset propre.
//
// Étapes (réversible) :
//   1. Sauvegarde l'état actuel (products + categories) dans data/menu-backup.json.
//   2. Supprime toutes les catégories et tous les produits.
//   3. Recrée les catégories + produits depuis data/menu.json.
//   4. Met à jour site_config/main (ajoute justeat à delivery via merge).
//
// Lancer :  node scripts/reset-menu.js
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

// --- Charge .env.local (parseur minimal, cf. seed.js) ---
try {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
} catch (_) { /* pas de .env.local */ }

const admin = require('firebase-admin')
const data = require('../data/menu.json')

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('✗ FIREBASE_SERVICE_ACCOUNT manquant dans .env.local')
  process.exit(1)
}
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
})
const db = admin.firestore()
const now = admin.firestore.FieldValue.serverTimestamp

// Étape 1 : sauvegarde de l'état actuel (sécurité, réversibilité).
async function backup() {
  const [prodSnap, catSnap] = await Promise.all([db.collection('products').get(), db.collection('categories').get()])
  const dump = {
    backedUpAt: new Date().toISOString(),
    categories: catSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    products: prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  }
  writeFileSync(resolve(process.cwd(), 'data', 'menu-backup.json'), JSON.stringify(dump, null, 2))
  console.log(`✓ Sauvegarde : ${dump.products.length} produits, ${dump.categories.length} catégories -> data/menu-backup.json`)
}

// Étape 2 : vide une collection par lots.
async function clearCollection(name) {
  const snap = await db.collection(name).get()
  // Batch par tranches de 450 (limite Firestore par batch = 500).
  const docs = snap.docs
  for (let i = 0; i < docs.length; i += 450) {
    const batch = db.batch()
    docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  console.log(`✓ ${docs.length} doc(s) supprimé(s) dans "${name}"`)
}

async function run() {
  console.log('→ Reset du menu Firestore depuis data/menu.json...\n')
  await backup()
  await clearCollection('products')
  await clearCollection('categories')

  // Étape 3 + 4 : recréation + config.
  const batch = db.batch()
  for (const c of data.categories) batch.set(db.collection('categories').doc(c.id), { ...c, updatedAt: now() })
  for (const p of data.products) {
    const { id, ...rest } = p
    batch.set(db.collection('products').doc(id), { ...rest, createdAt: now(), updatedAt: now() })
  }
  batch.set(db.collection('site_config').doc('main'), { ...data.config, updatedAt: now() }, { merge: true })
  await batch.commit()

  console.log(`\n✓ Reset terminé : ${data.categories.length} catégories, ${data.products.length} produits, site_config/main (livraison : ${Object.keys(data.config.delivery).join(', ')}).`)
  console.log('  (L\'ancien état est sauvegardé dans data/menu-backup.json.)')
}

run().catch((e) => { console.error('✗ Erreur :', e); process.exit(1) })
