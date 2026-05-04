/**
 * GET /api/shop/homepage
 * Get all homepage data in a single request
 */

import { ErrorMessages, errorResponse, successResponse } from "@/lib/api-response";
import { getHomepageData } from "@/services/homepage.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomepageData();
    return NextResponse.json(successResponse(data));
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return NextResponse.json(
      errorResponse(ErrorMessages.SERVER_ERROR),
      { status: 500 }
    );
  }
}
