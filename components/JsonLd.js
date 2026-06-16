import Head from 'next/head'

// Injecte un bloc JSON-LD (données structurées) dans le <head>.
export default function JsonLd({ data }) {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  )
}
