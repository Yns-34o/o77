import { AlertTriangle } from 'lucide-react'
import LegalLayout from '@/components/LegalLayout'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal, missingLegalFields } from '@/lib/legal-info'

export default function MentionsLegales({ legal, missing }) {
  return (
    <LegalLayout
      title="Mentions légales"
      path="/mentions-legales"
      description="Mentions légales du site O'77, fast-food & pizzeria à Pontault-Combault (77340). Éditeur, hébergeur, propriété intellectuelle, RGPD."
      updated={legal.updated}
    >
      <div className="legal-info-card">
        <p><strong>Éditeur du site :</strong> {legal.companyName}</p>
        <p><strong>Forme juridique :</strong> <span className="ph">{legal.legalForm}</span></p>
        <p><strong>SIRET :</strong> <span className="ph">{legal.siret}</span></p>
        <p><strong>RCS :</strong> <span className="ph">{legal.rcs}</span></p>
        <p><strong>TVA intracommunautaire :</strong> <span className="ph">{legal.tva}</span></p>
        <p><strong>Capital social :</strong> <span className="ph">{legal.capital}</span></p>
        <p><strong>Code APE / NAF :</strong> <span className="ph">{legal.ape}</span></p>
        <p><strong>Siège :</strong> {legal.address}</p>
        <p><strong>Téléphone :</strong> {legal.phone}</p>
        <p><strong>Email :</strong> <a href={`mailto:${legal.email}`}>{legal.email}</a></p>
        <p><strong>Directeur de la publication :</strong> <span className="ph">{legal.ownerName}</span> — {legal.directorRole}</p>
      </div>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par <strong>{legal.host.name}</strong> — {legal.host.address}.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments du site (textes, visuels, logo, marque « O'77 », mise en page) est la propriété exclusive de {legal.companyName}, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Les informations recueillies via les formulaires (pré-commande Click &amp; Collect, contact) font l'objet d'un traitement déclaré à la CNIL, conformément au Règlement Général sur la Protection des Données (RGPD). Pour plus d'informations, consulter notre <a href="/politique-confidentialite">Politique de confidentialité</a>.
      </p>
      <p>
        Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition aux données vous concernant. Pour l'exercer : <a href={`mailto:${legal.email}`}>{legal.email}</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Le site utilise un cookie technique de session. Pour plus d'informations, consulter notre <a href="/politique-cookies">Politique cookies</a>.
      </p>

      <h2>Liens hypertextes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers (notamment Deliveroo). {legal.companyName} n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>Droit applicable et litiges</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas de litige, une solution amiable sera recherchée prioritairement. À défaut, les tribunaux français seront seuls compétents. Conformément à l'article L.612-1 du Code de la consommation, le consommateur peut recourir gratuitement à un médiateur de la consommation.
      </p>

      {missing && missing.length > 0 && (
        <p style={{ marginTop: 40, color: '#555', fontSize: '0.75rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={14} style={{ color: '#FFD600', flexShrink: 0, marginTop: 2 }} />
          <span>Informations encore à compléter depuis le tableau de bord (onglet <em>Infos &amp; Légal</em>) : {missing.join(', ')}. Elles s'afficheront automatiquement dès leur saisie.</span>
        </p>
      )}
    </LegalLayout>
  )
}

export async function getServerSideProps() {
  const config = await getSiteConfig()
  const legal = resolveLegal(config)
  return { props: { legal, missing: missingLegalFields(legal) } }
}
