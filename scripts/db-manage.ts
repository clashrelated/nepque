#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'stats':
      await showStats()
      break
    case 'reset':
      await resetDatabase()
      break
    case 'clean':
      await cleanDatabase()
      break
    default:
      console.log(`
Database Management Script

Usage: tsx scripts/db-manage.ts <command>

Commands:
  stats    - Show database statistics
  reset    - Reset database and reseed
  clean    - Clean all data (keep schema)

Examples:
  tsx scripts/db-manage.ts stats
  tsx scripts/db-manage.ts reset
  tsx scripts/db-manage.ts clean
      `)
  }
}

async function showStats() {
  console.log('📊 Database Statistics\n')
  
  const [users, coupons, brands, categories, activeCoupons, verifiedCoupons] = await Promise.all([
    prisma.user.count(),
    prisma.coupon.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.coupon.count({ where: { isActive: true } }),
    prisma.coupon.count({ where: { isVerified: true } }),
  ])

  console.log(`👥 Users: ${users}`)
  console.log(`🏷️  Coupons: ${coupons} (${activeCoupons} active, ${verifiedCoupons} verified)`)
  console.log(`🏢 Brands: ${brands}`)
  console.log(`📂 Categories: ${categories}`)

  // Show recent coupons
  const recentCoupons = await prisma.coupon.findMany({
    take: 5,
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log('\n🆕 Recent Coupons:')
  recentCoupons.forEach((coupon, index) => {
    console.log(`${index + 1}. ${coupon.title} (${coupon.brand.name}) - ${coupon.category.name}`)
  })
}

async function resetDatabase() {
  console.log('🔄 Resetting database...')
  
  // Delete all data in reverse order of dependencies
  await prisma.couponUsage.deleteMany()
  await prisma.favoriteCoupon.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Database reset complete')
  console.log('💡 Run "npm run db:seed" to populate with sample data')
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')
  
  // Delete all data but keep schema
  await prisma.couponUsage.deleteMany()
  await prisma.favoriteCoupon.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Database cleaned')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
