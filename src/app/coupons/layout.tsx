import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Coupons & Promo Codes — NepQue',
  description: 'Browse verified coupons, promo codes, and deals across top brands. Filter by type, discount, and more.',
  alternates: { canonical: '/coupons' }
}

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


