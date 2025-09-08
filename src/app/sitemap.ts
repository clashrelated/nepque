import type { MetadataRoute } from 'next'

const BASE = 'https://nepque.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/privacy', '/terms', '/coupons', '/brands', '/categories', '/submit', '/contact', '/partner']
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({ url: `${BASE}${path}`, lastModified: new Date() }))

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/brands?limit=1000`, { cache: 'no-store' })
    const data = await res.json()
    if (data.success && Array.isArray(data.data)) {
      for (const b of data.data) {
        if (b.slug) entries.push({ url: `${BASE}/brand/${b.slug}`, lastModified: new Date(b.updatedAt || new Date()) })
      }
    }
  } catch {}

  return entries
}


