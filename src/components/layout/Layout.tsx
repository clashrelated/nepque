'use client'

import { ReactNode, useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import { ArrowUp } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />

      {/* Scroll Controls */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            aria-label="Scroll to top"
            onClick={scrollToTop}
            className="h-10 w-10 rounded-full bg-black text-white hover:bg-black/90 flex items-center justify-center shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
