const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Creating khachhang for admin account...');
    
    // Admin account uses "admin" as TenDangNhap, so Email in khachhang should be "admin"
    const kh = await prisma.khachhang.create({
      data: {
        MaKH: 'KH_ADMIN',
        TenKH: 'Admin User',
        Email: 'admin',  // This matches TenDangNhap of TK001
        SDT: '0123456789',
        NgayTao: new Date()
      }
    });
    
    console.log('Created khachhang:', kh);
    
    // Verify it can be found by email
    const found = await prisma.khachhang.findFirst({
      where: { Email: 'admin' }
    });
    console.log('Verification - found khachhang:', found);
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
