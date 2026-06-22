import LegalLayout from '@/components/LegalLayout'
import LegalSections from '@/components/LegalBody'
import { getSiteConfig } from '@/lib/site-data'
import { resolveLegal } from '@/lib/legal-info'
import { resolveLegalSections } from '@/lib/legal-content'

export default function Cgv({ legal, sections }) {
  return (
    <LegalLayout
      title="CGV"
      path="/cgv"
      description="Conditions Générales de Vente d'O'77, fast-food & pizzeria à Pontault-Combault : commandes, click & collect, livraison, prix, allergènes, rétractation."
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
      sections: resolveLegalSections(config, 'cgv'),
    },
  }
}
