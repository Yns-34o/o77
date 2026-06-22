import LegalLayout from '@/components/LegalLayout'
import LegalSections from '@/components/LegalBody'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'
import { resolveLegalSections } from '@/lib/legal-content'

export default function Cookies({ legal, sections }) {
  return (
    <LegalLayout
      title="Politique cookies"
      path="/politique-cookies"
      description="Politique d'utilisation des cookies du site O'77, fast-food & pizzeria à Pontault-Combault."
      updated={legal.updated}
    >
      <LegalSections sections={sections} legal={legal} />
    </LegalLayout>
  )
}

export async function getServerSideProps() {
  const config = await getSiteConfig()
  return {
    props: {
      legal: resolveLegal(config),
      sections: resolveLegalSections(config, 'politique-cookies'),
    },
  }
}
