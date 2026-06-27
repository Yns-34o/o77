// Utilitaires de formatage & logique "ouvert".

// Prix -> "12,90 €"
export function fmtP(v) {
  return Number(v || 0).toFixed(2).replace('.', ',') + ' €'
}

// Affichage prix soldé (prix barré) — ex. {old:12.9, sale:9.9} -> géré dans ProductCard
export function hasSale(p) {
  return p && p.saleActive && p.salePrice != null && p.salePrice < p.price
}

// Affichage du prix d'un produit. Si `priceLabel` est défini (libellé libre,
// ex. prix multiples d'un tacos), on l'affiche tel quel. Sinon on formate
// le prix numérique. Centralise la logique pour ProductCard + ProductModal.
export function priceDisplay(p) {
  if (!p) return ''
  if (p.priceLabel) return p.priceLabel
  return fmtP(p.price)
}

// Variante soldée : { old, now } si promo active et pas de priceLabel, sinon null.
// Pas de promo possible sur un prix libre (priceLabel).
export function priceSale(p) {
  if (!p || p.priceLabel) return null
  if (hasSale(p)) return { old: fmtP(p.price), now: fmtP(p.salePrice) }
  return null
}

// --- Prix structurés par tailles ---
// `prices` = tableau de { label, price }. Source unique de vérité : price et
// priceLabel en sont dérivés (utilisés par le dashboard à la sauvegarde et par
// convert-menu.js). ProductCard/ProductModal lisent priceLabel via priceDisplay.
//
// priceLabel : null si prix simple (1 ligne sans label) ; sinon
// "J 9,00 € · S 14,50 € · M 20,00 €".
export function pricesToLabel(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return null
  if (prices.length === 1 && !prices[0].label) return null
  return prices.map((l) => (l.label ? l.label + ' ' + fmtP(l.price) : fmtP(l.price))).join(' · ')
}

// price (base, pour tri/cohérence) = prix de la première ligne.
export function pricesToBase(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return 0
  return Number(prices[0].price) || 0
}

// --- Promotions par taille (multi-tailles) ---
// Chaque ligne de `prices` peut porter une promo : `salePercent` (%) prioritaire,
// ou `salePrice` (€ absolu). Renvoie le prix soldé effectif, ou null si pas de promo.
export function lineSalePrice(l) {
  if (!l) return null
  const base = Number(l.price) || 0
  const pct = Number(l.salePercent)
  if (pct > 0 && pct < 100) return Math.round(base * (100 - pct)) / 100
  const sp = l.salePrice
  if (sp !== '' && sp != null && Number(sp) > 0 && Number(sp) < base) return Number(sp)
  return null
}

// Un produit a-t-il au moins une taille en promo (manuelle) ?
export function hasSizeSales(p) {
  return Array.isArray(p && p.prices) && p.prices.some((l) => lineSalePrice(l) != null)
}

// Lignes structurées pour l'affichage public : [{label, old, sale, hasSale}].
// `sale` = prix soldé (number) ou null. Utilisé par ProductCard/ProductModal
// pour afficher un prix barré par taille.
export function pricedLines(p) {
  if (!Array.isArray(p && p.prices) || !p.prices.length) return null
  return p.prices.map((l) => {
    const sale = lineSalePrice(l)
    return { label: l.label || '', old: l.price, sale, hasSale: sale != null }
  })
}

// "Ouvert maintenant" — horaires 11h–01h, 7j/7 (valeur du client).
// TODO(Task 5): passer à une logique par jour basée sur site_config.hours.
export function isOpenNow(date = new Date()) {
  const h = date.getHours()
  // 11h inclus jusqu'à 1h du matin (le lendemain)
  return h >= 11 || h < 1
}
