const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local'), override: true });

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('trustServerCertificate')) {
  process.env.DATABASE_URL = `${process.env.DATABASE_URL};trustServerCertificate=true`;
}

const prisma = new PrismaClient();

async function main() {
  const categoryId = 'LH_TEST';
  const warehouseId = 'KHO_TEST';

  const products = [
    {
      MaSP: 'SP_TEST_01',
      TenSP: 'Bánh Tiramisu Matcha',
      MaCodeSp: 'TEST-001',
      GiaVon: 180000,
      GiaBan: 350000,
      Mota: 'Bánh Tiramisu Matcha dùng để test tìm kiếm và thanh toán.',
      TrangThai: 1,
      MaLoai: categoryId,
      stock: 20,
      image: '/images/products/kyotomatcha.webp'
    },
    {
      MaSP: 'SP_TEST_02',
      TenSP: 'Bột Matcha Uji Thượng Hạng',
      MaCodeSp: 'TEST-002',
      GiaVon: 200000,
      GiaBan: 420000,
      Mota: 'Bột matcha Uji chất lượng cao, có tồn kho để test checkout.',
      TrangThai: 1,
      MaLoai: categoryId,
      stock: 15,
      image: '/images/products/okumidori.webp'
    },
    {
      MaSP: 'SP_TEST_03',
      TenSP: 'Bột Matcha Ceremonial',
      MaCodeSp: 'TEST-003',
      GiaVon: 220000,
      GiaBan: 480000,
      Mota: 'Bột matcha ceremonial grade để test giỏ hàng và thanh toán.',
      TrangThai: 1,
      MaLoai: categoryId,
      stock: 10,
      image: '/images/products/samidori-matcha.png'
    }
  ];

  await prisma.$transaction(async (tx) => {
    await tx.sanpham_anh.deleteMany({ where: { MaSP: { in: products.map((item) => item.MaSP) } } });
    await tx.tonkho.deleteMany({ where: { MaSP: { in: products.map((item) => item.MaSP) } } });
    await tx.sanpham.deleteMany({ where: { MaSP: { in: products.map((item) => item.MaSP) } } });
    await tx.loaisanpham.deleteMany({ where: { MaLoai: categoryId } });
    await tx.kho.deleteMany({ where: { MaKho: warehouseId } });

    await tx.kho.create({
      data: {
        MaKho: warehouseId,
        TenKho: 'Kho test thanh toán',
        DiaChi: 'Hồ Chí Minh',
        SoDienThoai: '0900000000',
        TrangThai: 1
      }
    });

    await tx.loaisanpham.create({
      data: {
        MaLoai: categoryId,
        TenLoai: 'Matcha Test',
        Mota: 'Nhóm sản phẩm test cho checkout/search',
        TrangThai: 1
      }
    });

    for (const item of products) {
      await tx.sanpham.create({
        data: {
          MaSP: item.MaSP,
          TenSP: item.TenSP,
          MaCodeSp: item.MaCodeSp,
          GiaVon: item.GiaVon,
          GiaBan: item.GiaBan,
          Mota: item.Mota,
          TrangThai: item.TrangThai,
          MaLoai: item.MaLoai
        }
      });

      await tx.sanpham_anh.create({
        data: {
          MaAnh: `${item.MaSP}_IMG_1`,
          MaSP: item.MaSP,
          DuongDanAnh: item.image,
          ThuTu: 1,
          AnhChinh: 1
        }
      });

      await tx.tonkho.create({
        data: {
          MaKho: warehouseId,
          MaSP: item.MaSP,
          SoLuong: item.stock
        }
      });
    }
  });

  console.log('Seed test data completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });