import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Brand or Coupon — NepQue',
  description: 'Help the community by submitting new brands and coupons for review by our team.',
  alternates: { canonical: '/submit' }
}

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


