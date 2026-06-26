// SDK Firebase ADMIN (serveur uniquement).
// Utilisé par getServerSideProps et les routes API (lecture/écriture Firestore, session cookies).
import admin from 'firebase-admin'

if (!admin.apps.length) {
  const credential = process.env.FIREBASE_SERVICE_ACCOUNT
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    : admin.credential.applicationDefault()

  admin.initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'o77-app',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

export const db = admin.firestore()
export const authAdmin = admin.auth()
// Bucket Storage (upload des photos produits depuis le dashboard).
export const bucket = admin.storage().bucket()
