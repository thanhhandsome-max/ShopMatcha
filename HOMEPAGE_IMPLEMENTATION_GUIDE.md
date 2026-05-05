# Homepage Backend - Implementation Guide
## Hướng dẫn triển khai chi tiết từng bước

**Document Date:** May 5, 2026

---

## 📋 Table of Contents

1. Project Setup
2. Service Layer Implementation
3. Controller Layer Implementation
4. Route Configuration
5. Error Handling
6. Testing

---

## 🚀 Step 1: Project Setup

### 1.1 Initialize Project
```bash
mkdir shopmatcha-backend
cd shopmatcha-backend

npm init -y

npm install \
  express \
  typescript \
  dotenv \
  cors \
  helmet \
  morgan \
  @prisma/client

npm install -D \
  @types/express \
  @types/node \
  @types/cors \
  ts-node \
  nodemon
```

### 1.2 TypeScript Configuration
**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Environment Variables
**.env:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/shopmatcha

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 1.4 Package.json Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "lint": "eslint src",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

### 1.5 Prisma Setup
```bash
# Generate Prisma client from existing schema
npx prisma generate

# Verify schema with database
npx prisma db push --skip-generate
```

---

## 🔧 Step 2: Service Layer Implementation

### 2.1 CategoryService.ts
```typescript
// src/services/categoryService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  async getAllCategories() {
    try {
      return await prisma.loaisanpham.findMany({
        where: {
          TrangThai: 1
        },
        include: {
          _count: {
            select: {
              sanpham: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }
}

export default new CategoryService();
```

### 2.2 ProductService.ts
```typescript
// src/services/productService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductFilters {
  category?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'name-asc';
  page?: number;
  limit?: number;
}

export class ProductService {
  async getProducts(filters?: ProductFilters) {
    try {
      const page = filters?.page || 1;
      const limit = Math.min(filters?.limit || 20, 100);
      const skip = (page - 1) * limit;

      let where: any = { TrangThai: "1" };

      if (filters?.category) {
        where.MaLoai = filters.category;
      }

      let orderBy: any = { NgayTao: 'desc' };

      switch (filters?.sort) {
        case 'price-asc':
          orderBy = { GiaBan: 'asc' };
          break;
        case 'price-desc':
          orderBy = { GiaBan: 'desc' };
          break;
        case 'name-asc':
          orderBy = { TenSP: 'asc' };
          break;
        case 'newest':
        default:
          orderBy = { NgayTao: 'desc' };
      }

      const [products, total] = await Promise.all([
        prisma.sanpham.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            loaisanpham: true,
            sanpham_anh: {
              orderBy: [
                { AnhChinh: 'desc' },
                { ThuTu: 'asc' }
              ],
              take: 5
            },
            tonkho: {
              select: {
                SoLuong: true,
                MaKho: true
              }
            }
          }
        }),
        prisma.sanpham.count({ where })
      ]);

      return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProductById(id: string) {
    try {
      const product = await prisma.sanpham.findUnique({
        where: { MaSP: id },
        include: {
          loaisanpham: true,
          sanpham_anh: {
            orderBy: [
              { AnhChinh: 'desc' },
              { ThuTu: 'asc' }
            ]
          },
          tonkho: {
            select: {
              SoLuong: true,
              MaKho: true
            }
          },
          tonkhocuahang: {
            select: {
              MaCH: true,
              SoLuong: true
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Calculate total stock
      const totalStock = await prisma.tonkho.aggregate({
        where: { MaSP: id },
        _sum: { SoLuong: true }
      });

      return {
        ...product,
        totalStock: totalStock._sum.SoLuong || 0
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  async getRelatedProducts(id: string, limit: number = 5) {
    try {
      const product = await prisma.sanpham.findUnique({
        where: { MaSP: id },
        select: { MaLoai: true }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return prisma.sanpham.findMany({
        where: {
          MaLoai: product.MaLoai,
          MaSP: { not: id },
          TrangThai: "1"
        },
        take: limit,
        include: {
          sanpham_anh: {
            where: { AnhChinh: 1 },
            take: 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw new Error('Failed to fetch related products');
    }
  }
}

export default new ProductService();
```

