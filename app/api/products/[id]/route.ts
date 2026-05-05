import { NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function proxyBackend(path: string, request: Request) {
  const url = new URL(`${BACKEND_API_BASE}${path}`);
  const incomingUrl = new URL(request.url);
  url.search = incomingUrl.search;

  const response = await fetch(url.toString(), {
    method: request.method,
    headers: {
      accept: 'application/json',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxyBackend(`/products/${id}`, request);
  } catch (error) {
    console.error('Proxy error for /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product from backend' },
      { status: 500 }
    );
  }
}
