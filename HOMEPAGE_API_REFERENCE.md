# Homepage API Endpoints - Chi tiết & Ví dụ
## ShopMatcha - API Reference for Homepage

**Document Date:** May 5, 2026  
**Scope:** Homepage Backend APIs Only  
**Base URL:** `http://localhost:5000/api` (development)

---

## 📊 API Endpoints Matrix

| # | Method | Endpoint | Purpose | Auth | Status |
|---|--------|----------|---------|------|--------|
| 1 | GET | `/categories` | Lấy danh mục | ❌ | 200 |
| 2 | GET | `/products` | Lấy danh sách sản phẩm | ❌ | 200 |
| 3 | GET | `/products/:id` | Chi tiết sản phẩm | ❌ | 200 |
| 4 | GET | `/products/:id/related` | Sản phẩm liên quan | ❌ | 200 |
| 5 | GET | `/search` | Tìm kiếm sản phẩm | ❌ | 200 |
| 6 | GET | `/promotions` | Khuyến mãi hiện tại | ❌ | 200 |

---

## 📝 Detailed API Specifications

### ✅ API 1: Get Categories
**Endpoint:** `GET /api/categories`

**Purpose:** Lấy danh sách tất cả danh mục sản phẩm hoạt động

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:** (None)

**Request Example:**
```bash
curl -X GET http://localhost:5000/api/categories
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "MaLoai": "CAT001",
      "TenLoai": "Matcha Premium",
      "Mota": "Matcha cao cấp từ vùng Kyoto, Nhật Bản",
      "TrangThai": 1,
      "_count": {
        "sanpham": 5
      }
    },
    {
      "MaLoai": "CAT002",
      "TenLoai": "Sencha & Hojicha",
      "Mota": "Trà xanh và lúa mạch đen Nhật Bản",
      "TrangThai": 1,
      "_count": {
        "sanpham": 8
      }
    },
    {
      "MaLoai": "CAT003",
      "TenLoai": "Dụng cụ",
      "Mota": "Dụng cụ pha chế matcha truyền thống",
      "TrangThai": 1,
      "_count": {
        "sanpham": 3
      }
    }
  ]
}
```

**Response (500) - Error:**
```json
{
  "success": false,
  "error": "Failed to fetch categories",
  "code": 500
}
```

**Frontend Usage:**
```jsx
// React component
const { data } = await fetch('/api/categories').then(r => r.json());
setCategories(data);

// Display as buttons/filter
data.map(cat => (
  <button key={cat.MaLoai}>
    {cat.TenLoai} ({cat._count.sanpham})
  </button>
))
```

**Database Schema:**
```
loaisanpham
├── MaLoai (PK)
├── TenLoai
├── Mota
└── TrangThai (must be 1)
```

---

### ✅ API 2: Get Products
**Endpoint:** `GET /api/products`

**Purpose:** Lấy danh sách sản phẩm với hỗ trợ filter, sort, và pagination

**Query Parameters:**

| Parameter | Type | Default | Max | Example |
|-----------|------|---------|-----|---------|
| `category` | string | - | - | `CAT001` |
| `sort` | string | `newest` | - | `price-asc`, `price-desc`, `name-asc`, `newest` |
| `page` | number | 1 | - | `2` |
| `limit` | number | 20 | 100 | `50` |
| `featured` | boolean | false | - | `true` |

**Request Examples:**

```bash
# Lấy 20 sản phẩm đầu tiên
curl http://localhost:5000/api/products

# Lấy sản phẩm theo danh mục
curl http://localhost:5000/api/products?category=CAT001

# Sắp xếp theo giá tăng dần
curl http://localhost:5000/api/products?sort=price-asc

# Lấy trang thứ 2
curl http://localhost:5000/api/products?page=2&limit=20

# Kết hợp filters
curl "http://localhost:5000/api/products?category=CAT001&sort=price-asc&page=1&limit=10"
```

