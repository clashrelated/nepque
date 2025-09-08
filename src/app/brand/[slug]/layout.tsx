import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface BrandLayoutProps {
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: params.slug } })
    if (!brand) {
      return {
        title: 'Brand not found • NepQue',
        description: 'This brand could not be found on NepQue.'
      }
    }
    const title = brand.seoTitle || `${brand.name} Coupons & Deals • NepQue`
    const description = brand.seoDescription || `Save on ${brand.name} with the latest coupons, promo codes, and deals curated by NepQue.`
    const keywords = brand.seoKeywords || `${brand.name}, coupons, deals, promo codes, discounts, Nepal`
    const images = brand.ogImage ? [{ url: brand.ogImage }] : undefined

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images?.map(i => i.url)
      },
      alternates: { canonical: `/brand/${params.slug}` }
    }
  } catch {
    return {
      title: 'Brand • NepQue',
      description: 'Discover verified brand coupons and deals on NepQue.'
    }
  }
}

export default function BrandLayout({ children }: BrandLayoutProps) {
  return <>{children}</>
}


