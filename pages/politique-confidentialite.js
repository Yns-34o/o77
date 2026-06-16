import LegalLayout from '@/components/LegalLayout'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'

export default function Confidentialite({ legal }) {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      path="/politique-confidentialite"
      description="Politique de confidentialité d'O'77 (RGPD) : données collectées, finalités, droits, sécurité."
      updated={legal.updated}
    >
      <p>
        La présente politique de confidentialité décrit comment <strong>{legal.companyName}</strong> (« O'77 ») collecte, utilise et protège les données personnelles des utilisateurs de son site, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés ».
      </p>

      <h2>Responsable du traitement</h2>
      <div className="legal-info-card">
        <p><strong>{legal.companyName}</strong></p>
        <p>{legal.address}</p>
        <p>SIRET : <span className="ph">{legal.siret}</span></p>
        <p>Email : <a href={`mailto:${legal.email}`}>{legal.email}</a> — Tél : {legal.phone}</p>
      </div>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Pré-commande Click &amp; Collect :</strong> prénom, nom, email, téléphone, date et heure de retrait souhaitées, contenu de la commande.</li>
        <li><strong>Contact :</strong> nom, email, message.</li>
        <li><strong>Données techniques :</strong> aucune donnée de navigation nominative n'est collectée à des fins commerciales.</li>
      </ul>

      <h2>Finalités et base légale</h2>
      <ul>
        <li>Traitement des pré-commandes et des demandes de contact — <em>exécution de mesures précontractuelles/contractuelles</em> (art. 6.1.b RGPD).</li>
        <li>Gestion des réclamations — <em>obligation légale / intérêt légitime</em>.</li>
      </ul>

      <h2>Destinataires</h2>
      <p>
        Les données sont destinées à l'équipe d'O'77. Les commandes en livraison transitent par la plateforme partenaire Deliveroo, qui agit en tant que responsable de traitement indépendant pour sa part. Aucune donnée n'est vendue à des tiers.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données de pré-commande et de contact sont conservées pour la durée nécessaire au traitement de la demande, puis archivées au maximum 1 an, sauf obligation légale ou litige en cours.
      </p>

      <h2>Sécurité</h2>
      <p>
        O'77 met en œuvre des mesures techniques et organisationnelles pour protéger les données (accès restreint, hébergement sécurisé, chiffrement des échanges via HTTPS).
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous pouvez exercer ces droits par email à <a href={`mailto:${legal.email}`}>{legal.email}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>Voir notre <a href="/politique-cookies">Politique cookies</a>.</p>
    </LegalLayout>
  )
}

export async function getServerSideProps() {
  const config = await getSiteConfig()
  return { props: { legal: resolveLegal(config) } }
}
