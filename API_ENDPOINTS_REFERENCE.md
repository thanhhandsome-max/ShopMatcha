# Backend API Endpoints Quick Reference
## ShopMatcha - API Specification Matrix

### Legend
- ✅ Public (No Auth Required)
- 🔐 Authenticated Only  
- 👨‍💼 Admin/Manager Only
- 👤 Customer Only

---

## PHASE 1: Authentication & Core (4 Endpoints)

| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 1.1 | POST | `/api/auth/register` | ✅ | - | `{ email, password, HoTen, SDT }` | `{ token, user }` | 201 |
| 1.2 | POST | `/api/auth/login` | ✅ | - | `{ email, password }` | `{ token, user }` | 200 |
| 1.3 | GET | `/api/auth/profile` | 🔐 | - | - | `{ user }` | 200 |
| 1.4 | POST | `/api/auth/logout` | 🔐 | - | - | `{ message }` | 200 |

---

## PHASE 2: Products & Catalog (12 Endpoints)

### Product Management
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 2.1 | GET | `/api/products` | ✅ | - | `?category=,sort=,page=,limit=` | `{ products[], total, page, limit }` | 200 |
| 2.2 | GET | `/api/products/:id` | ✅ | - | - | `{ product }` | 200 |
| 2.3 | POST | `/api/products` | 🔐 | 👨‍💼 | `{ TenSP, MoTa, GiaVon, GiaBan, MaLoai, Hinh }` | `{ product }` | 201 |
| 2.4 | PUT | `/api/products/:id` | 🔐 | 👨‍💼 | `{ TenSP?, MoTa?, GiaBan?, TrangThai? }` | `{ product }` | 200 |
| 2.5 | DELETE | `/api/products/:id` | 🔐 | 👨‍💼 | - | `{ message }` | 200 |

### Category Management  
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 2.6 | GET | `/api/categories` | ✅ | - | - | `{ categories[] }` | 200 |
| 2.7 | GET | `/api/categories/:id` | ✅ | - | - | `{ category }` | 200 |
| 2.8 | POST | `/api/categories` | 🔐 | 👨‍💼 | `{ TenLoai, Mota }` | `{ category }` | 201 |
| 2.9 | PUT | `/api/categories/:id` | 🔐 | 👨‍💼 | `{ TenLoai?, Mota?, TrangThai? }` | `{ category }` | 200 |
| 2.10 | DELETE | `/api/categories/:id` | 🔐 | 👨‍💼 | - | `{ message }` | 200 |

### Search & Filtering
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 2.11 | GET | `/api/search` | ✅ | - | `?q=,category=,minPrice=,maxPrice=` | `{ products[] }` | 200 |
| 2.12 | GET | `/api/products/:id/related` | ✅ | - | - | `{ relatedProducts[] }` | 200 |

---

## PHASE 2.5: Inventory Management (4 Endpoints)

| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 3.1 | GET | `/api/stock/warehouse/:id` | 🔐 | 👨‍💼 | - | `{ stocks[] }` | 200 |
| 3.2 | GET | `/api/stock/store/:id` | 🔐 | 👨‍💼 | - | `{ stocks[] }` | 200 |
| 3.3 | POST | `/api/stock/check` | 🔐 | - | `{ MaSP, SoLuong }` | `{ available: boolean }` | 200 |
| 3.4 | PUT | `/api/stock/warehouse/:id` | 🔐 | 👨‍💼 | `{ MaSP, SoLuong }` | `{ stock }` | 200 |

---

## PHASE 3: Orders & Payments (8 Endpoints)

