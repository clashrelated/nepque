import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop by Categories — NepQue',
  description: 'Explore coupons and deals by category. Find offers that match your interests.',
  alternates: { canonical: '/categories' }
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


