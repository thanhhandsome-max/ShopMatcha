/**
 * Zod Validation Schemas for Shop API
 * Centralized validation for request parameters
 */

import { z } from "zod";

/**
 * Product listing and filtering schema
 */
export const ProductFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  MaLoai: z.string().optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "newest", "name"])
    .optional()
    .default("newest"),
  search: z.string().max(100).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  inStock: z.coerce.boolean().optional(),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

/**
 * Search schema
 */
export const SearchSchema = z.object({
  q: z.string().min(2, "Search term must be at least 2 characters").max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type SearchInput = z.infer<typeof SearchSchema>;

/**
 * Category listing schema
 */
export const CategoryListSchema = z.object({
  includeCount: z.coerce.boolean().default(true),
});

export type CategoryListInput = z.infer<typeof CategoryListSchema>;

/**
 * Product ID schema (for route parameters)
 */
export const ProductIdSchema = z.object({
  MaSP: z.string().min(1, "Product ID is required"),
});

export type ProductIdInput = z.infer<typeof ProductIdSchema>;

/**
 * Category ID schema (for route parameters)
 */
export const CategoryIdSchema = z.object({
  MaLoai: z.string().min(1, "Category ID is required"),
});

export type CategoryIdInput = z.infer<typeof CategoryIdSchema>;
