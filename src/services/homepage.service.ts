/**
 * Homepage Service
 * Provides bundled data for homepage display
 */

import { prisma } from "@/lib/prisma";
import { listCategories } from "./category.service";
import {
    getFeaturedProducts,
    getNewProducts,
} from "./product.service";

/**
 * Get all data needed for homepage in a single call
 */
export async function getHomepageData() {
  const [categories, featuredProducts, newProducts, stats] =
    await Promise.all([
      listCategories(false),
      getFeaturedProducts(8),
      getNewProducts(8),
      getHomepageStats(),
    ]);

  return {
    categories,
    featuredProducts,
    newProducts,
    stats,
  };
}

/**
 * Get statistics for homepage
 */
async function getHomepageStats() {
  const [totalProducts, totalCategories] = await Promise.all([
    prisma.sanpham.count(),
    prisma.loaisanpham.count(),
  ]);

  return {
    totalProducts,
    totalCategories,
  };
}
