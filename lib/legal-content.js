// Contenu éditable des pages légales (CGV, Confidentialité, Cookies).
//
// Chaque page est une liste ordonnée de sections { id, title, body }.
// Le `body` est du markdown léger rendu par components/LegalBody.js :
//   - une ligne commençant par "- " => puce de liste
//   - "**texte**" => gras, "*texte*" => italique
//   - "### titre" => sous-titre (h3)
//   - "[texte](url)" => lien ; les emails simples sont auto-liés
//   - "{{token}}" => valeur dynamique issue de l'identité légale (email, address…)
//
// EDITABLE DEPUIS LE DASHBOARD : ces valeurs par défaut sont surchargées par
// Firestore (site_config.legalPages.{slug}) dès qu'elles sont modifiées.

export const LEGAL_PAGE_META = [
  { slug: 'cgv', label: 'CGV' },
  { slug: 'politique-confidentialite', label: 'Confidentialité' },
  { slug: 'politique-cookies', label: 'Cookies' },
]

export const LEGAL_PAGES = {
  cgv: [
    { id: 'cgv-intro', title: '', body: `Les présentes Conditions Générales de Vente (CGV) régissent les relations entre **{{companyName}}** (« O'77 »), dont le siège est situé {{address}}, et tout client passant commande.` },
    { id: 'cgv-1', title: 'Article 1 — Objet', body: `Les CGV ont pour objet de définir les conditions de vente des produits de restauration proposés par O'77 (pizzas, sandwiches, burgers, tacos, accompagnements, boissons), pour une consommation sur place, à emporter (Click & Collect) ou en livraison.` },
    { id: 'cgv-2', title: 'Article 2 — Commandes', body: `- **Click & Collect :** la pré-commande s'effectue via le formulaire du site. Le client choisit la date et l'heure de retrait sur place ({{address}}).\n- **Livraison :** les commandes en livraison s'effectuent via la plateforme partenaire Deliveroo, et sont soumises aux conditions propres à cette plateforme.\n- O'77 se réserve le droit de refuser une commande pour indisponibilité d'un produit ou motif légitime.` },
    { id: 'cgv-3', title: 'Article 3 — Prix', body: `Les prix sont indiqués en euros (€), toutes taxes comprises (TTC), et figurent sur la carte du site. O'77 se réserve le droit de modifier ses prix et sa carte à tout moment. Les produits sont facturés sur la base des tarifs en vigueur au moment de la commande. Les éventuelles promotions sont affichées sur le site.` },
    { id: 'cgv-4', title: 'Article 4 — Paiement', body: `Les commandes sur place et en Click & Collect sont réglées directement au restaurant (espèces, carte bancaire). Les commandes en livraison sont payées via la plateforme Deliveroo selon ses moyens de paiement.` },
    { id: 'cgv-5', title: 'Article 5 — Droit de rétractation', body: `Conformément à l'article L. 221-28 du Code de la consommation, le droit de rétractation de 14 jours **ne s'applique pas** aux fournitures de denrées périssables (produits alimentaires), lesquelles ne peuvent être réexpédiées. Les produits alimentaires commandés ne sont donc pas repris ni échangés, sauf non-conformité.` },
    { id: 'cgv-6', title: 'Article 6 — Allergènes et informations nutritionnelles', body: `Conformément au règlement (UE) n° 1169/2011 (INCO), la liste des allergènes est tenue à la disposition du client sur simple demande auprès du personnel. Le client est invité à signaler toute allergie ou intolérance lors de sa commande. O'77 ne saurait être tenu responsable en cas de non-signalement.` },
    { id: 'cgv-7', title: 'Article 7 — Hygiène et sécurité alimentaire', body: `O'77 respecte les règles d'hygiène et de sécurité alimentaire en vigueur (plan HACCP, chaîne du froid, traçabilité).` },
    { id: 'cgv-8', title: 'Article 8 — Livraison', body: `Les délais et zones de livraison sont ceux applicables par la plateforme Deliveroo. O'77 décline toute responsabilité quant aux retards ou incidents liés au transport pris en charge par le livreur tiers. Le retrait en Click & Collect s'effectue à l'heure convenue ; les produits non retirés ne sont pas remboursés.` },
    { id: 'cgv-9', title: 'Article 9 — Réclamations', body: `Toute réclamation concernant un produit doit être signalée à O'77 dans les meilleurs délais et au plus tard sous **24 heures** suivant la livraison ou le retrait, les denrées étant périssables. Contact : {{email}} ou {{phone}}.` },
    { id: 'cgv-10', title: 'Article 10 — Responsabilité', body: `O'77 s'efforce de fournir des informations exactes (produits, prix, allergènes). Les visuels sont donnés à titre indicatif et peuvent différer des produits réels.` },
    { id: 'cgv-11', title: 'Article 11 — Propriété intellectuelle', body: `Tous les éléments du site (marque « O'77 », logo, textes, visuels) sont la propriété de {{companyName}}. Toute reproduction est interdite sans autorisation.` },
    { id: 'cgv-12', title: 'Article 12 — Données personnelles', body: `Les données collectées lors des commandes sont traitées conformément à notre [Politique de confidentialité](/politique-confidentialite).` },
    { id: 'cgv-13', title: 'Article 13 — Droit applicable et litiges', body: `Les présentes CGV sont soumises au droit français. En cas de litige, une médiation est privilégiée ; à défaut, les tribunaux français sont compétents.` },
  ],

  'politique-confidentialite': [
    { id: 'pc-intro', title: '', body: `La présente politique de confidentialité décrit comment **{{companyName}}** (« O'77 ») collecte, utilise et protège les données personnelles des utilisateurs de son site, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés ».` },
    { id: 'pc-resp', title: 'Responsable du traitement', body: `**{{companyName}}**\n{{address}}\nSIRET : {{siret}}\nEmail : {{email}} — Tél : {{phone}}` },
    { id: 'pc-donnees', title: 'Données collectées', body: `- **Pré-commande Click & Collect :** prénom, nom, email, téléphone, date et heure de retrait souhaitées, contenu de la commande.\n- **Contact :** nom, email, message.\n- **Données techniques :** aucune donnée de navigation nominative n'est collectée à des fins commerciales.` },
    { id: 'pc-finalites', title: 'Finalités et base légale', body: `- Traitement des pré-commandes et des demandes de contact — *exécution de mesures précontractuelles/contractuelles* (art. 6.1.b RGPD).\n- Gestion des réclamations — *obligation légale / intérêt légitime*.` },
    { id: 'pc-dest', title: 'Destinataires', body: `Les données sont destinées à l'équipe d'O'77. Les commandes en livraison transitent par la plateforme partenaire Deliveroo, qui agit en tant que responsable de traitement indépendant pour sa part. Aucune donnée n'est vendue à des tiers.` },
    { id: 'pc-duree', title: 'Durée de conservation', body: `Les données de pré-commande et de contact sont conservées pour la durée nécessaire au traitement de la demande, puis archivées au maximum 1 an, sauf obligation légale ou litige en cours.` },
    { id: 'pc-securite', title: 'Sécurité', body: `O'77 met en œuvre des mesures techniques et organisationnelles pour protéger les données (accès restreint, hébergement sécurisé, chiffrement des échanges via HTTPS).` },
    { id: 'pc-droits', title: 'Vos droits', body: `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous pouvez exercer ces droits par email à {{email}}. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).` },
    { id: 'pc-cookies', title: 'Cookies', body: `Voir notre [Politique cookies](/politique-cookies).` },
  ],

  'politique-cookies': [
    { id: 'pk-intro', title: '', body: `Cette politique vous informe sur l'utilisation des cookies et traceurs sur le site d'O'77.` },
    { id: 'pk-def', title: "Qu'est-ce qu'un cookie ?", body: `Un cookie est un petit fichier déposé sur votre appareil lors de la visite d'un site. Il permet de mémoriser des informations relatives à votre navigation.` },
    { id: 'pk-util', title: 'Cookies utilisés', body: `### Cookies strictement nécessaires\n- **Cookie de session technique :** nécessaire au bon fonctionnement du site. Aucun consentement requis.\n\n### Cookies de mesure d'audience (le cas échéant)\n- Si un outil d'analyse (ex. Google Analytics) est activé, des cookies de mesure d'audience anonymisée pourront être déposés, soumis à votre consentement préalable via un bandeau.\n\n*À ce jour, le site n'utilise pas de cookie publicitaire ni de cookies tiers à des fins commerciales.*` },
    { id: 'pk-consent', title: 'Gestion de votre consentement', body: `Vous pouvez à tout moment gérer ou supprimer les cookies depuis les paramètres de votre navigateur. La désactivation des cookies peut affecter certaines fonctionnalités.` },
    { id: 'pk-nav', title: 'Comment désactiver les cookies dans votre navigateur', body: `- **Chrome :** Paramètres → Confidentialité et sécurité → Cookies.\n- **Firefox :** Paramètres → Vie privée et sécurité.\n- **Safari :** Préférences → Confidentialité.\n- **Edge :** Paramètres → Cookies et autorisations de site.` },
    { id: 'pk-contact', title: 'Contact', body: `Pour toute question : {{email}}.` },
  ],
}

// Renvoie les sections d'une page : priorité à la version Firestore (éditée
// depuis le dashboard), sinon au contenu par défaut ci-dessus.
export function resolveLegalSections(config, slug) {
  const override = config && config.legalPages && config.legalPages[slug]
  if (Array.isArray(override) && override.length > 0) {
    return override.map((s) => ({ id: s.id || slug, title: s.title || '', body: s.body || '' }))
  }
  return (LEGAL_PAGES[slug] || []).map((s) => ({ ...s }))
}

// Applique les sections par défaut manquantes à la config (utilisé à
// l'initialisation du dashboard pour pré-remplir l'éditeur).
export function seedLegalPages(config) {
  const legalPages = { ...((config && config.legalPages) || {}) }
  let changed = false
  for (const { slug } of LEGAL_PAGE_META) {
    if (!Array.isArray(legalPages[slug])) {
      legalPages[slug] = LEGAL_PAGES[slug].map((s) => ({ ...s }))
      changed = true
    }
  }
  return changed ? { ...config, legalPages } : config
}
