# Backend Homepage - Chi tiết thiết kế
## ShopMatcha - Homepage Backend Specification

**Document Date:** May 5, 2026  
**Scope:** Homepage Backend Only  
**Database Schema:** Schema.prisma (20+ models)

---

## 🎯 Homepage Overview

Homepage là trang đầu tiên người dùng thấy, bao gồm:
- ✅ Danh sách sản phẩm nổi bật
- ✅ Danh mục sản phẩm
- ✅ Khuyến mãi hiện tại
- ✅ Hình ảnh sản phẩm
- ✅ Giá bán & giá gốc
- ✅ Tìm kiếm sản phẩm
- ✅ Sản phẩm liên quan
- ✅ Liên hệ

---

## 📊 Frontend Homepage Screens (Cần API nào)

```
┌─ Homepage
│  ├─ Hero Banner (Static)
│  ├─ Featured Products Section
│  │  └─ GET /api/products?featured=true
│  ├─ Categories Section
│  │  └─ GET /api/categories
│  ├─ All Products Grid
│  │  ├─ GET /api/products?page=&limit=&sort=
│  │  └─ GET /api/products?category=
│  ├─ Product Cards (Each)
│  │  └─ sanpham + sanpham_anh + giá bán
│  ├─ Promotions Banner
│  │  └─ GET /api/promotions
│  └─ Search Bar
│     └─ GET /api/search?q=

┌─ Product Detail Page
│  ├─ GET /api/products/:id
│  ├─ GET /api/products/:id/related
│  └─ Product Images from sanpham_anh

┌─ Contact Page
│  └─ POST /api/contact (existing)
```

---

## 🗄️ Database Models Mapping (Từ schema.prisma)

### Model: sanpham (Products)
```prisma
model sanpham {
  MaSP          String    @id              // Product ID
  TenSP         String                     // Product Name
  MaCodeSp      String?   @unique          // Product Code
  GiaVon        Decimal                    // Cost Price
  GiaBan        Decimal                    // Selling Price
  Mota          String?   @db.Text         // Description
  TrangThai     String    @default("1")    // Status (1=active)
  MaLoai        String?                    // Category ID (FK)
  NgayTao       DateTime  @default(now())  // Created Date
  
  // Relations
  loaisanpham   loaisanpham?
  tonkho        tonkho[]                   // Warehouse stock
  tonkhocuahang tonkhocuahang[]           // Store stock
  sanpham_anh   sanpham_anh[]             // Images
  chitietdonhang chitietdonhang[]
}
```

**API Usage:** Get product data with all details
```typescript
// Get product with images and category
const product = await prisma.sanpham.findUnique({
  where: { MaSP: id },
  include: {
    loaisanpham: true,
    sanpham_anh: { orderBy: { ThuTu: 'asc' } },
    tonkho: true,
    tonkhocuahang: true
  }
});
```

---

### Model: sanpham_anh (Product Images)
```prisma
model sanpham_anh {
  MaAnh        String   @id                // Image ID
  MaSP         String                      // Product ID (FK)
  DuongDanAnh  String                      // Image URL/Path
  ThuTu        Int?     @default(0)        // Order
  AnhChinh     Int?     @default(0)        // Is Main (0=no, 1=yes)
  
  sanpham      sanpham @relation(...)
}
```

**API Usage:** Get product images
```typescript
// Get main image
const images = await prisma.sanpham_anh.findMany({
  where: { MaSP: id },
  orderBy: [{ AnhChinh: 'desc' }, { ThuTu: 'asc' }]
});
```

---

### Model: loaisanpham (Categories)
```prisma
model loaisanpham {
  MaLoai     String    @id         // Category ID
  TenLoai    String                // Category Name
  Mota       String?   @db.Text    // Description
  TrangThai  Int?      @default(1) // Status
  
  sanpham    sanpham[]
}
```

**API Usage:** Get all categories
```typescript
const categories = await prisma.loaisanpham.findMany({
  where: { TrangThai: 1 },
  include: { 
    _count: { select: { sanpham: true } } 
  }
});
```

---

### Model: khuyenmai (Promotions)
```prisma
model khuyenmai {
  Makhuyenmai  String    @id        // Promotion ID
  MaCH         String?              // Store ID (optional)
  Masp         String?              // Product ID (optional)
  mota         String?   @db.Text   // Description
  giatri       Decimal              // Discount Value
  thoihan      DateTime?            // Expiry Date
  
  cuahang      cuahang?
  sanpham      sanpham?
}
```

**API Usage:** Get active promotions
```typescript
const promotions = await prisma.khuyenmai.findMany({
  where: {
    thoihan: { gte: new Date() }
  },
  include: {
    cuahang: true,
    sanpham: true
  }
});
```