### Order Management
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 4.1 | POST | `/api/orders` | 🔐 | 👤 | `{ items[], addressId, paymentMethod, shippingMethod, note? }` | `{ order }` | 201 |
| 4.2 | GET | `/api/orders` | 🔐 | 👤 | `?page=,limit=` | `{ orders[], total }` | 200 |
| 4.3 | GET | `/api/orders/:id` | 🔐 | 👤 | - | `{ order }` | 200 |
| 4.4 | PUT | `/api/orders/:id/status` | 🔐 | 👨‍💼 | `{ TrangThai }` | `{ order }` | 200 |
| 4.5 | DELETE | `/api/orders/:id` | 🔐 | 👤 | - | `{ message }` | 200 |

### Payment Processing
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 4.6 | POST | `/api/payments/create` | 🔐 | 👤 | `{ MaDH }` | `{ paymentUrl }` | 200 |
| 4.7 | GET | `/api/payments/vnpay-return` | ✅ | - | `?vnp_*=` (VNPay params) | `{ success, payment }` | 200 |
| 4.8 | GET | `/api/payments/:id` | 🔐 | - | - | `{ payment }` | 200 |

---

## PHASE 4: Advanced Features (20+ Endpoints)

### Customer Management
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 5.1 | GET | `/api/customers/:id` | 🔐 | - | - | `{ customer }` | 200 |
| 5.2 | GET | `/api/customers/:id/addresses` | 🔐 | - | - | `{ addresses[] }` | 200 |
| 5.3 | POST | `/api/addresses` | 🔐 | - | `{ DiaChiChiTiet, QuanHuyen, ThanhPho, QuocGia, MaPostal }` | `{ address }` | 201 |
| 5.4 | PUT | `/api/addresses/:id` | 🔐 | - | `{ DiaChiChiTiet?, QuanHuyen?, ThanhPho? }` | `{ address }` | 200 |
| 5.5 | DELETE | `/api/addresses/:id` | 🔐 | - | - | `{ message }` | 200 |

### Promotions & Discounts
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 5.6 | GET | `/api/promotions` | ✅ | - | - | `{ promotions[] }` | 200 |
| 5.7 | GET | `/api/promotions/:id/details` | ✅ | - | - | `{ promotion }` | 200 |
| 5.8 | POST | `/api/promotions/apply` | 🔐 | 👤 | `{ promotionId }` | `{ applied, discount }` | 200 |

### Warehouse & Store Management
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 5.9 | GET | `/api/stores` | ✅ | - | - | `{ stores[] }` | 200 |
| 5.10 | GET | `/api/stores/:id` | ✅ | - | - | `{ store, products[], stock[] }` | 200 |
| 5.11 | GET | `/api/warehouses` | 🔐 | 👨‍💼 | - | `{ warehouses[] }` | 200 |
| 5.12 | POST | `/api/warehouses/transfer` | 🔐 | 👨‍💼 | `{ fromKho, toKho, items[] }` | `{ transfer }` | 201 |
| 5.13 | GET | `/api/warehouses/:id/stock` | 🔐 | 👨‍💼 | - | `{ stocks[] }` | 200 |
| 5.14 | POST | `/api/warehouses/:id/import` | 🔐 | 👨‍💼 | `{ supplier, items[] }` | `{ receipt }` | 201 |

### Invoices & Receipts
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 5.15 | GET | `/api/invoices/:id` | 🔐 | - | - | `{ invoice }` | 200 |
| 5.16 | GET | `/api/invoices/:id/pdf` | 🔐 | - | - | PDF File | 200 |
| 5.17 | GET | `/api/receipts/:id` | 🔐 | 👨‍💼 | - | `{ receipt }` | 200 |

### Admin Dashboard
| # | Method | Endpoint | Auth | Role | Input | Output | Status |
|---|--------|----------|------|------|-------|--------|--------|
| 5.18 | GET | `/api/admin/dashboard` | 🔐 | 👨‍💼 | `?period=` | `{ stats, charts }` | 200 |
| 5.19 | GET | `/api/admin/orders/report` | 🔐 | 👨‍💼 | `?from=,to=` | `{ orders, revenue }` | 200 |
| 5.20 | GET | `/api/admin/inventory/report` | 🔐 | 👨‍💼 | - | `{ lowStock, overstock }` | 200 |
| 5.21 | GET | `/api/admin/customers/report` | 🔐 | 👨‍💼 | `?period=` | `{ newCustomers, topCustomers }` | 200 |

