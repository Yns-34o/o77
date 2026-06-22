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

// Normalise une adresse (chaîne ou objet {street, postalCode, city}) en une
// chaîne affichable. Utilisé pour refléter sur la page légal l'adresse saisie
// dans le dashboard (section « Coordonnées du restaurant »).
function addressStr(a) {
  if (!a) return ''
  if (typeof a === 'string') return a
  const cityLine = `${a.postalCode || ''} ${a.city || ''}`.trim()
  return [a.street, cityLine].filter(Boolean).join(', ')
}

// Fusionne les données Firestore (config.legal) sur les valeurs par défaut.
// Les coordonnées (téléphone, email, adresse) sont éditées à la racine de la
// config dans le dashboard : on les reflète ici si config.legal ne les surcharge pas.
export function resolveLegal(config) {
  const c = config || {}
  const l = c.legal || {}
  return {
    ...LEGAL_INFO,
    ...l,
    phone: l.phone || c.phone || LEGAL_INFO.phone,
    email: l.email || c.email || LEGAL_INFO.email,
    address: addressStr(l.address) || addressStr(c.address) || LEGAL_INFO.address,
  }
}

// Renvoie la liste des champs légaux structurés encore vides/non renseignés,
// pour n'afficher la mention « à compléter » que tant que c'est pertinent.
export function missingLegalFields(legal) {
  const isPlaceholder = (v) => {
    if (v == null) return true
    const s = String(v).trim()
    return !s || s.startsWith('[À compléter') || s.startsWith('[SIRET') ||
      s.startsWith('[RCS') || s.startsWith('[TVA') || s.startsWith('[Capital') ||
      s.startsWith('[Code APE') || s.startsWith('[Nom du gérant')
  }
  return [
    ['forme juridique', legal.legalForm],
    ['SIRET', legal.siret],
    ['RCS', legal.rcs],
    ['TVA intracommunautaire', legal.tva],
    ['capital social', legal.capital],
    ['code APE/NAF', legal.ape],
    ['nom du gérant', legal.ownerName],
  ].filter(([, v]) => isPlaceholder(v))
}
