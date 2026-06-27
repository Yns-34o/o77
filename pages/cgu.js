import LegalLayout from '@/components/LegalLayout'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'

export default function Cgu({ legal }) {
  return (
    <LegalLayout
      title="CGU"
      path="/cgu"
      description="Conditions Générales d'Utilisation du site O'77, fast-food & pizzeria à Pontault-Combault."
      updated={legal.updated}
    >
      <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site internet d'O'77.</p>

      <h2>Article 1 — Objet</h2>
      <p>
        Le site a pour objet de présenter l'établissement O'77, sa carte, ses prix, ses horaires, et de permettre la pré-commande à emporter ainsi que la redirection vers la plateforme de livraison partenaire (Deliveroo).
      </p>

      <h2>Article 2 — Accès au site</h2>
      <p>
        L'accès au site est gratuit. Les frais de connexion à internet restent à la charge de l'utilisateur. O'77 s'effore de maintenir le site accessible 24h/24, sans garantie d'absence d'interruption (maintenance, force majeure).
      </p>

      <h2>Article 3 — Utilisation</h2>
      <ul>
        <li>L'utilisateur s'engage à utiliser le site à des fins licites et conformes aux présentes CGU.</li>
        <li>L'utilisateur s'interdit toute tentative de perturbation du fonctionnement du site.</li>
        <li>Les informations saisies dans les formulaires (pré-commande, contact) doivent être exactes.</li>
      </ul>

      <h2>Article 4 — Pré-commandes à emporter</h2>
      <p>
        La pré-commande via le site constitue une demande qui sera traitée par O'77. Le retrait s'effectue à l'adresse {legal.address}, à la date et l'heure choisies. Le paiement se fait sur place.
      </p>

      <h2>Article 5 — Responsabilité</h2>
      <p>
        Les informations (produits, prix, allergènes, disponibilités) sont fournies à titre indicatif et peuvent évoluer. O'77 ne saurait être tenu responsable d'une erreur d'information non intentionnelle. La vente elle-même est soumise aux <a href="/cgv">CGV</a>.
      </p>

      <h2>Article 6 — Propriété intellectuelle</h2>
      <p>
        Les contenus du site (marque, logo, textes, visuels) appartiennent à {legal.companyName}. Toute reproduction est interdite sans autorisation écrite.
      </p>

      <h2>Article 7 — Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans notre <a href="/politique-confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>Article 8 — Cookies</h2>
      <p>
        L'utilisation des cookies est décrite dans notre <a href="/politique-cookies">Politique cookies</a>.
      </p>

      <h2>Article 9 — Modification des CGU</h2>
      <p>O'77 se réserve le droit de modifier les présentes CGU à tout moment. Les CGU applicables sont celles en vigueur au moment de l'utilisation.</p>

      <h2>Article 10 — Droit applicable</h2>
      <p>Les présentes CGU sont soumises au droit français.</p>
    </LegalLayout>
  )
}

export async function getStaticProps() {
  const config = await getSiteConfig()
  // ISR : régénération au max toutes les heures + à la demande (config).
  return { props: { legal: resolveLegal(config) }, revalidate: 3600 }
}
