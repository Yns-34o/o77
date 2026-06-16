// Identité légale d'O'77 — SOURCE CENTRALISÉE.
// Valeurs connues remplies, valeurs manquantes en placeholders [À COMPLÉTER].
//
// EDITABLE DEPUIS LE DASHBOARD : ces valeurs seront stockées dans Firestore
// (site_config.legal). La fonction resolveLegal() fusionne les données Firestore
// par-dessus ces valeurs par défaut -> le restaurateur met à jour lui-même.

export const LEGAL_INFO = {
  legalName: "O'77",
  companyName: "O'77", // raison sociale complète (à préciser avec le client)
  legalForm: '[À compléter — SARL, SAS, EURL, auto-entrepreneur…]',
  siret: '[SIRET à compléter]',
  siren: '[SIREN à compléter]',
  rcs: '[RCS ville et numéro à compléter]',
  tva: '[TVA intracommunautaire FR… à compléter]',
  capital: '[Capital social à compléter]',
  ape: '[Code APE/NAF à compléter]',
  ownerName: '[Nom du gérant / dirigeant à compléter]',
  directorRole: 'Gérant',
  address: '146 Av. Charles Rouxel, 77340 Pontault-Combault',
  phone: '09 85 00 27 73',
  email: 'o77pizzeria@gmail.com',
  host: {
    name: 'Vercel Inc.',
    address: '340 S Lemon Ave #4133, Walnut, CA 91789, USA',
  },
  updated: 'juin 2026',
}

// Fusionne les données Firestore (config.legal) sur les valeurs par défaut.
export function resolveLegal(config) {
  return { ...LEGAL_INFO, ...((config && config.legal) || {}) }
}
