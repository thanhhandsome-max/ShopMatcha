/**
 * GET /api/shop
 * Healthcheck endpoint for the shop API
 */

import { successResponse } from "@/lib/api-response";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    successResponse({
      status: "ok",
      message: "Shop API is running",
      timestamp: new Date().toISOString(),
    })
  );
}
