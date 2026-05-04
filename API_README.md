# ShopMatcha API - Quick Start

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# API available at: http://localhost:3000/api/shop
```

## 📋 Available Endpoints

### GET /api/shop/products
Enhanced product listing with advanced filtering.

**Key Features:**
- ✅ Category filtering (`MaLoai`)
- ✅ Price range filtering (`minPrice`, `maxPrice`)
- ✅ Stock filtering (`inStock`)
- ✅ Full-text search (`search`)
- ✅ Multiple sorting options (`sortBy`)
- ✅ Pagination (`page`, `limit`)

**Examples:**
```bash
# Default products
GET /api/shop/products

# Filter by category
GET /api/shop/products?MaLoai=DM001

# Search products
GET /api/shop/products?search=matcha

# Price range + sorting
GET /api/shop/products?minPrice=100000&maxPrice=500000&sortBy=price_asc

# Combined filters
GET /api/shop/products?MaLoai=DM001&inStock=true&sortBy=newest&page=1&limit=12
```

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "MaSP": "SP001",
        "TenSP": "Trà Matcha Xanh Nhật Bản",
        "GiaBan": 250000,
        "Mota": "Trà matcha xanh chất lượng cao",
        "TrangThai": 1,
        "NgayTao": "2024-01-15T00:00:00.000Z",
        "MaLoai": "DM001",
        "loaisanpham": {
          "MaLoai": "DM001",
          "TenLoai": "Trà Matcha"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 25,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Test API manually
curl "http://localhost:3000/api/shop/products"
```

## 📖 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

---

**Status**: Phase 2 Step 1 ✅ COMPLETE
**Next**: Step 2 - Dedicated search endpoint