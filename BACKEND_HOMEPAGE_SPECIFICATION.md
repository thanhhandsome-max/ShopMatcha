# 📋 BACKEND HOMEPAGE SPECIFICATION - SHOPMATCHA

**Ngày tạo**: 2026-05-01  
**Phiên bản**: 1.0  
**Trạng thái**: PENDING REVIEW  
**Ưu tiên**: HIGH (Phase 1 - MVP)

---

## 📌 I. OVERVIEW

### Mục Đích
Xây dựng backend APIs cho trang chủ (homepage) của ShopMatcha, cung cấp:
- Danh sách sản phẩm với filter, search, sort, pagination
- Danh sách danh mục sản phẩm
- Chi tiết tồn kho theo sản phẩm
- Dữ liệu cho hero/banner section (optional - featured products)

### Scope
**Trong scope:**
- ✅ GET products (list + filtering)
- ✅ GET categories
- ✅ GET product detail (single)
- ✅ Stock information per product
- ✅ Pagination & sorting
- ✅ Search functionality
- ✅ Error handling & validation

**Ngoài scope (Phase 2):**
- ❌ Authentication/Authorization (chỉ public endpoints)
- ❌ Cart operations
- ❌ Order creation
- ❌ Admin functions
- ❌ Payment integration

### Technology Stack
```
- Framework: Next.js 15 (App Router + API Routes)
- Language: TypeScript
- ORM: Prisma
- Database: MySQL 8.4
- Validation: Zod (recommended)
- Caching: Redis (optional, v2)
```

---

## 🏗️ II. DATABASE SCHEMA UPDATES

### Current Issue
Schema hiện tại quá đơn giản - chỉ có `Product` model mà không có:
- `Category` (loaisanpham)
- `Stock` (tonkho - warehouse stock)
- `Shop` (cuahang - shop stock)

### Proposed Schema Changes

#### **New/Updated Models cần thiết cho Homepage**

```prisma
// 1. Danh mục sản phẩm
model Category {
  id        String      @id @default(cuid())
  name      String      @unique                // ví dụ: "Trà xanh", "Trà đen"
  slug      String      @unique                // URL slug
  description String?
  image     String?                            // category image
  isActive  Boolean     @default(true)
  order     Int         @default(0)            // sắp xếp thứ tự
  products  Product[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

// 2. Sản phẩm (UPDATE)
model Product {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique              // URL slug
  description String?     @db.LongText
  price       Int                             // giá bán (đơn vị: VND)
  costPrice   Int?                            // giá vốn (optional)
  imageUrl    String?
  images      String?     @db.Json            // JSON array của URLs
  categoryId  String?
  category    Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // Stock
  totalStock  Int         @default(0)         // tổng tồn kho
  warehouse   WarehouseStock[]                // tồn kho kho trung tâm
  shops       ShopStock[]                     // tồn kho các cửa hàng
  
  // Status
  isActive    Boolean     @default(true)
  status      ProductStatus @default(AVAILABLE)  // AVAILABLE, OUT_OF_STOCK, DISCONTINUED
  
  // Relations
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([categoryId])
  @@index([slug])
  @@index([isActive])
}

enum ProductStatus {
  AVAILABLE
  OUT_OF_STOCK
  DISCONTINUED
  COMING_SOON
}

// 3. Tồn kho kho trung tâm
model WarehouseStock {
  id        String    @id @default(cuid())
  productId String
  warehouseId String
  quantity  Int       @default(0)
  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  warehouse Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  updatedAt DateTime  @updatedAt

  @@unique([productId, warehouseId])
  @@index([productId])
}

// 4. Tồn kho cửa hàng
model ShopStock {
  id        String    @id @default(cuid())
  productId String
  shopId    String
  quantity  Int       @default(0)
  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  shop      Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)
  updatedAt DateTime  @updatedAt

  @@unique([productId, shopId])
  @@index([productId])
}

// 5. Kho trung tâm
model Warehouse {
  id        String      @id @default(cuid())
  name      String
  address   String?
  stocks    WarehouseStock[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

// 6. Cửa hàng
model Shop {
  id        String      @id @default(cuid())
  name      String
  address   String?
  phone     String?
  stocks    ShopStock[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

// Giữ nguyên nhưng cập nhật relationships
model User {
  // ... existing fields
  role UserRole @default(CUSTOMER)
}

enum UserRole {
  ADMIN
  MANAGER
  STAFF_SHOP
  STAFF_WAREHOUSE
  CUSTOMER
}
```

