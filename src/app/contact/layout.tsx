import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact NepQue',
  description: 'Get in touch with NepQue for questions, feedback, or partnerships.',
  alternates: { canonical: '/contact' }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


