import { Html, Head, Main, NextScript } from 'next/document'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://o77-pontault-combault.fr').replace(/\/$/, '')

// Données structurées Restaurant (SEO local) — présentes sur toutes les pages.
const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: "O'77",
  description: "Fast-food & pizzeria à Pontault-Combault. Pizzas fait maison, sandwiches, burgers, tacos. Ouvert 7j/7 de 11h à 1h.",
  image: `${SITE_URL}/imagehero.png`,
  logo: `${SITE_URL}/logo.png`,
  url: SITE_URL,
  telephone: '+33985002773',
  email: 'o77pizzeria@gmail.com',
  servesCuisine: ['Fast food', 'Pizza', 'Sandwich', 'Street food', 'Tacos'],
  priceRange: '€€',
  acceptsReservations: 'True',
  hasMenu: `${SITE_URL}/carte`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '146 Av. Charles Rouxel',
    addressLocality: 'Pontault-Combault',
    postalCode: '77340',
    addressCountry: 'FR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 48.7915, longitude: 2.6029 },
  openingHours: 'Mo-Su 11:00-01:00',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '21' },
  sameAs: [
    'https://deliveroo.fr/fr/menu/Paris/pontault-combault/o77-146-avenue-charles-rouxel/',
  ],
}

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
