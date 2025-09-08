const { PrismaClient } = require('@prisma/client');

async function testDb() {
  try {
    const prisma = new PrismaClient();
    const userCount = await prisma.user.count();
    console.log('Database connection successful. User count:', userCount);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testDb();
