/**
 * GET /api/shop/products/search
 * Search products by query string
 */

import { ErrorMessages, errorResponse, successResponse } from "@/lib/api-response";
import { SearchSchema } from "@/lib/validation";
import { searchProducts } from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      q: searchParams.get("q"),
      limit: searchParams.get("limit"),
    };

    // Validate search input
    const validated = SearchSchema.parse(queryData);

    // Search products
    const results = await searchProducts(validated.q, validated.limit);

    return NextResponse.json(
      successResponse({
        query: validated.q,
        results,
        count: results.length,
      })
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        errorResponse(ErrorMessages.VALIDATION_ERROR, error.errors),
        { status: 400 }
      );
    }

    console.error("Error searching products:", error);
    return NextResponse.json(
      errorResponse(ErrorMessages.SERVER_ERROR),
      { status: 500 }
    );
  }
}