### 2.3 SearchService.ts
```typescript
// src/services/searchService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SearchService {
  async searchProducts(query: string, limit: number = 20) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }

      const results = await prisma.sanpham.findMany({
        where: {
          AND: [
            { TrangThai: "1" },
            {
              OR: [
                { TenSP: { contains: query, mode: 'insensitive' } },
                { Mota: { contains: query, mode: 'insensitive' } },
                { MaCodeSp: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        take: Math.min(limit, 100),
        include: {
          sanpham_anh: {
            where: { AnhChinh: 1 },
            take: 1
          },
          loaisanpham: true
        }
      });

      return {
        query,
        results,
        count: results.length
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }
}

export default new SearchService();
```

### 2.4 PromotionService.ts
```typescript
// src/services/promotionService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PromotionService {
  async getActivePromotions() {
    try {
      const now = new Date();

      return await prisma.khuyenmai.findMany({
        where: {
          thoihan: {
            gte: now
          }
        },
        include: {
          sanpham: {
            select: {
              MaSP: true,
              TenSP: true,
              GiaBan: true,
              sanpham_anh: {
                where: { AnhChinh: 1 },
                take: 1
              }
            }
          },
          cuahang: {
            select: {
              MaCH: true,
              TenCH: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw new Error('Failed to fetch promotions');
    }
  }
}

export default new PromotionService();
```

---

## 🎮 Step 3: Controller Layer Implementation

### 3.1 ProductController.ts
```typescript
// src/controllers/productController.ts
import { Request, Response } from 'express';
import ProductService from '@/services/productService';

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const { category, sort, page, limit } = req.query;

      const filters = {
        category: category as string,
        sort: sort as any,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
      };

      // Validate limit
      if (filters.limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit. Maximum is 100',
          code: 400
        });
      }

      const data = await ProductService.getProducts(filters);

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch products',
        code: 500
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await ProductService.getProductById(id);

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch product',
        code: statusCode
      });
    }
  }

  async getRelated(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const data = await ProductService.getRelatedProducts(
        id,
        limit ? parseInt(limit as string) : 5
      );

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch related products',
        code: statusCode
      });
    }
  }
}

export default new ProductController();
```

### 3.2 CategoryController.ts
```typescript
// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import CategoryService from '@/services/categoryService';

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await CategoryService.getAllCategories();

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch categories',
        code: 500
      });
    }
  }
}

export default new CategoryController();
```

### 3.3 SearchController.ts
```typescript
// src/controllers/searchController.ts
import { Request, Response } from 'express';
import SearchService from '@/services/searchService';

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          code: 400
        });
      }

      const data = await SearchService.searchProducts(
        q as string,
        limit ? parseInt(limit as string) : 20
      );

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search products',
        code: 500
      });
    }
  }
}

export default new SearchController();
```

### 3.4 PromotionController.ts
```typescript
// src/controllers/promotionController.ts
import { Request, Response } from 'express';
import PromotionService from '@/services/promotionService';

export class PromotionController {
  async getActive(req: Request, res: Response) {
    try {
      const data = await PromotionService.getActivePromotions();

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch promotions',
        code: 500
      });
    }
  }
}

export default new PromotionController();
```

---

## 🛣️ Step 4: Route Configuration

### 4.1 routes/productRoutes.ts
```typescript
// src/routes/productRoutes.ts
import express from 'express';
import ProductController from '@/controllers/productController';

const router = express.Router();

router.get('/', ProductController.getAll);
router.get('/:id/related', ProductController.getRelated);
router.get('/:id', ProductController.getById);

export default router;
```

### 4.2 routes/categoryRoutes.ts
```typescript
// src/routes/categoryRoutes.ts
import express from 'express';
import CategoryController from '@/controllers/categoryController';

const router = express.Router();

router.get('/', CategoryController.getAll);

export default router;
```

