/**
 * Database Seeding Script
 * Populates initial data for development and testing
 * 
 * Run with: npm run prisma:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to generate unique ID
function generateId(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}_${timestamp}${random}`;
}

async function main() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // 1. Create Loại Sản Phẩm (Categories)
    console.log("📂 Creating product categories...");
    const loai1 = await prisma.loaisanpham.create({
      data: {
        MaLoai: "L01",
        TenLoai: "Trà Xanh",
      },
    });

    const loai2 = await prisma.loaisanpham.create({
      data: {
        MaLoai: "L02",
        TenLoai: "Trà Đen",
      },
    });

    const loai3 = await prisma.loaisanpham.create({
      data: {
        MaLoai: "L03",
        TenLoai: "Matcha",
      },
    });

    const loai4 = await prisma.loaisanpham.create({
      data: {
        MaLoai: "L04",
        TenLoai: "Các Loại Khác",
      },
    });

    console.log("✅ Created 4 product categories\n");

    // 2. Create Kho (Warehouses)
    console.log("📦 Creating warehouses...");
    const kho1 = await prisma.kho.create({
      data: {
        MaKho: generateId("KHO"),
        DiaChi: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      },
    });

    const kho2 = await prisma.kho.create({
      data: {
        MaKho: generateId("KHO"),
        DiaChi: "456 Phố Hàng Bạc, Hoàn Kiếm, Hà Nội",
      },
    });

    console.log("✅ Created 2 warehouses\n");

    // 3. Create Cửa Hàng (Shops)
    console.log("🏪 Creating shops...");
    const ch1 = await prisma.cuahang.create({
      data: {
        MaCH: generateId("CH"),
        TenCH: "Cửa hàng Tân Bình",
        DiaChi: "789 Đường Cách Mạng Tháng 8, Tân Bình, TP.HCM",
        SDT: "0123456789",
      },
    });

    const ch2 = await prisma.cuahang.create({
      data: {
        MaCH: generateId("CH"),
        TenCH: "Cửa hàng Quận 3",
        DiaChi: "321 Đường Lê Văn Sỹ, Quận 3, TP.HCM",
        SDT: "0987654321",
      },
    });

    const ch3 = await prisma.cuahang.create({
      data: {
        MaCH: generateId("CH"),
        TenCH: "Cửa hàng Hà Nội",
        DiaChi: "654 Phố Tây Sơn, Đống Đa, Hà Nội",
        SDT: "0912345678",
      },
    });

    console.log("✅ Created 3 shops\n");

    // 4. Create Sản Phẩm (Products)
    console.log("🛍️  Creating products...");
    const products = await Promise.all([
      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Matcha Nhật Bản Premium",
          MaLoai: loai3.MaLoai,
          GiaTien: 250000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Xanh Thiên Nan",
          MaLoai: loai1.MaLoai,
          GiaTien: 180000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Đen Tây Xương",
          MaLoai: loai2.MaLoai,
          GiaTien: 220000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Xanh Sencha",
          MaLoai: loai1.MaLoai,
          GiaTien: 150000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Matcha Thái Lan",
          MaLoai: loai3.MaLoai,
          GiaTien: 200000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Bưởi Tây Ban Nha",
          MaLoai: loai4.MaLoai,
          GiaTien: 120000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Hoa Cúc Hãng Số 1",
          MaLoai: loai4.MaLoai,
          GiaTien: 80000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Lài Hương",
          MaLoai: loai1.MaLoai,
          GiaTien: 160000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Ô Long Đài Loan",
          MaLoai: loai2.MaLoai,
          GiaTien: 280000,
          TrangThai: "AVAILABLE",
        },
      }),

      prisma.sanpham.create({
        data: {
          MaSP: generateId("SP"),
          TenSP: "Trà Xanh Bột Organic",
          MaLoai: loai1.MaLoai,
          GiaTien: 190000,
          TrangThai: "OUT_OF_STOCK",
        },
      }),
    ]);

    console.log(`✅ Created ${products.length} products\n`);

    // 5. Create Tồn Kho (Warehouse Stock)
    console.log("📊 Creating warehouse stock...");
    let warehouseStockCount = 0;
    
    // Distribution: 60% TP.HCM, 40% Hà Nội
    for (const product of products) {
      const total = Math.floor(Math.random() * 100) + 20; // Random stock 20-120
      
      await prisma.tonkho.create({
        data: {
          MaSP: product.MaSP,
          MaKho: kho1.MaKho,
          SoLuong: Math.floor(total * 0.6),
        },
      });
      
      await prisma.tonkho.create({
        data: {
          MaSP: product.MaSP,
          MaKho: kho2.MaKho,
          SoLuong: Math.floor(total * 0.4),
        },
      });
      
      warehouseStockCount += 2;
    }
    console.log(`✅ Created ${warehouseStockCount} warehouse stock entries\n`);

    // 6. Create Tồn Kho Cửa Hàng (Shop Stock)
    console.log("🏪 Creating shop stock...");
    let shopStockCount = 0;
    
    // Distribution: 30% of total stock to shops
    for (const product of products) {
      const totalShopStock = Math.floor(Math.random() * 50) + 10; // Random shop stock 10-60
      
      await prisma.tonkhocuahang.create({
        data: {
          MaSP: product.MaSP,
          MaCH: ch1.MaCH,
          SoLuong: Math.floor(totalShopStock * 0.5),
        },
      });
      
      await prisma.tonkhocuahang.create({
        data: {
          MaSP: product.MaSP,
          MaCH: ch2.MaCH,
          SoLuong: Math.floor(totalShopStock * 0.3),
        },
      });
      
      await prisma.tonkhocuahang.create({
        data: {
          MaSP: product.MaSP,
          MaCH: ch3.MaCH,
          SoLuong: Math.floor(totalShopStock * 0.2),
        },
      });
      
      shopStockCount += 3;
    }
    console.log(`✅ Created ${shopStockCount} shop stock entries\n`);

    console.log("✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Loại Sản Phẩm (Categories): 4`);
    console.log(`   - Kho (Warehouses): 2`);
    console.log(`   - Cửa Hàng (Shops): 3`);
    console.log(`   - Sản Phẩm (Products): ${products.length}`);
    console.log(`   - Tồn Kho (Warehouse Stock): ${warehouseStockCount}`);
    console.log(`   - Tồn Kho Cửa Hàng (Shop Stock): ${shopStockCount}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
