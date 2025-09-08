import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Brands — NepQue',
  description: 'Discover all supported brands on NepQue, including sponsored placements and partner stores.',
  alternates: { canonical: '/brands' }
}

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


