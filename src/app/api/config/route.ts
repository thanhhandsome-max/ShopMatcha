import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
      features: {
        auth: process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'false',
        cart: process.env.NEXT_PUBLIC_ENABLE_CART !== 'false',
        reviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS !== 'false',
      },
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to load config:', error);
    return NextResponse.json(
      {
        apiUrl: 'http://localhost:3000',
        apiTimeout: 30000,
        features: {
          auth: true,
          cart: true,
          reviews: true,
        },
      },
      { status: 200 }
    );
  }
}
