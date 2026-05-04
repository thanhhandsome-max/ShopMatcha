/**
 * GET /api/shop/products
 * List products with filtering, sorting, and pagination
 */

import { ErrorMessages, errorResponse, successResponse } from "@/lib/api-response";
import { ProductFiltersSchema } from "@/lib/validation";
import { getProductsWithFilters } from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      MaLoai: searchParams.get("MaLoai") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      inStock: searchParams.get("inStock") || undefined,
    };

    // Validate query parameters
    const validated = ProductFiltersSchema.parse(queryData);

    // Fetch products
    const result = await getProductsWithFilters(validated);

    return NextResponse.json(
      successResponse({
        products: result.products,
        pagination: result.pagination,
      })
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        errorResponse(ErrorMessages.VALIDATION_ERROR, error.errors),
        { status: 400 }
      );
    }

    console.error("Error fetching products:", error);
    return NextResponse.json(
      errorResponse(ErrorMessages.SERVER_ERROR),
      { status: 500 }
    );
  }
}