### Migration Steps
```bash
1. npm run prisma:generate
2. npm run prisma:migrate -- --name "add_homepage_schema"
3. Seed data (categories, products, stock) - scripts/seed.ts
```

---

## 🔌 III. API ENDPOINTS

### Base URL
```
/api/shop
```

### 1. GET Products List
```
GET /api/shop/products
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 12, max: 50)
  - categoryId?: string (filter by category)
  - sortBy?: "price_asc" | "price_desc" | "newest" | "name" (default: "newest")
  - search?: string (search by name/description)
  - minPrice?: number (filter by min price)
  - maxPrice?: number (filter by max price)
  - inStock?: boolean (only in stock products, default: true)

Response (200):
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "Trà Matcha Nhật Bản",
        "slug": "tra-matcha-nhat-ban",
        "price": 250000,
        "imageUrl": "...",
        "category": {
          "id": "cat_1",
          "name": "Trà xanh"
        },
        "stock": 45,
        "status": "AVAILABLE",
        "isActive": true
      },
      ...
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 145,
      "totalPages": 13,
      "hasMore": true
    }
  }
}

Error (400):
{
  "success": false,
  "error": "Invalid parameters",
  "details": {...}
}
```

### 2. GET Categories List
```
GET /api/shop/categories
Query Parameters:
  - includeCount?: boolean (include product count, default: true)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "cat_1",
      "name": "Trà xanh",
      "slug": "tra-xanh",
      "image": "...",
      "productCount": 25,
      "order": 1
    },
    {
      "id": "cat_2",
      "name": "Trà đen",
      "slug": "tra-den",
      "image": "...",
      "productCount": 18,
      "order": 2
    }
  ]
}
```

### 3. GET Product Detail
```
GET /api/shop/products/:id
URL Parameters:
  - id: string (product ID)

Response (200):
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Trà Matcha Nhật Bản Premium",
    "slug": "tra-matcha-nhat-ban-premium",
    "description": "Mô tả chi tiết sản phẩm...",
    "price": 250000,
    "costPrice": 150000,
    "images": ["url1", "url2", "url3"],
    "category": {
      "id": "cat_1",
      "name": "Trà xanh"
    },
    "stock": {
      "total": 45,
      "warehouse": 30,
      "shops": [
        {
          "shopId": "shop_1",
          "shopName": "Chi nhánh Tân Bình",
          "quantity": 15
        }
      ]
    },
    "status": "AVAILABLE",
    "isActive": true,
    "createdAt": "2026-05-01T...",
    "relatedProducts": [
      // 4 related products cùng category
    ]
  }
}

Error (404):
{
  "success": false,
  "error": "Product not found"
}
```

### 4. GET Search Products
```
GET /api/shop/products/search
Query Parameters:
  - q: string (search term, min 2 chars)
  - limit: number (default: 10)

Response (200):
{
  "success": true,
  "data": {
    "query": "matcha",
    "results": [
      {
        "id": "prod_123",
        "name": "Trà Matcha Nhật Bản",
        "slug": "tra-matcha-nhat-ban",
        "price": 250000,
        "imageUrl": "..."
      },
      ...
    ]
  }
}

Error (400):
{
  "success": false,
  "error": "Search query must be at least 2 characters"
}
```

