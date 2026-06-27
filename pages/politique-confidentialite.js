import LegalLayout from '@/components/LegalLayout'
import LegalSections from '@/components/LegalBody'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'
import { resolveLegalSections } from '@/lib/legal-content'

export default function Confidentialite({ legal, sections }) {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      path="/politique-confidentialite"
      description="Politique de confidentialité d'O'77 (RGPD) : données collectées, finalités, droits, sécurité."
      updated={legal.updated}
    >
      <LegalSections sections={sections} legal={legal} />
    </LegalLayout>
  )
}

export async function getStaticProps() {
  const config = await getSiteConfig()
  // ISR : régénération au max toutes les heures + à la demande (config).
  return {
    props: {
      legal: resolveLegal(config),
      sections: resolveLegalSections(config, 'politique-confidentialite'),
    },
    revalidate: 3600,
  }
}
