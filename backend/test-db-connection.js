const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://eduplay_5rjn_user:nIbDLtzPaXGnieArVz4TbRvowJcb0e7J@dpg-d5a4te1r0fns7385cop0-a.oregon-postgres.render.com/eduplay_5rjn?sslmode=require'
    }
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    
    console.log('\nTesting products query...');
    const products = await prisma.product.findMany({ take: 5 });
    console.log(`✅ Found ${products.length} products`);
    
    console.log('\nDatabase is working correctly!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
