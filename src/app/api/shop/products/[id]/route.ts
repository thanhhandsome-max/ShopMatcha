/**
 * GET /api/shop/products/[id]
 * Get single product detail
 */

import { ErrorMessages, errorResponse, successResponse } from "@/lib/api-response";
import {
    getProductDetail,
    getRelatedProducts,
} from "@/services/product.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.length === 0) {
      return NextResponse.json(
        errorResponse(ErrorMessages.INVALID_PARAMS, {
          id: "Product ID is required and must be a valid string",
        }),
        { status: 400 }
      );
    }

    // Fetch product detail
    const product = await getProductDetail(id);

    if (!product) {
      return NextResponse.json(
        errorResponse(ErrorMessages.NOT_FOUND),
        { status: 404 }
      );
    }

    // Fetch related products
    const relatedProducts = await getRelatedProducts(
      product.loaisanpham?.MaLoai,
      id,
      4
    );

    return NextResponse.json(
      successResponse({
        ...product,
        relatedProducts,
      })
    );
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      errorResponse(ErrorMessages.SERVER_ERROR),
      { status: 500 }
    );
  }
}
