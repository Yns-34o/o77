// Diagnostic : upload un PNG test dans Storage, rend public, et teste l'accès aux
// différents formats d'URL. Lance : node scripts/test-upload.cjs
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
  const bucket = admin.storage().bucket()
  console.log('Bucket :', bucket.name, '\n')

  // PNG 1x1 minimal.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
  const objPath = `products/test-${Date.now()}.png`
  const file = bucket.file(objPath)
  await file.save(png, { metadata: { contentType: 'image/png' } })
  console.log('✅ Fichier écrit dans Storage :', objPath)

  try { await file.makePublic(); console.log('✅ makePublic() : OK') }
  catch (e) { console.log('❌ makePublic() a échoué :', e.message) }

  // Format 1 : URL legacy (celle que génère actuellement l'app).
  const legacyUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objPath)}?alt=media`
  console.log('\n[1] URL legacy (app) :', legacyUrl)
  try {
    const r = await fetch(legacyUrl, { method: 'GET', redirect: 'follow' })
    console.log('    Statut :', r.status, r.statusText)
  } catch (e) { console.log('    Erreur fetch :', e.message) }

  // Format 2 : URL "nouveau domaine" .firebasestorage.app
  const appUrl = `https://firebasestorage.app/${bucket.name}/${objPath}`
  console.log('\n[2] URL nouveau domaine :', appUrl)
  try {
    const r = await fetch(appUrl, { method: 'GET', redirect: 'follow' })
    console.log('    Statut :', r.status, r.statusText)
  } catch (e) { console.log('    Erreur fetch :', e.message) }

  // Format 3 : URL signée (toujours accessible si le bucket existe).
  const [signed] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' })
  console.log('\n[3] URL signée (test) :', signed.slice(0, 90) + '...')
  try {
    const r = await fetch(signed, { method: 'GET' })
    console.log('    Statut :', r.status, r.statusText)
  } catch (e) { console.log('    Erreur fetch :', e.message) }

  // Métadonnées ACL de l'objet (voit si public-read est appliqué).
  try {
    const [acl] = await file.acl.get()
    console.log('\nACL objet :', JSON.stringify(acl))
  } catch (e) {
    console.log('\nACL objet illisible :', e.message, '(→ uniform bucket-level access probable)')
  }

  await file.delete().catch(() => {})
  process.exit(0)
})().catch((e) => { console.error('ERREUR:', e.message); process.exit(1) })
