import Head from 'next/head'

// Helper <Head> réutilisable — titre, description, canonical, OpenGraph.
export default function Seo({ title, description, path = '', image }) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const url = siteUrl + path
  const img = image || (siteUrl + '/imagehero.png')
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content="restaurant" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="O'77" />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
    </Head>
  )
}
