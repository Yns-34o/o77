// Utilitaires de formatage & logique "ouvert".

// Prix -> "12,90 €"
export function fmtP(v) {
  return Number(v || 0).toFixed(2).replace('.', ',') + ' €'
}

// Affichage prix soldé (prix barré) — ex. {old:12.9, sale:9.9} -> géré dans ProductCard
export function hasSale(p) {
  return p && p.saleActive && p.salePrice != null && p.salePrice < p.price
}

// "Ouvert maintenant" — horaires 11h–01h, 7j/7 (valeur du client).
// TODO(Task 5): passer à une logique par jour basée sur site_config.hours.
export function isOpenNow(date = new Date()) {
  const h = date.getHours()
  // 11h inclus jusqu'à 1h du matin (le lendemain)
  return h >= 11 || h < 1
}
