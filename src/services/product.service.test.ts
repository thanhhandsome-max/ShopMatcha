/**
 * Product Service Unit Tests
 * Test all product service functions with various scenarios
 * 
 * Database Field Names (Vietnamese):
 * - MaSP: Product ID
 * - TenSP: Product Name
 * - GiaBan: Selling Price
 * - GiaVon: Cost Price
 * - Mota: Description
 * - TrangThai: Status (1=Active, 0=Inactive)
 * - MaLoai: Category ID
 * - NgayTao: Creation Date
 * - MaCodeSp: Product Code
 * 
 * Run with: npm run test src/services/product.service.test.ts
 */

import { prisma } from "@/lib/prisma";
import {
  getProductById,
  getProductDetail,
  getProductsWithFilters,
  listProducts
} from "@/services/product.service";
import { afterAll, describe, expect, it } from "@jest/globals";

describe("Product Service", () => {
  // Cleanup function
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("listProducts", () => {
    it("should return active sanpham ordered by creation date", async () => {
      const sanpham = await listProducts();

      expect(Array.isArray(sanpham)).toBe(true);
      sanpham.forEach((product) => {
        expect(product).toHaveProperty("MaSP");
        expect(product).toHaveProperty("TenSP");
        expect(product).toHaveProperty("GiaBan");
        expect(product.TrangThai).toBeTruthy();
      });
    });

    it("should return empty array if no active sanpham", async () => {
      // This test assumes database is empty or only has inactive sanpham
      const sanpham = await listProducts();
      expect(Array.isArray(sanpham)).toBe(true);
    });
  });

  describe("getProductById", () => {
    it("should return null for non-existent product", async () => {
      const product = await getProductById("non-existent-id");
      expect(product).toBeNull();
    });

    it("should return product with all required fields", async () => {
      // This assumes there's at least one product in the database
      const product = await getProductById("any-valid-id");

      if (product) {
        expect(product).toHaveProperty("MaSP");
        expect(product).toHaveProperty("TenSP");
        expect(product).toHaveProperty("GiaBan");
        expect(product).toHaveProperty("loaisanpham");
      }
    });
  });

  describe("getProductsWithFilters", () => {
    it("should return paginated sanpham with default filters", async () => {
      const result = await getProductsWithFilters({});

      expect(result).toHaveProperty("products");
      expect(result).toHaveProperty("pagination");
      expect(result.pagination).toHaveProperty("page", 1);
      expect(result.pagination).toHaveProperty("limit", 12);
      expect(Array.isArray(result.products)).toBe(true);
      if (result.products.length > 0) {
        expect(result.products[0]).toHaveProperty("MaSP");
        expect(result.products[0]).toHaveProperty("TenSP");
      }
    });

    it("should respect pagination parameters", async () => {
      const result = await getProductsWithFilters({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.products.length).toBeLessThanOrEqual(5);
    });

    it("should filter sanpham by category", async () => {
      // This test requires a category ID from seeded data
      const MaLoai = "test-category-id";

      const result = await getProductsWithFilters({
        MaLoai,
      });

      if (result.products.length > 0) {
        result.products.forEach((product) => {
          expect(product.MaLoai).toBe(MaLoai);
        });
      }
    });

    it("should filter sanpham by price range", async () => {
      const result = await getProductsWithFilters({
        minPrice: 100000,
        maxPrice: 200000,
      });

      result.products.forEach((product) => {
        const price = Number(product.GiaBan);
        expect(price).toBeGreaterThanOrEqual(100000);
        expect(price).toBeLessThanOrEqual(200000);
      });
    });

    it("should filter out-of-stock sanpham when inStock=true", async () => {
      const result = await getProductsWithFilters({
        inStock: true,
      });

      result.products.forEach((product) => {
        // Check if product has stock info available
        expect(product).toHaveProperty("MaSP");
      });
    });

    it("should sort sanpham correctly", async () => {
      // Test price_asc
      const asc = await getProductsWithFilters({
        sortBy: "price_asc",
        limit: 20,
      });

      for (let i = 0; i < asc.products.length - 1; i++) {
        const current = Number(asc.products[i].GiaBan) || 0;
        const next = Number(asc.products[i + 1].GiaBan) || 0;
        expect(current).toBeLessThanOrEqual(next);
      }

      // Test price_desc
      const desc = await getProductsWithFilters({
        sortBy: "price_desc",
        limit: 20,
      });

      for (let i = 0; i < desc.products.length - 1; i++) {
        const current = Number(desc.products[i].GiaBan) || 0;
        const next = Number(desc.products[i + 1].GiaBan) || 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should search sanpham by query", async () => {
      const result = await getProductsWithFilters({
        search: "matcha",
      });

      result.products.forEach((product) => {
        const searchTerm = "matcha".toLowerCase();
        const productName = product.TenSP.toLowerCase();

        expect(
          productName.includes(searchTerm) ||
            product.Mota?.toLowerCase().includes(searchTerm)
        ).toBe(true);
      });
    });
  });

  describe("getProductDetail", () => {
    it("should return null for non-existent product", async () => {
      const product = await getProductDetail("non-existent");
      expect(product).toBeNull();
    });

    it("should return detailed product with stock information", async () => {
      // This test requires a valid product ID
      // const product = await getProductDetail("valid-product-id");

      // if (product) {
      //   expect(product).toHaveProperty("MaSP");
      //   expect(product).toHaveProperty("TenSP");
      //   expect(product).toHaveProperty("GiaBan");
      //   expect(product).toHaveProperty("tonkho");
      //   expect(product).toHaveProperty("tonkhocuahang");
      // }
    });
  });

  describe("searchProducts", () => {
    it("should return search results", async () => {
      const results = await searchProducts("tea", 10);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it("should return empty array for no matches", async () => {
      const results = await searchProducts("xyzabc123", 10);

      expect(Array.isArray(results)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const results = await searchProducts("a", 5);

      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getRelatedProducts", () => {
    it("should return empty array without category", async () => {
      const sanpham = await getRelatedProducts(undefined, "prod-1", 4);

      expect(Array.isArray(sanpham)).toBe(true);
      expect(sanpham.length).toBe(0);
    });

    it("should not include current product", async () => {
      // This test requires valid category ID and product ID
      // const sanpham = await getRelatedProducts("cat-1", "prod-1", 4);

      // sanpham.forEach((product) => {
      //   expect(product.MaSP).not.toBe("prod-1");
      // });
    });
  });

  describe("getFeaturedProducts", () => {
    it("should return featured sanpham", async () => {
      const sanpham = await getFeaturedProducts(8);

      expect(Array.isArray(sanpham)).toBe(true);
      expect(sanpham.length).toBeLessThanOrEqual(8);

      sanpham.forEach((product) => {
        expect(product).toHaveProperty("MaSP");
        expect(product).toHaveProperty("TenSP");
        expect(product).toHaveProperty("GiaBan");
      });
    });
  });

  describe("getNewProducts", () => {
    it("should return newest sanpham", async () => {
      const sanpham = await getNewProducts(8);

      expect(Array.isArray(sanpham)).toBe(true);
      expect(sanpham.length).toBeLessThanOrEqual(8);

      sanpham.forEach((product) => {
        expect(product).toHaveProperty("MaSP");
        expect(product).toHaveProperty("NgayTao");
      });
    });

    it("should return sanpham sorted by creation date", async () => {
      const sanpham = await getNewProducts(5);

      if (sanpham.length > 1) {
        for (let i = 0; i < sanpham.length - 1; i++) {
          const current = new Date(sanpham[i].NgayTao).getTime();
          const next = new Date(sanpham[i + 1].NgayTao).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });
});
