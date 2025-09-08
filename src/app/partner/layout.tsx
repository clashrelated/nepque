import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner with NepQue — Sponsored Placements & Promotions',
  description: 'Promote your offers to high-intent shoppers with sponsored placements and featured rails on NepQue.',
  alternates: { canonical: '/partner' }
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


