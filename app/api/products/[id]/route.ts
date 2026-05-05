import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock product data
    const products: Record<string, any> = {
      '1': {
        id: '1',
        name: 'Matcha Powder Premium',
        category: 'powder',
        price: 450000,
        rating: 4.5,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1566758336962-b0e2e48a0d38?w=800',
        description: 'High-grade ceremonial matcha powder sourced from Japan',
        inStock: true,
        details: {
          origin: 'Uji, Japan',
          grade: 'Ceremonial',
          weight: '30g',
          servings: 15,
        },
        relatedProducts: ['2', '3'],
      },
      '2': {
        id: '2',
        name: 'Bamboo Whisk Set',
        category: 'tools',
        price: 250000,
        rating: 4.8,
        reviews: 95,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        description: 'Traditional bamboo whisk and bowl set',
        inStock: true,
        details: {
          material: 'Bamboo',
          color: 'Natural',
          pieces: 3,
          handmade: true,
        },
        relatedProducts: ['1', '3'],
      },
      '3': {
        id: '3',
        name: 'Matcha Latte Mix',
        category: 'mix',
        price: 180000,
        rating: 4.2,
        reviews: 76,
        image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd0a494?w=800',
        description: 'Quick and easy matcha latte mix',
        inStock: true,
        details: {
          servings: 20,
          prepTime: '2 minutes',
          ingredients: 'Matcha, sugar, milk powder',
        },
        relatedProducts: ['1', '2'],
      },
    };

    const product = products[id];
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
