/**
 * Product Service
 * Handles all product-related database operations
 */

import { prisma } from "@/lib/prisma";

/**
 * List all products (legacy - keeping for backwards compatibility)
 */
export async function listProducts() {
  return prisma.sanpham.findMany({
    select: {
      MaSP: true,
      TenSP: true,
      GiaTien: true,
      TrangThai: true,
      loaisanpham: {
        select: {
          MaLoai: true,
          TenLoai: true,
        },
      },
    },
  });
}

/**
 * Get product by ID (legacy - keeping for backwards compatibility)
 */
export async function getProductById(id: string) {
  return prisma.sanpham.findUnique({
    where: { MaSP: id },
    select: {
      MaSP: true,
      TenSP: true,
      GiaTien: true,
      TrangThai: true,
      loaisanpham: {
        select: {
          MaLoai: true,
          TenLoai: true,
        },
      },
    },
  });
}

/**
 * Get products with advanced filtering, sorting, and pagination
 * MOCK IMPLEMENTATION FOR TESTING
 */
export async function getProductsWithFilters(filters: any) {
  // Mock data for testing
  const mockProducts = [
    {
      MaSP: "SP001",
      TenSP: "Trà Matcha Xanh Nhật Bản",
      GiaBan: 250000,
      Mota: "Trà matcha xanh chất lượng cao từ Nhật Bản",
      TrangThai: 1,
      NgayTao: new Date("2024-01-15"),
      MaLoai: "DM001",
      loaisanpham: {
        MaLoai: "DM001",
        TenLoai: "Trà Matcha",
      },
    },
    {
      MaSP: "SP002",
      TenSP: "Trà Matcha Đỏ",
      GiaBan: 300000,
      Mota: "Trà matcha đỏ đặc trưng",
      TrangThai: 1,
      NgayTao: new Date("2024-01-20"),
      MaLoai: "DM001",
      loaisanpham: {
        MaLoai: "DM001",
        TenLoai: "Trà Matcha",
      },
    },
    {
      MaSP: "SP003",
      TenSP: "Trà Ô Long",
      GiaBan: 200000,
      Mota: "Trà ô long thơm ngon",
      TrangThai: 1,
      NgayTao: new Date("2024-01-10"),
      MaLoai: "DM002",
      loaisanpham: {
        MaLoai: "DM002",
        TenLoai: "Trà Ô Long",
      },
    },
  ];

  const { page = 1, limit = 12, MaLoai, sortBy = "newest", search, minPrice, maxPrice, inStock } = filters;

  let filteredProducts = [...mockProducts];

  // Filter by category
  if (MaLoai) {
    filteredProducts = filteredProducts.filter(p => p.MaLoai === MaLoai);
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.TenSP.toLowerCase().includes(searchLower) ||
      p.Mota.toLowerCase().includes(searchLower)
    );
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => {
      const price = Number(p.GiaBan);
      const minCheck = minPrice === undefined || price >= minPrice;
      const maxCheck = maxPrice === undefined || price <= maxPrice;
      return minCheck && maxCheck;
    });
  }

  // Mock stock filtering
  if (inStock) {
    // Simulate products with stock
    filteredProducts = filteredProducts.filter(p => p.MaSP !== "SP003"); // SP003 out of stock
  }

  // Sort
  switch (sortBy) {
    case "price_asc":
      filteredProducts.sort((a, b) => Number(a.GiaBan) - Number(b.GiaBan));
      break;
    case "price_desc":
      filteredProducts.sort((a, b) => Number(b.GiaBan) - Number(a.GiaBan));
      break;
    case "newest":
      filteredProducts.sort((a, b) => new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime());
      break;
    case "name":
    default:
      filteredProducts.sort((a, b) => a.TenSP.localeCompare(b.TenSP));
  }

  // Pagination
  const skip = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(skip, skip + limit);

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get product detail with full information
 */