### 5. GET Homepage Data (Bundle)
```
GET /api/shop/homepage
Purpose: Một call duy nhất để lấy tất cả dữ liệu homepage

Response (200):
{
  "success": true,
  "data": {
    "categories": [...],
    "featuredProducts": [...],  // top 8 products
    "newProducts": [...],       // 8 newest products
    "saleProducts": [...],      // optional - products with discount
    "stats": {
      "totalProducts": 145,
      "totalCategories": 8
    }
  }
}
```

---

## 🛠️ IV. SERVICE LAYER

### Files to Create/Update

#### **A. src/services/product.service.ts** (UPDATE)
```typescript
// Existing functions
export async function listProducts() { ... }
export async function getProductById(id: string) { ... }

// New functions
export async function getProductsWithFilters(filters: {
  page?: number;
  limit?: number;
  categoryId?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) { ... }

export async function getProductDetail(id: string) { ... }

export async function searchProducts(query: string, limit?: number) { ... }

export async function getRelatedProducts(categoryId: string, currentProductId: string, limit?: number) { ... }

export async function getProductsByCategory(categoryId: string, limit?: number) { ... }
```

#### **B. src/services/category.service.ts** (CREATE)
```typescript
export async function listCategories(includeCount?: boolean) { ... }

export async function getCategoryBySlug(slug: string) { ... }

export async function getCategoryById(id: string) { ... }
```

#### **C. src/services/stock.service.ts** (CREATE)
```typescript
export async function getProductStock(productId: string) { ... }

export async function getWarehouseStock(productId: string) { ... }

export async function getShopStock(productId: string) { ... }

export async function getTotalStock(productId: string) { ... }

export async function checkAvailability(productId: string, quantity: number) { ... }
```

#### **D. src/services/homepage.service.ts** (CREATE)
```typescript
export async function getHomepageData() { ... }
```

---

## 📁 V. API ROUTE STRUCTURE

```
src/app/api/shop/
├── route.ts                      // GET /api/shop (healthcheck)
├── products/
│   ├── route.ts                  // GET /api/shop/products (list + filters)
│   ├── search/
│   │   └── route.ts              // GET /api/shop/products/search
│   └── [id]/
│       └── route.ts              // GET /api/shop/products/:id (detail)
├── categories/
│   ├── route.ts                  // GET /api/shop/categories
│   └── [slug]/
│       └── route.ts              // GET /api/shop/categories/:slug
├── homepage/
│   └── route.ts                  // GET /api/shop/homepage (bundle)
└── stock/
    └── [productId]/
        └── route.ts              // GET /api/shop/stock/:productId
```

---

## ✅ VI. VALIDATION & ERROR HANDLING

### Input Validation (Zod)
```typescript
// Homepage filters schema
const ProductFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  categoryId: z.string().cuid().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest", "name"]).optional(),
  search: z.string().max(100).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  inStock: z.coerce.boolean().default(true),
});

// Search schema
const SearchSchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
```

### Error Responses
```typescript
// Standard error response format
interface ApiError {
  success: false;
  error: string;
  details?: Record<string, any>;
}

// Errors to handle:
1. 400 - Invalid parameters/validation failed
2. 404 - Product/Category not found
3. 500 - Server error
4. 503 - Database connection error
```

---

## 🚀 VII. PERFORMANCE OPTIMIZATION

### Database Indexes
```sql
-- Indexes to create for performance
CREATE INDEX idx_product_category ON Product(categoryId);
CREATE INDEX idx_product_active ON Product(isActive);
CREATE INDEX idx_product_status ON Product(status);
CREATE INDEX idx_product_slug ON Product(slug);
CREATE INDEX idx_warehouse_product ON WarehouseStock(productId);
CREATE INDEX idx_shop_stock_product ON ShopStock(productId);
```

### Prisma Query Optimization
```typescript
// Use select() to fetch only needed fields
// Use include() selectively
// Use pagination to limit data
// Cache frequently accessed data (categories, featured products)
```

### Response Optimization
```typescript
// Compress large JSON responses
// Limit nested relations depth
// Implement field limiting (sparse fieldsets) - optional
```