---

### Model: tonkho (Warehouse Stock)
```prisma
model tonkho {
  MaKho        String    // Warehouse ID (FK)
  MaSP         String    // Product ID (FK)
  SoLuong      Int?      // Stock Quantity
  NgayCapNhat  DateTime
  
  @@id([MaKho, MaSP])
}
```

**API Usage:** Check product availability
```typescript
const totalStock = await prisma.tonkho.aggregate({
  where: { MaSP: productId },
  _sum: { SoLuong: true }
});
```

---

### Model: tonkhocuahang (Store Stock)
```prisma
model tonkhocuahang {
  MaSP       String    // Product ID
  MaCH       String    // Store ID
  SoLuong    Int?      // Stock at Store
  
  @@id([MaSP, MaCH])
}
```

---

## 🚀 Homepage Backend - API Endpoints

### Phase 1: Core Endpoints (5 Endpoints)

#### 1.1 GET /api/categories - Lấy danh mục
**Purpose:** Hiển thị danh mục trên Homepage

**Request:**
```bash
GET /api/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "MaLoai": "CAT001",
      "TenLoai": "Matcha Premium",
      "Mota": "Matcha cao cấp từ Kyoto",
      "TrangThai": 1,
      "_count": { "sanpham": 5 }
    },
    {
      "MaLoai": "CAT002",
      "TenLoai": "Sencha & Hojicha",
      "Mota": "Trà xanh Nhật Bản",
      "TrangThai": 1,
      "_count": { "sanpham": 8 }
    }
  ]
}
```

**Service Method:**
```typescript
async getAllCategories() {
  return prisma.loaisanpham.findMany({
    where: { TrangThai: 1 },
    include: {
      _count: { select: { sanpham: true } }
    }
  });
}
```

---

#### 1.2 GET /api/products - Lấy danh sách sản phẩm
**Purpose:** Hiển thị sản phẩm với filter & sort

**Request:**
```bash
GET /api/products?category=CAT001&sort=price-asc&page=1&limit=20&featured=false
```

