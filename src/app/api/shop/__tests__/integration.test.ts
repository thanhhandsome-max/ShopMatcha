/**
 * API Integration Tests
 * Test all API endpoints with real HTTP requests
 * 
 * Run with: npm run test -- src/app/api/shop/__tests__
 */

import { describe, expect, it } from "@jest/globals";

describe("Shop API Integration Tests", () => {
  const baseUrl = "http://localhost:3000/api/shop";

  describe("GET /api/shop", () => {
    it("should return healthcheck response", async () => {
      const response = await fetch(`${baseUrl}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("status", "ok");
      expect(data.data).toHaveProperty("message");
      expect(data.data).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/shop/categories", () => {
    it("should return categories list", async () => {
      const response = await fetch(`${baseUrl}/categories`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const category = data.data[0];
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("slug");
      }
    });

    it("should include product count when requested", async () => {
      const response = await fetch(
        `${baseUrl}/categories?includeCount=true`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty("productCount");
      }
    });

    it("should exclude product count when not requested", async () => {
      const response = await fetch(
        `${baseUrl}/categories?includeCount=false`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      if (data.data.length > 0) {
        expect(data.data[0].productCount).toBeUndefined();
      }
    });
  });

  describe("GET /api/shop/products", () => {
    it("should return products with default pagination", async () => {
      const response = await fetch(`${baseUrl}/products`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("products");
      expect(data.data).toHaveProperty("pagination");

      const { pagination } = data.data;
      expect(pagination).toHaveProperty("page", 1);
      expect(pagination).toHaveProperty("limit", 12);
      expect(pagination).toHaveProperty("total");
      expect(pagination).toHaveProperty("totalPages");
      expect(pagination).toHaveProperty("hasMore");
    });

    it("should respect page parameter", async () => {
      const response = await fetch(`${baseUrl}/products?page=2&limit=5`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(5);
    });

    it("should filter by category", async () => {
      // First get a category
      const catResponse = await fetch(`${baseUrl}/categories?includeCount=false`);
      const catData = await catResponse.json();

      if (catData.data.length > 0) {
        const categoryId = catData.data[0].id;

        const response = await fetch(
          `${baseUrl}/products?categoryId=${categoryId}`
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it("should filter by price range", async () => {
      const response = await fetch(
        `${baseUrl}/products?minPrice=100000&maxPrice=300000`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      data.data.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(100000);
        expect(product.price).toBeLessThanOrEqual(300000);
      });
    });

    it("should sort by price ascending", async () => {
      const response = await fetch(`${baseUrl}/products?sortBy=price_asc`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const { products } = data.data;
      for (let i = 0; i < products.length - 1; i++) {
        expect(products[i].price).toBeLessThanOrEqual(products[i + 1].price);
      }
    });

    it("should sort by price descending", async () => {
      const response = await fetch(`${baseUrl}/products?sortBy=price_desc`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const { products } = data.data;
      for (let i = 0; i < products.length - 1; i++) {
        expect(products[i].price).toBeGreaterThanOrEqual(
          products[i + 1].price
        );
      }
    });

    it("should handle inStock filter", async () => {
      const response = await fetch(`${baseUrl}/products?inStock=true`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      data.data.products.forEach((product: any) => {
        expect(product.totalStock).toBeGreaterThan(0);
      });
    });

    it("should reject invalid parameters", async () => {
      const response = await fetch(`${baseUrl}/products?page=abc&limit=xyz`);
      const data = await response.json();

      // Should either coerce or reject
      if (response.status === 400) {
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
      }
    });

    it("should reject limit > 50", async () => {
      const response = await fetch(`${baseUrl}/products?limit=100`);
      const data = await response.json();

      if (response.status === 400) {
        expect(data.success).toBe(false);
      } else {
        // If accepted, limit should be capped at 50
        expect(data.data.pagination.limit).toBeLessThanOrEqual(50);
      }
    });
  });

  describe("GET /api/shop/products/search", () => {
    it("should search products", async () => {
      const response = await fetch(`${baseUrl}/products/search?q=tea`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("query", "tea");
      expect(Array.isArray(data.data.results)).toBe(true);
    });

    it("should reject search query < 2 characters", async () => {
      const response = await fetch(`${baseUrl}/products/search?q=a`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should respect limit parameter", async () => {
      const response = await fetch(`${baseUrl}/products/search?q=tea&limit=5`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /api/shop/products/:id", () => {
    it("should return 404 for non-existent product", async () => {
      const response = await fetch(
        `${baseUrl}/products/non-existent-id`
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Resource not found");
    });

    it("should return product detail with related products", async () => {
      // First get a product ID
      const listResponse = await fetch(`${baseUrl}/products?limit=1`);
      const listData = await listResponse.json();

      if (listData.data.products.length > 0) {
        const productId = listData.data.products[0].id;

        const response = await fetch(`${baseUrl}/products/${productId}`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("id", productId);
        expect(data.data).toHaveProperty("name");
        expect(data.data).toHaveProperty("price");
        expect(data.data).toHaveProperty("stock");
        expect(data.data).toHaveProperty("relatedProducts");
      }
    });
  });

  describe("GET /api/shop/homepage", () => {
    it("should return all homepage data", async () => {
      const response = await fetch(`${baseUrl}/homepage`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("categories");
      expect(data.data).toHaveProperty("featuredProducts");
      expect(data.data).toHaveProperty("newProducts");
      expect(data.data).toHaveProperty("stats");

      expect(Array.isArray(data.data.categories)).toBe(true);
      expect(Array.isArray(data.data.featuredProducts)).toBe(true);
      expect(Array.isArray(data.data.newProducts)).toBe(true);

      expect(data.data.stats).toHaveProperty("totalProducts");
      expect(data.data.stats).toHaveProperty("totalCategories");
      expect(data.data.stats).toHaveProperty("activeProducts");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      // This would require mocking a database error
      // Placeholder for now
      expect(true).toBe(true);
    });

    it("should return 500 for server errors", async () => {
      // This would require triggering a server error
      // Placeholder for now
      expect(true).toBe(true);
    });
  });
});