**Response (200) - Success:**
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
        "Mota": "Matcha ceremonial grade cao cấp từ Kyoto",
        "TrangThai": "1",
        "MaLoai": "CAT001",
        "NgayTao": "2026-05-01T10:00:00.000Z",
        "loaisanpham": {
          "MaLoai": "CAT001",
          "TenLoai": "Matcha Premium",
          "Mota": null,
          "TrangThai": 1
        },
        "sanpham_anh": [
          {
            "MaAnh": "IMG001",
            "MaSP": "SP001",
            "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp001-main.jpg",
            "ThuTu": 0,
            "AnhChinh": 1
          },
          {
            "MaAnh": "IMG002",
            "MaSP": "SP001",
            "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp001-detail.jpg",
            "ThuTu": 1,
            "AnhChinh": 0
          }
        ],
        "tonkho": [
          {
            "MaKho": "KHO001",
            "MaSP": "SP001",
            "SoLuong": 50
          },
          {
            "MaKho": "KHO002",
            "MaSP": "SP001",
            "SoLuong": 30
          }
        ]
      },
      {
        "MaSP": "SP002",
        "TenSP": "Matcha Latte Mix",
        "MaCodeSp": "MLM001",
        "GiaVon": 80000,
        "GiaBan": 180000,
        "Mota": "Hỗn hợp sẵn dùng cho matcha latte",
        "TrangThai": "1",
        "MaLoai": "CAT001",
        "NgayTao": "2026-04-25T08:30:00.000Z",
        "loaisanpham": {
          "MaLoai": "CAT001",
          "TenLoai": "Matcha Premium",
          "Mota": null,
          "TrangThai": 1
        },
        "sanpham_anh": [
          {
            "MaAnh": "IMG003",
            "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp002-main.jpg",
            "ThuTu": 0,
            "AnhChinh": 1
          }
        ],
        "tonkho": [
          {
            "MaKho": "KHO001",
            "SoLuong": 100
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

**Response (400) - Bad Request:**
```json
{
  "success": false,
  "error": "Invalid limit. Maximum is 100",
  "code": 400
}
```

**Frontend Usage:**
```jsx
// React Hook
const [products, setProducts] = useState([]);
const [page, setPage] = useState(1);
const [category, setCategory] = useState('');

useEffect(() => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...(category && { category })
  });
  
  fetch(`/api/products?${query}`)
    .then(r => r.json())
    .then(res => setProducts(res.data.products));
}, [page, category]);
```

---

### ✅ API 3: Get Product Detail
**Endpoint:** `GET /api/products/:id`

**Purpose:** Lấy chi tiết đầy đủ của một sản phẩm

**URL Parameters:**
- `id` (required): MaSP (Product ID), e.g., `SP001`

**Request Examples:**
```bash
curl http://localhost:5000/api/products/SP001
curl http://localhost:5000/api/products/SP002
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "MaSP": "SP001",
    "TenSP": "Matcha Powder Premium",
    "MaCodeSp": "MPP001",
    "GiaVon": 150000,
    "GiaBan": 450000,
    "Mota": "Matcha ceremonial grade từ vùng Kyoto, Nhật Bản. Chất lượng tuyệt vời cho pha chế truyền thống.",
    "TrangThai": "1",
    "MaLoai": "CAT001",
    "NgayTao": "2026-05-01T10:00:00.000Z",
    "loaisanpham": {
      "MaLoai": "CAT001",
      "TenLoai": "Matcha Premium",
      "Mota": "Matcha cao cấp từ Kyoto",
      "TrangThai": 1
    },
    "sanpham_anh": [
      {
        "MaAnh": "IMG001",
        "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp001-main.jpg",
        "ThuTu": 0,
        "AnhChinh": 1
      },
      {
        "MaAnh": "IMG002",
        "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp001-detail1.jpg",
        "ThuTu": 1,
        "AnhChinh": 0
      },
      {
        "MaAnh": "IMG003",
        "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp001-detail2.jpg",
        "ThuTu": 2,
        "AnhChinh": 0
      }
    ],
    "tonkho": [
      { "MaKho": "KHO001", "SoLuong": 50 },
      { "MaKho": "KHO002", "SoLuong": 30 },
      { "MaKho": "KHO003", "SoLuong": 20 }
    ],
    "tonkhocuahang": [
      { "MaCH": "CH001", "SoLuong": 15 },
      { "MaCH": "CH002", "SoLuong": 10 }
    ],
    "totalStock": 100
  }
}
```

**Response (404) - Not Found:**
```json
{
  "success": false,
  "error": "Product not found",
  "code": 404
}
```

**Frontend Usage:**
```jsx
// Get product detail on page load
useEffect(() => {
  fetch(`/api/products/${productId}`)
    .then(r => r.json())
    .then(res => {
      setProduct(res.data);
      // Display images
      setImages(res.data.sanpham_anh);
      // Show stock
      setStock(res.data.totalStock);
    });
}, [productId]);
```

---

### ✅ API 4: Get Related Products
**Endpoint:** `GET /api/products/:id/related`

**Purpose:** Lấy các sản phẩm tương tự (cùng danh mục)

**URL Parameters:**
- `id` (required): MaSP (Product ID)

**Query Parameters:**
- `limit` (optional): Số sản phẩm tối đa (default=5, max=20)

**Request Examples:**
```bash
curl http://localhost:5000/api/products/SP001/related
curl http://localhost:5000/api/products/SP001/related?limit=8
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "MaSP": "SP002",
      "TenSP": "Matcha Latte Mix",
      "MaCodeSp": "MLM001",
      "GiaVon": 80000,
      "GiaBan": 180000,
      "Mota": "Hỗn hợp sẵn dùng",
      "TrangThai": "1",
      "MaLoai": "CAT001",
      "NgayTao": "2026-04-25T08:30:00.000Z",
      "sanpham_anh": [
        {
          "MaAnh": "IMG003",
          "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp002-main.jpg",
          "AnhChinh": 1
        }
      ]
    },
    {
      "MaSP": "SP003",
      "TenSP": "Bamboo Whisk Set",
      "MaCodeSp": "BWS001",
      "GiaVon": 100000,
      "GiaBan": 250000,
      "Mota": "Bộ dụng cụ truyền thống",
      "TrangThai": "1",
      "MaLoai": "CAT001",
      "NgayTao": "2026-04-20T14:15:00.000Z",
      "sanpham_anh": [
        {
          "MaAnh": "IMG004",
          "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp003-main.jpg",
          "AnhChinh": 1
        }
      ]
    }
  ]
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Product not found",
  "code": 404
}
```

**Frontend Usage:**
```jsx
// Display "You might also like" section
<section className="related-products">
  <h3>Sản phẩm tương tự</h3>
  <div className="product-grid">
    {relatedProducts.map(product => (
      <ProductCard key={product.MaSP} product={product} />
    ))}
  </div>
</section>
```

---

### ✅ API 5: Search Products
**Endpoint:** `GET /api/search`

**Purpose:** Tìm kiếm sản phẩm theo từ khóa

**Query Parameters:**

| Parameter | Type | Required | Max |
|-----------|------|----------|-----|
| `q` | string | ✅ | 255 |
| `limit` | number | ❌ | 100 |

**Request Examples:**
```bash
# Tìm "matcha"
curl http://localhost:5000/api/search?q=matcha

# Tìm với giới hạn
curl http://localhost:5000/api/search?q=matcha&limit=10

# Tìm "latte"
curl "http://localhost:5000/api/search?q=latte"
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": {
    "query": "matcha",
    "results": [
      {
        "MaSP": "SP001",
        "TenSP": "Matcha Powder Premium",
        "MaCodeSp": "MPP001",
        "GiaVon": 150000,
        "GiaBan": 450000,
        "Mota": "Matcha ceremonial grade cao cấp từ Kyoto",
        "TrangThai": "1",
        "MaLoai": "CAT001",
        "sanpham_anh": [
          {
            "MaAnh": "IMG001",
            "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp001-main.jpg",
            "AnhChinh": 1
          }
        ]
      },
      {
        "MaSP": "SP002",
        "TenSP": "Matcha Latte Mix",
        "MaCodeSp": "MLM001",
        "GiaVon": 80000,
        "GiaBan": 180000,
        "Mota": "Hỗn hợp sẵn dùng cho matcha latte",
        "TrangThai": "1",
        "MaLoai": "CAT001",
        "sanpham_anh": [
          {
            "MaAnh": "IMG003",
            "DuongDanAnh": "https://cdn.shopmatcha.com/products/sp002-main.jpg",
            "AnhChinh": 1
          }
        ]
      }
    ],
    "count": 2
  }
}
```

**Response (400) - Missing Query:**
```json
{
  "success": false,
  "error": "Search query is required",
  "code": 400
}
```

**Frontend Usage:**
```jsx
// Search input handler
const handleSearch = (query) => {
  fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
    .then(r => r.json())
    .then(res => setSearchResults(res.data.results));
};
```

---

### ✅ API 6: Get Promotions
**Endpoint:** `GET /api/promotions`

**Purpose:** Lấy danh sách khuyến mãi hiện hoạt động

**Query Parameters:** (None)

**Request Example:**
```bash
curl http://localhost:5000/api/promotions
```

**Response (200) - Success:**
```json
{
  "success": true,
  "data": [
    {
      "Makhuyenmai": "KM001",
      "MaCH": null,
      "Masp": "SP001",
      "mota": "Giảm 20% cho Matcha Premium",
      "giatri": 20,
      "thoihan": "2026-06-05T23:59:59.000Z",
      "sanpham": {
        "MaSP": "SP001",
        "TenSP": "Matcha Powder Premium",
        "GiaBan": 450000
      },
      "cuahang": null
    },
    {
      "Makhuyenmai": "KM002",
      "MaCH": "CH001",
      "Masp": null,
      "mota": "Toàn cửa hàng giảm 10%",
      "giatri": 10,
      "thoihan": "2026-05-20T23:59:59.000Z",
      "sanpham": null,
      "cuahang": {
        "MaCH": "CH001",
        "TenCH": "ShopMatcha - Quận 1"
      }
    }
  ]
}
```

**Response (200) - No Active Promotions:**
```json
{
  "success": true,
  "data": []
}
```

**Frontend Usage:**
```jsx
// Display promotions banner
{promotions.map(promo => (
  <div key={promo.Makhuyenmai} className="promo-banner">
    <p>{promo.mota}</p>
    <span className="discount">-{promo.giatri}%</span>
  </div>
))}
```

---

## 🔍 Error Responses

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Product found and returned |
| 400 | Bad Request | Invalid query parameter |
| 404 | Not Found | Product does not exist |
| 500 | Server Error | Database error |

### Error Response Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": 400
}
```

---

## 📊 Response Time Expectations

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| GET /categories | < 100ms | Cached |
| GET /products | < 200ms | With pagination |
| GET /products/:id | < 100ms | Single query |
| GET /products/:id/related | < 150ms | Category-based |
| GET /search | < 300ms | Full text search |
| GET /promotions | < 100ms | Limited results |

---

## 🔗 Integration with Frontend

### Product Card Component
```jsx
interface Product {
  MaSP: string;
  TenSP: string;
  GiaBan: number;
  GiaVon?: number;
  sanpham_anh: Array<{
    DuongDanAnh: string;
    AnhChinh: number;
  }>;
  loaisanpham: {
    TenLoai: string;
  };
}

function ProductCard({ product }: { product: Product }) {
  const mainImage = product.sanpham_anh.find(img => img.AnhChinh === 1);
  
  return (
    <div className="product-card">
      <img src={mainImage?.DuongDanAnh} alt={product.TenSP} />
      <h3>{product.TenSP}</h3>
      <p className="category">{product.loaisanpham?.TenLoai}</p>
      <p className="price">{formatPrice(product.GiaBan)} VND</p>
    </div>
  );
}
```

---

## 📋 Testing Checklist

- [ ] All 6 endpoints respond correctly
- [ ] Pagination works (page, limit)
- [ ] Filtering by category works
- [ ] Sorting works (all options)
- [ ] Search finds products by name, code, description
- [ ] Product images load correctly
- [ ] Related products display
- [ ] Promotions show active ones only
- [ ] Error handling for invalid IDs
- [ ] Response times acceptable

---

**API Version:** 1.0  
**Last Updated:** May 5, 2026  
**Status:** Ready for Frontend Integration
