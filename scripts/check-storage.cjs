// Diagnostic : vérifie l'existence du bucket Storage configuré et liste les buckets réels.
// Lance : node scripts/check-storage.cjs
const fs = require('fs')
const path = require('path')

// Parse .env.local (gère les valeurs entre quotes, y compris le JSON du service account).
const raw = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
const env = {}
for (const line of raw.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (!m) continue
  let val = m[2]
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1)
  env[m[1]] = val
}

const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)),
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
})

;(async () => {
  const configured = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  console.log('Bucket configuré dans .env.local :', configured)

  const bucket = admin.storage().bucket(configured)
  const [exists] = await bucket.exists()
  console.log('Ce bucket existe ?           :', exists ? 'OUI ✅' : 'NON ❌')
  if (exists) console.log('→ Firebase Storage est activé, l’upload doit fonctionner.')
  else console.log('→ Active Storage dans la console Firebase > Storage > Commencer.')
  process.exit(0)
})().catch((e) => {
  console.error('ERREUR :', e.message)
  process.exit(1)
})