**Query Parameters:**
- `category` (optional): MaLoai
- `sort` (optional): `price-asc`, `price-desc`, `newest`, `name-asc`
- `page` (optional): Trang (default=1)
- `limit` (optional): Số sản phẩm/trang (default=20, max=100)
- `featured` (optional): true/false

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "MaSP": "SP001",
        "TenSP": "Matcha Powder Premium",
        "MaCodeSp": "MPP001",
        "GiaVon": 150000,
        "GiaBan": 450000,
        "TrangThai": "1",
        "MaLoai": "CAT001",
        "Mota": "High-grade ceremonial matcha",
        "NgayTao": "2026-05-01T10:00:00Z",
        "loaisanpham": {
          "MaLoai": "CAT001",
          "TenLoai": "Matcha Premium"
        },
        "sanpham_anh": [
          {
            "MaAnh": "IMG001",
            "DuongDanAnh": "https://cdn.shopmatcha.com/sp001.jpg",
            "AnhChinh": 1,
            "ThuTu": 0
          }
        ],
        "tonkho": [
          {
            "MaKho": "KHO001",
            "SoLuong": 50
          }
        ]
      }
    ],
    "total": 125,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```

**Service Method:**
```typescript
async getProducts(filters?: {
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const page = filters?.page || 1;
  const limit = Math.min(filters?.limit || 20, 100);
  const skip = (page - 1) * limit;

  let where: any = { TrangThai: "1" };
  
  if (filters?.category) {
    where.MaLoai = filters.category;
  }

  let orderBy: any = { NgayTao: 'desc' };
  
  if (filters?.sort === 'price-asc') {
    orderBy = { GiaBan: 'asc' };
  } else if (filters?.sort === 'price-desc') {
    orderBy = { GiaBan: 'desc' };
  } else if (filters?.sort === 'name-asc') {
    orderBy = { TenSP: 'asc' };
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
          orderBy: [{ AnhChinh: 'desc' }, { ThuTu: 'asc' }],
          take: 5
        },
        tonkho: { select: { SoLuong: true, MaKho: true } }
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
}
```

---

#### 1.3 GET /api/products/:id - Lấy chi tiết sản phẩm
**Purpose:** Hiển thị trang chi tiết sản phẩm

**Request:**
```bash
GET /api/products/SP001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "MaSP": "SP001",
    "TenSP": "Matcha Powder Premium",
    "MaCodeSp": "MPP001",
    "GiaVon": 150000,
    "GiaBan": 450000,
    "Mota": "High-grade ceremonial matcha from Kyoto",
    "TrangThai": "1",
    "MaLoai": "CAT001",
    "NgayTao": "2026-05-01T10:00:00Z",
    "loaisanpham": {
      "MaLoai": "CAT001",
      "TenLoai": "Matcha Premium",
      "Mota": "Premium quality matcha"
    },
    "sanpham_anh": [
      {
        "MaAnh": "IMG001",
        "DuongDanAnh": "https://cdn.shopmatcha.com/sp001-1.jpg",
        "AnhChinh": 1,
        "ThuTu": 0
      },
      {
        "MaAnh": "IMG002",
        "DuongDanAnh": "https://cdn.shopmatcha.com/sp001-2.jpg",
        "AnhChinh": 0,
        "ThuTu": 1
      }
    ],
    "totalStock": 150,
    "storeStock": [
      {
        "MaCH": "CH001",
        "SoLuong": 30
      }
    ]
  }
}
```

**Service Method:**
```typescript
async getProductById(id: string) {
  const product = await prisma.sanpham.findUnique({
    where: { MaSP: id },
    include: {
      loaisanpham: true,
      sanpham_anh: {
        orderBy: [{ AnhChinh: 'desc' }, { ThuTu: 'asc' }]
      },
      tonkho: { select: { SoLuong: true, MaKho: true } },
      tonkhocuahang: { select: { MaCH: true, SoLuong: true } }
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
}
```

---

#### 1.4 GET /api/products/:id/related - Lấy sản phẩm liên quan
**Purpose:** Hiển thị "Sản phẩm tương tự" trên trang chi tiết

**Request:**
```bash
GET /api/products/SP001/related?limit=5
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "MaSP": "SP002",
      "TenSP": "Matcha Latte Mix",
      "GiaBan": 180000,
      "sanpham_anh": [
        {
          "DuongDanAnh": "https://cdn.shopmatcha.com/sp002.jpg",
          "AnhChinh": 1
        }
      ]
    }
  ]
}
```

**Service Method:**
```typescript
async getRelatedProducts(id: string, limit: number = 5) {
  const product = await prisma.sanpham.findUnique({
    where: { MaSP: id },
    select: { MaLoai: true }
  });

  if (!product) throw new Error('Product not found');

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
}
```

---

#### 1.5 GET /api/search - Tìm kiếm sản phẩm
**Purpose:** Tìm kiếm sản phẩm theo tên/mô tả

**Request:**
```bash
GET /api/search?q=matcha&limit=20
```

**Query Parameters:**
- `q` (required): Từ khóa tìm kiếm
- `limit` (optional): Số kết quả (default=20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "query": "matcha",
    "results": [
      {
        "MaSP": "SP001",
        "TenSP": "Matcha Powder Premium",
        "GiaBan": 450000,
        "Mota": "High-grade ceremonial matcha",
        "sanpham_anh": [
          { "DuongDanAnh": "https://cdn.shopmatcha.com/sp001.jpg" }
        ]
      }
    ],
    "count": 5
  }
}
```

**Service Method:**
```typescript
async searchProducts(query: string, limit: number = 20) {
  return prisma.sanpham.findMany({
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
    take: limit,
    include: {
      sanpham_anh: {
        where: { AnhChinh: 1 },
        take: 1
      }
    }
  });
}
```

---

#### 1.6 GET /api/promotions - Lấy khuyến mãi hoạt động
**Purpose:** Hiển thị khuyến mãi trên Homepage

**Request:**
```bash
GET /api/promotions?type=active
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "Makhuyenmai": "KM001",
      "mota": "Giảm 20% cho sản phẩm Matcha",
      "giatri": 20,
      "thoihan": "2026-06-05T23:59:59Z",
      "Masp": "SP001",
      "sanpham": {
        "MaSP": "SP001",
        "TenSP": "Matcha Powder Premium",
        "GiaBan": 450000
      }
    }
  ]
}
```

**Service Method:**
```typescript
async getActivePromotions() {
  const now = new Date();
  
  return prisma.khuyenmai.findMany({
    where: {
      thoihan: { gte: now }
    },
    include: {
      sanpham: { select: { MaSP: true, TenSP: true, GiaBan: true } },
      cuahang: { select: { MaCH: true, TenCH: true } }
    }
  });
}
```

---

## 📁 Project Structure (Backend)

