/**
 * Stock Service
 * Handles all inventory and stock-related operations
 */

import { prisma } from "@/lib/prisma";

/**
 * Get total stock for a product
 */
export async function getProductTotalStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { totalStock: true },
  });

  return product?.totalStock ?? 0;
}

/**
 * Get warehouse stock for a product
 */
export async function getWarehouseStock(productId: string) {
  return prisma.warehouseStock.findMany({
    where: { productId },
    select: {
      id: true,
      warehouseId: true,
      quantity: true,
      warehouse: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });
}

/**
 * Get shop stock for a product
 */
export async function getShopStock(productId: string) {
  return prisma.shopStock.findMany({
    where: { productId },
    select: {
      id: true,
      shopId: true,
      quantity: true,
      shop: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });
}

/**
 * Get complete stock information for a product
 */
export async function getProductStockInfo(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { totalStock: true },
  });

  if (!product) return null;

  const [warehouseStocks, shopStocks] = await Promise.all([
    getWarehouseStock(productId),
    getShopStock(productId),
  ]);

  return {
    total: product.totalStock,
    warehouse: warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0),
    shops: shopStocks.map((ss) => ({
      shopId: ss.shopId,
      shopName: ss.shop.name,
      quantity: ss.quantity,
    })),
  };
}

/**
 * Check if product is available with requested quantity
 */
export async function checkAvailability(
  productId: string,
  quantity: number
): Promise<boolean> {
  const totalStock = await getProductTotalStock(productId);
  return totalStock >= quantity;
}

/**
 * Get stock status for a product
 */
export async function getStockStatus(
  productId: string
): Promise<"AVAILABLE" | "OUT_OF_STOCK" | "LOW_STOCK"> {
  const totalStock = await getProductTotalStock(productId);

  if (totalStock === 0) return "OUT_OF_STOCK";
  if (totalStock < 5) return "LOW_STOCK";
  return "AVAILABLE";
}

/**
 * Get multiple products stock info (batch operation)
 */
export async function getProductsStockInfo(productIds: string[]) {
  const stocks = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      totalStock: true,
      status: true,
    },
  });

  return stocks.map((stock) => ({
    productId: stock.id,
    totalStock: stock.totalStock,
    status: stock.status,
  }));
}
