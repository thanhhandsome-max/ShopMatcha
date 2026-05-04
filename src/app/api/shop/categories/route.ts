/**
 * GET /api/shop/categories
 * List all active categories
 */

import { ErrorMessages, errorResponse, successResponse } from "@/lib/api-response";
import { CategoryListSchema } from "@/lib/validation";
import { listCategories } from "@/services/category.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      includeCount: searchParams.get("includeCount"),
    };

    const validated = CategoryListSchema.parse(queryData);

    // Fetch categories
    const categories = await listCategories(validated.includeCount);

    return NextResponse.json(successResponse(categories));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        errorResponse(ErrorMessages.VALIDATION_ERROR, error.errors),
        { status: 400 }
      );
    }

    console.error("Error fetching categories:", error);
    return NextResponse.json(
      errorResponse(ErrorMessages.SERVER_ERROR),
      { status: 500 }
    );
  }
}
