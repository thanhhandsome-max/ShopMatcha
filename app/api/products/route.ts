import { NextResponse } from 'next/server';

// Mock API responses for development
// In production, these would connect to a real backend

export async function GET() {
  try {
    // Return products from mock data
    const products = [
      {
        id: '1',
        name: 'Matcha Powder Premium',
        category: 'powder',
        price: 450000,
        rating: 4.5,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1566758336962-b0e2e48a0d38?w=500&h=500&fit=crop',
        description: 'High-grade ceremonial matcha powder',
        inStock: true,
      },
      {
        id: '2',
        name: 'Bamboo Whisk Set',
        category: 'tools',
        price: 250000,
        rating: 4.8,
        reviews: 95,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
        description: 'Traditional bamboo whisk and bowl set',
        inStock: true,
      },
      {
        id: '3',
        name: 'Matcha Latte Mix',
        category: 'mix',
        price: 180000,
        rating: 4.2,
        reviews: 76,
        image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd0a494?w=500&h=500&fit=crop',
        description: 'Quick and easy matcha latte mix',
        inStock: true,
      },
    ];

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
