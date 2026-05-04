/**
 * React Hooks for Shop API
 * Reusable hooks for fetching shop data
 */

"use client";

import type { ApiResponse } from "@/lib/api-response";
import type { ProductFilters } from "@/lib/validation";
import { useCallback } from "react";

/**
 * Fetch products with filters
 */
export async function fetchProducts(filters: Partial<ProductFilters>) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", filters.page.toString());
  if (filters.limit) params.set("limit", filters.limit.toString());
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.search) params.set("search", filters.search);
  if (filters.minPrice !== undefined)
    params.set("minPrice", filters.minPrice.toString());
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", filters.maxPrice.toString());
  if (filters.inStock !== undefined)
    params.set("inStock", filters.inStock.toString());

  const response = await fetch(`/api/shop/products?${params}`);
  return response.json() as Promise<ApiResponse<any>>;
}

/**
 * Fetch single product details
 */
export async function fetchProductDetail(productId: string) {
  const response = await fetch(`/api/shop/products/${productId}`);
  return response.json() as Promise<ApiResponse<any>>;
}

/**
 * Search products
 */
export async function searchProducts(query: string, limit?: number) {
  const params = new URLSearchParams({ q: query });
  if (limit) params.set("limit", limit.toString());

  const response = await fetch(`/api/shop/products/search?${params}`);
  return response.json() as Promise<ApiResponse<any>>;
}

/**
 * Fetch categories
 */
export async function fetchCategories(includeCount = true) {
  const params = new URLSearchParams({
    includeCount: includeCount.toString(),
  });

  const response = await fetch(`/api/shop/categories?${params}`);
  return response.json() as Promise<ApiResponse<any>>;
}

/**
 * Fetch homepage data (all in one)
 */
export async function fetchHomepageData() {
  const response = await fetch("/api/shop/homepage");
  return response.json() as Promise<ApiResponse<any>>;
}

/**
 * Custom hook for fetching homepage data
 */
export function useHomepage() {
  return useCallback(async () => {
    try {
      const data = await fetchHomepageData();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch homepage data:", error);
      throw error;
    }
  }, []);
}

/**
 * Custom hook for fetching products
 */
export function useProducts() {
  return useCallback(async (filters: Partial<ProductFilters>) => {
    try {
      const data = await fetchProducts(filters);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  }, []);
}

/**
 * Custom hook for fetching product detail
 */
export function useProductDetail() {
  return useCallback(async (productId: string) => {
    try {
      const data = await fetchProductDetail(productId);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch product detail:", error);
      throw error;
    }
  }, []);
}

/**
 * Custom hook for searching products
 */
export function useProductSearch() {
  return useCallback(async (query: string, limit?: number) => {
    try {
      const data = await searchProducts(query, limit);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to search products:", error);
      throw error;
    }
  }, []);
}

/**
 * Custom hook for fetching categories
 */
export function useCategories() {
  return useCallback(async (includeCount = true) => {
    try {
      const data = await fetchCategories(includeCount);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }, []);
}