---

## Request/Response Examples

### 1. Register
**Request:**
```json
POST /api/auth/register
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "HoTen": "Nguyễn Văn A",
  "SDT": "0909123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "MaTaiKhoan": "TK001",
    "Email": "customer@example.com",
    "TrangThai": 1
  }
}
```

### 2. Get Products
**Request:**
```
GET /api/products?category=CAT001&sort=price-asc&page=1&limit=20
```

**Response:**
```json
{
  "products": [
    {
      "MaSP": "SP001",
      "TenSP": "Matcha Powder Premium",
      "GiaBan": 450000,
      "Hinh": "...",
      "TrangThai": 1
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

### 3. Create Order
**Request:**
```json
POST /api/orders
{
  "items": [
    { "MaSP": "SP001", "SoLuong": 2, "price": 450000 },
    { "MaSP": "SP002", "SoLuong": 1, "price": 250000 }
  ],
  "addressId": "ADDR001",
  "paymentMethod": "vnpay",
  "shippingMethod": "standard",
  "note": "Please handle carefully"
}
```

**Response:**
```json
{
  "MaDH": "DH001",
  "order_code": "ORD-20260505-001",
  "subtotal": 1150000,
  "shipping_fee": 0,
  "TongTien": 1150000,
  "TrangThai": 1,
  "NgayTao": "2026-05-05T10:30:00Z"
}
```

### 4. Create Payment
**Request:**
```json
POST /api/payments/create
{
  "MaDH": "DH001"
}
```

**Response:**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/?vnp_Amount=115000000&vnp_TxnRef=ORD-20260505-001&..."
}
```

---

## Database Models Mapping

| API Resource | Database Model | Key Field |
|--------------|----------------|-----------|
| `/products` | `sanpham` | `MaSP` |
| `/categories` | `loaisanpham` | `MaLoai` |
| `/orders` | `donhang` | `MaDH` |
| `/payments` | `payments` | `payment_id` |
| `/customers` | `khachhang` | `MaKH` |
| `/addresses` | `address` | `MaAddress` |
| `/stores` | `cuahang` | `MaCH` |
| `/warehouses` | `kho` | `MaKho` |
| `/promotions` | `khuyenmai` | `MaKM` |

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal error |

---

## Common Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `page` | int | `?page=2` | Pagination page number |
| `limit` | int | `?limit=50` | Items per page (max 100) |
| `sort` | string | `?sort=price-asc` | Sort field and direction |
| `category` | string | `?category=CAT001` | Filter by category |
| `search` | string | `?search=matcha` | Text search |
| `status` | int | `?status=1` | Filter by status |
| `from` | date | `?from=2026-01-01` | Start date filter |
| `to` | date | `?to=2026-05-05` | End date filter |

---

## Authentication Header

All 🔐 and 👨‍💼 endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     https://api.shopmatcha.com/api/orders
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": 400,
  "details": {
    "field": "error description"
  }
}
```

---

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 10 attempts per 5 minutes (for login attempts)
- **Payment endpoints:** 20 requests per hour

---

## Webhook Events (Optional - Phase 4.5)

These endpoints can be implemented for real-time updates:

| Event | Payload |
|-------|---------|
| `order.created` | `{ MaDH, MaKH, TongTien, NgayTao }` |
| `payment.completed` | `{ payment_id, MaDH, amount, paid_at }` |
| `order.shipped` | `{ MaDH, tracking_number, carrier }` |
| `inventory.low` | `{ MaSP, currentStock, minThreshold }` |

---

**Last Updated:** May 5, 2026  
**API Version:** 1.0.0  
**Status:** Ready for Implementation
