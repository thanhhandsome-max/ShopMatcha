/**
 * Category Service
 * Handles all category-related database operations
 */

import { prisma } from "@/lib/prisma";

/**
 * List all categories with optional product count
 */
export async function listCategories(includeCount: boolean = true) {
  const categories = await prisma.loaisanpham.findMany({
    select: {
      MaLoai: true,
      TenLoai: true,
      ...(includeCount && { _count: { select: { sanpham: true } } }),
    },
  });

  // Format response
  return categories.map((cat) => ({
    MaLoai: cat.MaLoai,
    TenLoai: cat.TenLoai,
    ...(includeCount && { productCount: cat._count?.sanpham || 0 }),
  }));
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string) {
  return prisma.loaisanpham.findUnique({
    where: { MaLoai: id },
    include: {
      _count: {
        select: { sanpham: true },
      },
    },
  });
}

/**
 * Get category with product count (for dropdown, filters, etc.)
 */
export async function getCategoryWithCount(id: string) {
  const category = await prisma.loaisanpham.findUnique({
    where: { MaLoai: id },
    select: {
      MaLoai: true,
      TenLoai: true,
      _count: {
        select: { sanpham: true },
      },
    },
  });

  if (!category) return null;

  return {
    MaLoai: category.MaLoai,
    TenLoai: category.TenLoai,
    productCount: category._count.sanpham,
  };
}

/**
 * Get all categories (minimal data for filters)
 */
export async function getCategoriesForFilters() {
  return prisma.loaisanpham.findMany({
    select: {
      MaLoai: true,
      TenLoai: true,
    },
  });
}
