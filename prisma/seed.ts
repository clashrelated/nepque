import { PrismaClient, UserRole, CouponType, DiscountType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronics and gadgets',
        icon: '📱',
        color: '#3B82F6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        icon: '👗',
        color: '#EC4899',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        icon: '🏠',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: {
        name: 'Beauty',
        slug: 'beauty',
        description: 'Beauty and personal care products',
        icon: '💄',
        color: '#F59E0B',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'food' },
      update: {},
      create: {
        name: 'Food & Dining',
        slug: 'food',
        description: 'Restaurants and food delivery',
        icon: '🍕',
        color: '#EF4444',
      },
    }),
  ])

  console.log('✅ Categories created')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'amazon' },
      update: {},
      create: {
        name: 'Amazon',
        slug: 'amazon',
        description: 'Everything you need, delivered fast',
        logo: 'https://logo.clearbit.com/amazon.com',
        website: 'https://amazon.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'nike' },
      update: {},
      create: {
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It',
        logo: 'https://logo.clearbit.com/nike.com',
        website: 'https://nike.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: {
        name: 'Apple',
        slug: 'apple',
        description: 'Think Different',
        logo: 'https://logo.clearbit.com/apple.com',
        website: 'https://apple.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'microsoft' },
      update: {},
      create: {
        name: 'Microsoft',
        slug: 'microsoft',
        description: 'Empowering every person and organization',
        logo: 'https://logo.clearbit.com/microsoft.com',
        website: 'https://microsoft.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'adidas' },
      update: {},
      create: {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing',
        logo: 'https://logo.clearbit.com/adidas.com',
        website: 'https://adidas.com',
      },
    }),
  ])

  console.log('✅ Brands created')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nepque.com' },
    update: {},
    create: {
      email: 'admin@nepque.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  })

  // Create test user
  const testHashedPassword = await bcrypt.hash('test123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.USER,
      password: testHashedPassword,
    },
  })

  console.log('✅ Admin user created')
  console.log('✅ Test user created')

  // Create sample coupons
  const coupons = await Promise.all([
    prisma.coupon.upsert({
      where: { id: 'coupon-1' },
      update: {},
      create: {
        id: 'coupon-1',
        title: '20% Off Electronics',
        description: 'Get 20% off on all electronics with this exclusive coupon',
        code: 'SAVE20',
        type: CouponType.COUPON_CODE,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minOrderValue: 100,
        maxDiscount: 50,
        isActive: true,
        isVerified: true,
        isExclusive: true,
        usageLimit: 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        terms: 'Valid on electronics only. Minimum order value $100. Maximum discount $50.',
        affiliateUrl: 'https://amazon.com',
        brandId: brands[0].id, // Amazon
        categoryId: categories[0].id, // Electronics
      },
    }),
    prisma.coupon.upsert({
      where: { id: 'coupon-2' },
      update: {},
      create: {
        id: 'coupon-2',
        title: 'Free Shipping on Orders Over $50',
        description: 'Enjoy free shipping on all orders over $50',
        type: CouponType.FREE_SHIPPING,
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
        minOrderValue: 50,
        isActive: true,
        isVerified: true,
        isExclusive: false,
        usageLimit: 5000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        terms: 'Valid on all orders over $50. Cannot be combined with other offers.',
        affiliateUrl: 'https://nike.com',
        brandId: brands[1].id, // Nike
        categoryId: categories[1].id, // Fashion
      },
    }),
    prisma.coupon.upsert({
      where: { id: 'coupon-3' },
      update: {},
      create: {
        id: 'coupon-3',
        title: '15% Off Apple Products',
        description: 'Save 15% on select Apple products',
        code: 'APPLE15',
        type: CouponType.COUPON_CODE,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        minOrderValue: 200,
        maxDiscount: 100,
        isActive: true,
        isVerified: true,
        isExclusive: false,
        usageLimit: 2000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        terms: 'Valid on select Apple products. Minimum order value $200. Maximum discount $100.',
        affiliateUrl: 'https://apple.com',
        brandId: brands[2].id, // Apple
        categoryId: categories[0].id, // Electronics
      },
    }),
    prisma.coupon.upsert({
      where: { id: 'coupon-4' },
      update: {},
      create: {
        id: 'coupon-4',
        title: '$25 Off Microsoft Office',
        description: 'Get $25 off on Microsoft Office 365 subscription',
        code: 'OFFICE25',
        type: CouponType.COUPON_CODE,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 25,
        minOrderValue: 99,
        isActive: true,
        isVerified: true,
        isExclusive: true,
        usageLimit: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        terms: 'Valid on Microsoft Office 365 subscriptions. Minimum order value $99.',
        affiliateUrl: 'https://microsoft.com',
        brandId: brands[3].id, // Microsoft
        categoryId: categories[0].id, // Electronics
      },
    }),
    prisma.coupon.upsert({
      where: { id: 'coupon-5' },
      update: {},
      create: {
        id: 'coupon-5',
        title: '30% Off Adidas Shoes',
        description: 'Get 30% off on all Adidas shoes',
        code: 'SHOES30',
        type: CouponType.COUPON_CODE,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 30,
        minOrderValue: 80,
        maxDiscount: 60,
        isActive: true,
        isVerified: true,
        isExclusive: false,
        usageLimit: 1500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        terms: 'Valid on Adidas shoes only. Minimum order value $80. Maximum discount $60.',
        affiliateUrl: 'https://adidas.com',
        brandId: brands[4].id, // Adidas
        categoryId: categories[1].id, // Fashion
      },
    }),
  ])

  console.log('✅ Sample coupons created')

  console.log('🎉 Database seeded successfully!')
  console.log(`Created ${categories.length} categories`)
  console.log(`Created ${brands.length} brands`)
  console.log(`Created ${coupons.length} coupons`)
  console.log('Created 1 admin user (admin@nepque.com)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
