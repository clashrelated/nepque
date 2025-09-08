import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/signin', req.url))
      }
      
      if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // User profile routes protection
    if (pathname.startsWith('/profile') || pathname.startsWith('/favorites')) {
      if (!token) {
        return NextResponse.redirect(new URL('/signin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (pathname.startsWith('/api/auth') || 
            pathname.startsWith('/signin') || 
            pathname.startsWith('/signup') ||
            pathname === '/' ||
            pathname.startsWith('/coupons') ||
            pathname.startsWith('/brands') ||
            pathname.startsWith('/categories') ||
            pathname.startsWith('/search')) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/favorites/:path*',
  ]
}
