const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('=== ACCOUNTS ===');
    const accts = await prisma.taikhoan.findMany({
      select: { MaTaiKhoan: true, TenDangNhap: true },
      take: 20
    });
    accts.forEach(a => console.log(`${a.MaTaiKhoan}: ${a.TenDangNhap}`));

    console.log('\n=== ROLES ===');
    const roles = await prisma.phanquyen.findMany({
      select: { MaTK: true, MaVaiTro: true },
      take: 20
    });
    roles.forEach(r => console.log(`${r.MaTK}: ${r.MaVaiTro}`));

    console.log('\n=== CUSTOMERS (with Email) ===');
    const customers = await prisma.khachhang.findMany({
      select: { MaKH: true, Email: true },
      take: 20
    });
    customers.forEach(c => console.log(`${c.MaKH}: ${c.Email}`));

    console.log('\n=== ADMIN ACCOUNT DETAILS ===');
    const adminAccount = await prisma.taikhoan.findUnique({
      where: { MaTaiKhoan: 'TK007' },
      select: { MaTaiKhoan: true, TenDangNhap: true }
    });
    console.log('Admin account:', adminAccount);

    if (adminAccount?.TenDangNhap) {
      console.log(`\n=== CHECKING KHACHHANG FOR EMAIL: "${adminAccount.TenDangNhap}" ===`);
      const kh = await prisma.khachhang.findFirst({
        where: { Email: adminAccount.TenDangNhap },
        select: { MaKH: true, Email: true, TenKH: true }
      });
      console.log('Found khachhang:', kh);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
