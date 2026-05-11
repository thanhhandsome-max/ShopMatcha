const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Try to query all models to see what exists
    console.log('=== Checking giohang table ===');
    try {
      const gio = await prisma.giohang.findMany({ take: 5 });
      console.log('Found giohang records:', gio);
    } catch (e) {
      console.log('giohang query error:', e.message.split('\n')[0]);
    }

    console.log('\n=== Checking all tables via raw query ===');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;
    console.log('Tables in database:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