### Caching Strategy (v2)
```typescript
// Cache keys:
- categories:all (TTL: 1 hour)
- products:featured (TTL: 30 minutes)
- product:${id} (TTL: 2 hours)
- category:${slug} (TTL: 1 hour)
```

---

## 🧪 VIII. TESTING CHECKLIST

### Unit Tests
- [ ] Category service functions
- [ ] Product service functions
- [ ] Stock service functions
- [ ] Validation schemas

### Integration Tests
- [ ] GET /api/shop/products
- [ ] GET /api/shop/products/:id
- [ ] GET /api/shop/categories
- [ ] GET /api/shop/homepage
- [ ] Pagination logic
- [ ] Filtering logic
- [ ] Search functionality

### Edge Cases
- [ ] Empty database
- [ ] Invalid IDs
- [ ] Out of stock products
- [ ] Inactive categories
- [ ] Large pagination requests
- [ ] Special characters in search

---

## 📊 IX. IMPLEMENTATION ORDER (Priority)

### Phase 1 - Core APIs (REQUIRED)
```
1. Update Prisma schema (add Category, Stock models)
2. Create category.service.ts
3. Create stock.service.ts
4. Update product.service.ts
5. Create /api/shop/categories route
6. Create /api/shop/products route (with basic pagination)
7. Create /api/shop/products/:id route
8. Add validation with Zod
9. Add error handling
```

### Phase 2 - Enhanced Features (OPTIONAL)
```
10. Search functionality
11. Filtering (price, stock)
12. Sorting (price, name, newest)
13. Homepage bundle endpoint
14. Related products endpoint
15. Performance optimization (indexes, caching)
```

### Phase 3 - Frontend Integration
```
16. Create homepage UI components
17. Integrate with API endpoints
18. Implement cart integration
19. Testing & QA
```

---

## 📝 X. ESTIMATED TIMELINE

| Phase | Task | Duration | Notes |
|-------|------|----------|-------|
| 1A | Schema + Services | 2-3h | Core setup |
| 1B | API Routes + Validation | 2-3h | 5 endpoints |
| 1C | Testing + Fixes | 1-2h | Bug fixes |
| 2A | Advanced Features | 2-3h | Search, filters, sort |
| 2B | Performance | 1h | Indexes, caching |
| 3A | UI Components | 3-4h | Frontend build |
| **Total** | **Homepage MVP** | **~14h** | Full implementation |

---

## ⚠️ XI. RISKS & CONSIDERATIONS

| Risk | Mitigation |
|------|-----------|
| Schema mismatch with spec | Review with team before migration |
| N+1 query problems | Use Prisma `include()` carefully, add indexes |
| Search performance | Add full-text index on name/description |
| Cache invalidation | Implement TTL-based strategy |
| API rate limiting | Implement (v2) to prevent abuse |

---

## 📋 XII. DELIVERABLES

### By End of Implementation
- [x] Updated Prisma schema (database)
- [x] 5+ API endpoints (fully tested)
- [x] 3 service files (product, category, stock)
- [x] Input validation (Zod)
- [x] Error handling
- [x] Database indexes
- [x] API documentation (this file + inline comments)
- [x] Unit tests
- [x] README for API usage

---

## ✋ WAITING FOR YOUR REVIEW

**Bạn vui lòng review:**
1. ✅ Các API endpoints có đủ/hợp lý không?
2. ✅ Database schema có khớp với yêu cầu không?
3. ✅ Có thêm/bớt requirement nào không?
4. ✅ Thứ tự ưu tiên có hợp lý không?
5. ✅ Performance considerations có đủ không?
6. ✅ Error handling strategy có phù hợp không?

**Sau khi được approve, tôi sẽ:**
1. Cập nhật Prisma schema
2. Tạo tất cả service files
3. Tạo tất cả API routes
4. Thêm validation + error handling
5. Test toàn bộ hệ thống
6. Report kết quả

---

**Awaiting your approval to proceed! 🚀**
