// Pages publiques à revalider après une modif dans le dashboard (ISR on-demand).
const MENU_PAGES = ['/', '/carte', '/commander']
const LEGAL_PAGES = ['/mentions-legales', '/cgu', '/cgv', '/politique-confidentialite', '/politique-cookies']

// Déclenche la régénération ISR des pages données. Les erreurs sont loggées et non
// bloquantes : une page absente ou encore en getServerSideProps ne doit pas faire
// échouer la sauvegarde admin.
export async function revalidatePages(res, pages) {
  for (const p of pages) {
    try {
      await res.revalidate(p)
    } catch (e) {
      console.error('revalidate', p, e.message)
    }
  }
}

// Revalide les pages qui dépendent du menu (produits / catégories / promos).
export const revalidateMenu = (res) => revalidatePages(res, MENU_PAGES)

// Revalide les pages légales (dépendent de site_config).
export const revalidateLegal = (res) => revalidatePages(res, LEGAL_PAGES)