```
backend/
├── src/
│  ├── controllers/
│  │  ├── productController.ts
│  │  ├── categoryController.ts
│  │  └── promotionController.ts
│  ├── services/
│  │  ├── productService.ts
│  │  ├── categoryService.ts
│  │  └── promotionService.ts
│  ├── routes/
│  │  ├── productRoutes.ts
│  │  ├── categoryRoutes.ts
│  │  └── promotionRoutes.ts
│  ├── middleware/
│  │  ├── errorHandler.ts
│  │  └── cors.ts
│  ├── utils/
│  │  ├── logger.ts
│  │  └── errors.ts
│  ├── types/
│  │  └── index.ts
│  └── app.ts
├── prisma/
│  └── schema.prisma
├── .env
├── package.json
└── tsconfig.json
```

---

## 🔧 Implementation Steps

### Step 1: Setup Project
```bash
npm init -y
npm install express typescript dotenv cors helmet morgan
npm install -D @types/express ts-node @types/node
npm install @prisma/client prisma

# Initialize TypeScript
npx tsc --init

# Initialize Prisma (use existing schema)
npx prisma generate
npx prisma db push
```

### Step 2: Create app.ts
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes (sẽ thêm ở bước 3)

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
```

### Step 3: Create Services
- ProductService (getProducts, getProductById, getRelatedProducts)
- CategoryService (getAllCategories)
- SearchService (searchProducts)
- PromotionService (getActivePromotions)

### Step 4: Create Controllers
- ProductController
- CategoryController
- PromotionController

### Step 5: Create Routes
```typescript
import express from 'express';
import { ProductController } from '../controllers/productController';

const router = express.Router();
const controller = new ProductController();

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/featured', controller.getFeatured);
router.get('/:id', controller.getById);
router.get('/:id/related', controller.getRelated);

export default router;
```

---

## 💾 Database Queries Reference

### Query 1: Get All Active Products with Images
```typescript
const products = await prisma.sanpham.findMany({
  where: { TrangThai: "1" },
  include: {
    loaisanpham: true,
    sanpham_anh: {
      orderBy: [{ AnhChinh: 'desc' }, { ThuTu: 'asc' }],
      take: 5
    }
  },
  orderBy: { NgayTao: 'desc' },
  take: 20
});
```

### Query 2: Search Products
```typescript
const results = await prisma.sanpham.findMany({
  where: {
    AND: [
      { TrangThai: "1" },
      {
        OR: [
          { TenSP: { contains: "matcha", mode: 'insensitive' } },
          { Mota: { contains: "matcha", mode: 'insensitive' } }
        ]
      }
    ]
  },
  include: {
    sanpham_anh: { take: 1 }
  }
});
```

### Query 3: Get Product with All Details
```typescript
const product = await prisma.sanpham.findUnique({
  where: { MaSP: "SP001" },
  include: {
    loaisanpham: true,
    sanpham_anh: { orderBy: { ThuTu: 'asc' } },
    tonkho: true,
    tonkhocuahang: true,
    khuyenmai: true
  }
});
```

### Query 4: Get Products by Category with Count
```typescript
const categoryProducts = await prisma.loaisanpham.findUnique({
  where: { MaLoai: "CAT001" },
  include: {
    sanpham: {
      where: { TrangThai: "1" },
      include: { sanpham_anh: { take: 1 } },
      take: 20
    },
    _count: { select: { sanpham: true } }
  }
});
```

### Query 5: Get Active Promotions
```typescript
const promos = await prisma.khuyenmai.findMany({
  where: {
    thoihan: { gte: new Date() }
  },
  include: {
    sanpham: true,
    cuahang: true
  }
});
```

---

## 🛡️ Error Handling

```typescript
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}
```

---

## ✅ API Response Format

### Success
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

---

## 🧪 Testing Examples

### Test: Get Products
```bash
curl http://localhost:5000/api/products?category=CAT001&sort=price-asc&limit=10
```

### Test: Get Product Detail
```bash
curl http://localhost:5000/api/products/SP001
```

### Test: Search
```bash
curl http://localhost:5000/api/search?q=matcha&limit=20
```

### Test: Get Categories
```bash
curl http://localhost:5000/api/categories
```

---

## 📋 Implementation Checklist

- [ ] Project initialized with TypeScript
- [ ] Prisma configured with existing schema
- [ ] database connection tested
- [ ] Product service implemented
- [ ] Category service implemented
- [ ] Search service implemented
- [ ] Promotion service implemented
- [ ] Controllers created
- [ ] Routes configured
- [ ] Error handling middleware added
- [ ] CORS configured
- [ ] Test all 6 endpoints
- [ ] Pagination verified
- [ ] Sorting working
- [ ] Images loading correctly
- [ ] Promotions displayed

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Test endpoints
npm run test:api
```

---

**Status:** Ready for Implementation  
**Last Updated:** May 5, 2026  
**Focus:** Homepage Backend Only
