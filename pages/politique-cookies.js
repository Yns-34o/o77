import LegalLayout from '@/components/LegalLayout'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'

export default function Cookies({ legal }) {
  return (
    <LegalLayout
      title="Politique cookies"
      path="/politique-cookies"
      description="Politique d'utilisation des cookies du site O'77, fast-food & pizzeria à Pontault-Combault."
      updated={legal.updated}
    >
      <p>
        Cette politique vous informe sur l'utilisation des cookies et traceurs sur le site d'O'77.
      </p>

      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier déposé sur votre appareil lors de la visite d'un site. Il permet de mémoriser des informations relatives à votre navigation.
      </p>

      <h2>Cookies utilisés</h2>
      <h3>Cookies strictement nécessaires</h3>
      <ul>
        <li><strong>Cookie de session technique :</strong> nécessaire au bon fonctionnement du site. Aucun consentement requis.</li>
      </ul>
      <h3>Cookies de mesure d'audience (le cas échéant)</h3>
      <ul>
        <li>Si un outil d'analyse (ex. Google Analytics) est activé, des cookies de mesure d'audience anonymisée pourront être déposés, soumis à votre consentement préalable via un bandeau.</li>
      </ul>
      <p>
        <em>À ce jour, le site n'utilise pas de cookie publicitaire ni de cookies tiers à des fins commerciales.</em>
      </p>

      <h2>Gestion de votre consentement</h2>
      <p>
        Vous pouvez à tout moment gérer ou supprimer les cookies depuis les paramètres de votre navigateur. La désactivation des cookies peut affecter certaines fonctionnalités.
      </p>

      <h2>Comment désactiver les cookies dans votre navigateur</h2>
      <ul>
        <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies.</li>
        <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité.</li>
        <li><strong>Safari :</strong> Préférences → Confidentialité.</li>
        <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Pour toute question : <a href={`mailto:${legal.email}`}>{legal.email}</a>.
      </p>
    </LegalLayout>
  )
}

export async function getServerSideProps() {
  const config = await getSiteConfig()
  return { props: { legal: resolveLegal(config) } }
}