export async function getProductDetail(id: string) {
  const product = await prisma.sanpham.findUnique({
    where: { MaSP: id },
    select: {
      MaSP: true,
      TenSP: true,
      GiaTien: true,
      TrangThai: true,
      loaisanpham: {
        select: {
          MaLoai: true,
          TenLoai: true,
        },
      },
    },
  });

  if (!product) return null;

  // Get warehouse stock details
  const warehouseStock = await prisma.tonkho.findMany({
    where: { MaSP: id },
    select: {
      MaKho: true,
      SoLuong: true,
      kho: {
        select: {
          MaKho: true,
          DiaChi: true,
        },
      },
    },
  });

  // Get shop stock details
  const shopStock = await prisma.tonkhocuahang.findMany({
    where: { MaSP: id },
    select: {
      MaCH: true,
      SoLuong: true,
      cuahang: {
        select: {
          MaCH: true,
          TenCH: true,
        },
      },
    },
  });

  const totalStock = warehouseStock.reduce((sum, ws) => sum + (ws.SoLuong || 0), 0);

  return {
    ...product,
    totalStock,
    stock: {
      total: totalStock,
      warehouse: warehouseStock.map((ws) => ({
        MaKho: ws.MaKho,
        DiaChi: ws.kho.DiaChi,
        SoLuong: ws.SoLuong || 0,
      })),
      shops: shopStock.map((ss) => ({
        MaCH: ss.MaCH,
        TenCH: ss.cuahang.TenCH,
        SoLuong: ss.SoLuong || 0,
      })),
    },
  };
}

/**
 * Search products by query string
 * MOCK IMPLEMENTATION FOR TESTING
 */
export async function searchProducts(query: string, limit: number = 10) {
  // Mock data for testing
  const mockProducts = [
    {
      MaSP: "SP001",
      TenSP: "Trà Matcha Xanh Nhật Bản",
      GiaBan: 250000,
      Mota: "Trà matcha xanh chất lượng cao từ Nhật Bản",
      TrangThai: 1,
    },
    {
      MaSP: "SP002",
      TenSP: "Trà Matcha Đỏ",
      GiaBan: 300000,
      Mota: "Trà matcha đỏ đặc trưng",
      TrangThai: 1,
    },
    {
      MaSP: "SP003",
      TenSP: "Trà Ô Long",
      GiaBan: 200000,
      Mota: "Trà ô long thơm ngon",
      TrangThai: 1,
    },
  ];

  // Filter products by search query
  const results = mockProducts
    .filter(product => {
      const searchLower = query.toLowerCase();
      return product.TenSP.toLowerCase().includes(searchLower) ||
             product.Mota.toLowerCase().includes(searchLower);
    })
    .slice(0, limit);

  return results;
}

/**
 * Get related products (same category)
 */
export async function getRelatedProducts(
  MaLoai: string | undefined,
  currentProductId: string,
  limit: number = 4
) {
  if (!MaLoai) return [];

  return prisma.sanpham.findMany({
    where: {
      MaLoai,
      MaSP: { not: currentProductId },
    },
    take: limit,
    orderBy: { TenSP: "asc" },
    select: {
      MaSP: true,
      TenSP: true,
      GiaTien: true,
      TrangThai: true,
    },
  });
}

/**
 * Get featured products (newest)
 */
export async function getFeaturedProducts(limit: number = 8) {
  return prisma.sanpham.findMany({
    orderBy: { MaSP: "desc" },
    take: limit,
    select: {
      MaSP: true,
      TenSP: true,
      GiaTien: true,
      TrangThai: true,
      loaisanpham: {
        select: {
          MaLoai: true,
          TenLoai: true,
        },
      },
    },
  });
}

/**
 * Get new products (recently added)
 */
export async function getNewProducts(limit: number = 8) {
  return prisma.sanpham.findMany({
    orderBy: { MaSP: "desc" },
    take: limit,
    select: {
      MaSP: true,
      TenSP: true,
      GiaTien: true,
      TrangThai: true,
      loaisanpham: {
        select: {
          MaLoai: true,
          TenLoai: true,
        },
      },
    },
  });
}
