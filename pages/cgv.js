import LegalLayout from '@/components/LegalLayout'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'

export default function Cgv({ legal }) {
  return (
    <LegalLayout
      title="CGV"
      path="/cgv"
      description="Conditions Générales de Vente d'O'77, fast-food & pizzeria à Pontault-Combault : commandes, click & collect, livraison, prix, allergènes, rétractation."
      updated={legal.updated}
    >
      <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations entre <strong>{legal.companyName}</strong> (« O'77 »), dont le siège est situé {legal.address}, et tout client passant commande.</p>

      <h2>Article 1 — Objet</h2>
      <p>
        Les CGV ont pour objet de définir les conditions de vente des produits de restauration proposés par O'77 (pizzas, sandwiches, burgers, tacos, accompagnements, boissons), pour une consommation sur place, à emporter (Click &amp; Collect) ou en livraison.
      </p>

      <h2>Article 2 — Commandes</h2>
      <ul>
        <li><strong>Click &amp; Collect :</strong> la pré-commande s'effectue via le formulaire du site. Le client choisit la date et l'heure de retrait sur place (146 Av. Charles Rouxel, Pontault-Combault).</li>
        <li><strong>Livraison :</strong> les commandes en livraison s'effectuent via la plateforme partenaire Deliveroo, et sont soumises aux conditions propres à cette plateforme.</li>
        <li>O'77 se réserve le droit de refuser une commande pour indisponibilité d'un produit ou motif légitime.</li>
      </ul>

      <h2>Article 3 — Prix</h2>
      <p>
        Les prix sont indiqués en euros (€), toutes taxes comprises (TTC), et figurent sur la carte du site. O'77 se réserve le droit de modifier ses prix et sa carte à tout moment. Les produits sont facturés sur la base des tarifs en vigueur au moment de la commande. Les éventuelles promotions sont affichées sur le site.
      </p>

      <h2>Article 4 — Paiement</h2>
      <p>
        Les commandes sur place et en Click &amp; Collect sont réglées directement au restaurant (espèces, carte bancaire). Les commandes en livraison sont payées via la plateforme Deliveroo selon ses moyens de paiement.
      </p>

      <h2>Article 5 — Droit de rétractation</h2>
      <p>
        Conformément à l'article L. 221-28 du Code de la consommation, le droit de rétractation de 14 jours <strong>ne s'applique pas</strong> aux fournitures de denrées périssables (produits alimentaires), lesquelles ne peuvent être réexpédiées. Les produits alimentaires commandés ne sont donc pas repris ni échangés, sauf non-conformité.
      </p>

      <h2>Article 6 — Allergènes et informations nutritionnelles</h2>
      <p>
        Conformément au règlement (UE) n° 1169/2011 (INCO), la liste des allergènes est tenue à la disposition du client sur simple demande auprès du personnel. Le client est invité à signaler toute allergie ou intolérance lors de sa commande. O'77 ne saurait être tenu responsable en cas de non-signalement.
      </p>

      <h2>Article 7 — Hygiène et sécurité alimentaire</h2>
      <p>
        O'77 respecte les règles d'hygiène et de sécurité alimentaire en vigueur (plan HACCP, chaîne du froid, traçabilité).
      </p>

      <h2>Article 8 — Livraison</h2>
      <p>
        Les délais et zones de livraison sont ceux applicables par la plateforme Deliveroo. O'77 décline toute responsabilité quant aux retards ou incidents liés au transport handled par le livreur tiers. Le retrait en Click &amp; Collect s'effectue à l'heure convenue ; les produits non retirés ne sont pas remboursés.
      </p>

      <h2>Article 9 — Réclamations</h2>
      <p>
        Toute réclamation concernant un produit doit être signalée à O'77 dans les meilleurs délais et au plus tard sous <strong>24 heures</strong> suivant la livraison ou le retrait, les denrées étant périssables. Contact : <a href={`mailto:${legal.email}`}>{legal.email}</a> ou {legal.phone}.
      </p>

      <h2>Article 10 — Responsabilité</h2>
      <p>
        O'77 s'efforce de fournir des informations exactes (produits, prix, allergènes). Les visuels sont donnés à titre indicatif et peuvent différer des produits réels.
      </p>

      <h2>Article 11 — Propriété intellectuelle</h2>
      <p>
        Tous les éléments du site (marque « O'77 », logo, textes, visuels) sont la propriété de {legal.companyName}. Toute reproduction est interdite sans autorisation.
      </p>

      <h2>Article 12 — Données personnelles</h2>
      <p>
        Les données collectées lors des commandes sont traitées conformément à notre <a href="/politique-confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>Article 13 — Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige, une médiation est privilégiée ; à défaut, les tribunaux français sont compétents.
      </p>
    </LegalLayout>
  )
}

export async function getServerSideProps() {
  const config = await getSiteConfig()
  return { props: { legal: resolveLegal(config) } }
}