### 4.3 routes/searchRoutes.ts
```typescript
// src/routes/searchRoutes.ts
import express from 'express';
import SearchController from '@/controllers/searchController';

const router = express.Router();

router.get('/', SearchController.search);

export default router;
```

### 4.4 routes/promotionRoutes.ts
```typescript
// src/routes/promotionRoutes.ts
import express from 'express';
import PromotionController from '@/controllers/promotionController';

const router = express.Router();

router.get('/', PromotionController.getActive);

export default router;
```

---

## 📱 Step 5: Main Application Setup

### 5.1 app.ts
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import productRoutes from '@/routes/productRoutes';
import categoryRoutes from '@/routes/categoryRoutes';
import searchRoutes from '@/routes/searchRoutes';
import promotionRoutes from '@/routes/promotionRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/promotions', promotionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    code: 404
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.statusCode || 500
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

export default app;
```

---

## 🧪 Step 6: Testing

### 6.1 Manual Testing with cURL

```bash
# Test health
curl http://localhost:5000/health

# Get categories
curl http://localhost:5000/api/categories

# Get products
curl http://localhost:5000/api/products

# Get products with filters
curl "http://localhost:5000/api/products?category=CAT001&sort=price-asc&limit=10"

# Get single product
curl http://localhost:5000/api/products/SP001

# Get related products
curl http://localhost:5000/api/products/SP001/related

# Search products
curl "http://localhost:5000/api/search?q=matcha"

# Get active promotions
curl http://localhost:5000/api/promotions
```

### 6.2 Test Script (Node.js)
```typescript
// test.ts
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testApis() {
  try {
    // Test 1: Categories
    console.log('Testing GET /categories...');
    let res = await fetch(`${BASE_URL}/categories`);
    let data = await res.json();
    console.log('✅ Categories:', data.data.length, 'items');

    // Test 2: Products
    console.log('\nTesting GET /products...');
    res = await fetch(`${BASE_URL}/products?limit=5`);
    data = await res.json();
    console.log('✅ Products:', data.data.products.length, 'items');

    // Test 3: Product Detail
    if (data.data.products.length > 0) {
      const productId = data.data.products[0].MaSP;
      console.log(`\nTesting GET /products/${productId}...`);
      res = await fetch(`${BASE_URL}/products/${productId}`);
      data = await res.json();
      console.log('✅ Product detail:', data.data.TenSP);

      // Test 4: Related Products
      console.log(`\nTesting GET /products/${productId}/related...`);
      res = await fetch(`${BASE_URL}/products/${productId}/related`);
      data = await res.json();
      console.log('✅ Related products:', data.data.length, 'items');
    }

    // Test 5: Search
    console.log('\nTesting GET /search?q=matcha...');
    res = await fetch(`${BASE_URL}/search?q=matcha`);
    data = await res.json();
    console.log('✅ Search results:', data.data.count, 'items');

    // Test 6: Promotions
    console.log('\nTesting GET /promotions...');
    res = await fetch(`${BASE_URL}/promotions`);
    data = await res.json();
    console.log('✅ Promotions:', data.data.length, 'active');

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testApis();
```

---

## 📝 Directory Structure

```
shopmatcha-backend/
├── src/
│   ├── controllers/
│   │   ├── productController.ts
│   │   ├── categoryController.ts
│   │   ├── searchController.ts
│   │   └── promotionController.ts
│   ├── services/
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── searchService.ts
│   │   └── promotionService.ts
│   ├── routes/
│   │   ├── productRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── searchRoutes.ts
│   │   └── promotionRoutes.ts
│   └── app.ts
├── prisma/
│   └── schema.prisma
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup Prisma
npx prisma generate

# 3. Start development server
npm run dev

# 4. Test in another terminal
curl http://localhost:5000/health
```

---

**Status:** Ready to Deploy  
**Last Updated:** May 5, 2026
