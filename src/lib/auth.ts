import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled due to version compatibility
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Block banned/inactive users
        if (user.isActive === false) {
          throw new Error('ACCOUNT_BANNED')
        }

        // Verify the password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers: ensure a corresponding local user exists and is active
      try {
        if (account && account.provider === 'google' && user?.email) {
          const existing = await prisma.user.findUnique({ where: { email: user.email } })
          if (existing) {
            if (existing.isActive === false) {
              return '/signin?error=ACCOUNT_BANNED'
            }
          } else {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                role: 'USER',
              }
            })
          }
        }
      } catch (_) {
        return '/signin?error=AccessDenied'
      }
      return true
    },
    async jwt({ token, user, account }) {
      // When logging in (credentials or OAuth), map token to our DB user
      if (user) {
        try {
          let dbUser = null as any
          if ('email' in user && user.email) {
            dbUser = await prisma.user.findUnique({ where: { email: user.email as string } })
          } else if (token.email) {
            dbUser = await prisma.user.findUnique({ where: { email: token.email as string } })
          }
          if (dbUser) {
            token.sub = dbUser.id
            token.role = dbUser.role
          }
        } catch (_) {
          // ignore
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
  }
}
