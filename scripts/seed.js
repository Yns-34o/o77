// Seed initial : peuple Firestore avec les catégories, produits et la config par défaut.
// À lancer UNE fois, après avoir créé .env.local avec FIREBASE_SERVICE_ACCOUNT.
//   npm run seed
const { readFileSync } = require('fs')
const { resolve } = require('path')

// --- Charge .env.local (parseur minimal) ---
try {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
} catch (_) {
  /* pas de .env.local */
}

const admin = require('firebase-admin')
const data = require('../data/menu.json')

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('✗ FIREBASE_SERVICE_ACCOUNT manquant dans .env.local')
  console.error('  Console Firebase > Paramètres du projet > Comptes de service > Générer une clé privée')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
})
const db = admin.firestore()
const now = admin.firestore.FieldValue.serverTimestamp

async function run() {
  const batch = db.batch()

  for (const c of data.categories) {
    batch.set(db.collection('categories').doc(c.id), { ...c, updatedAt: now() })
  }

  for (const p of data.products) {
    const { id, ...rest } = p
    batch.set(db.collection('products').doc(id), { ...rest, createdAt: now(), updatedAt: now() })
  }

  batch.set(db.collection('site_config').doc('main'), { ...data.config, updatedAt: now() }, { merge: true })

  await batch.commit()
  console.log(`✓ Seed terminé : ${data.categories.length} catégories, ${data.products.length} produits, site_config/main`)
  console.log('  ⚠ Les pizzas sont des placeholders — remplace-les via le dashboard avec le vrai menu.')
}

run().catch((e) => {
  console.error('✗ Erreur seed :', e)
  process.exit(1)
})
