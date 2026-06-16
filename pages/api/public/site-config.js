import { getSiteConfig } from '@/lib/site-data'

// Config publique du site (cachée) — pour les composants globaux (footer, etc.).
export default async function handler(req, res) {
  const config = await getSiteConfig()
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(200).json(config)
}
