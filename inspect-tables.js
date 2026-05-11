const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('=== CartItems Table Structure ===');
    const cartItems = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'CartItems'
      ORDER BY ORDINAL_POSITION
    `;
    cartItems.forEach(c => 
      console.log(`${c.COLUMN_NAME}: ${c.DATA_TYPE} ${c.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`)
    );

    console.log('\n=== tonkho Table Structure ===');
    const tonkho = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'tonkho'
      ORDER BY ORDINAL_POSITION
    `;
    tonkho.forEach(c => 
      console.log(`${c.COLUMN_NAME}: ${c.DATA_TYPE} ${c.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`)
    );

    console.log('\n=== Sample CartItems data ===');
    const sample = await prisma.$queryRaw`SELECT TOP 5 * FROM CartItems`;
    if (sample.length > 0) {
      console.log(JSON.stringify(sample, null, 2));
    } else {
      console.log('No data in CartItems');
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
