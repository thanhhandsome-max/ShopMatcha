# API DOCUMENTATION - SHOPMATCHA BACKEND

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer Token (JWT) cho hầu hết endpoints  
**Ngày cập nhật:** May 6, 2026  

---

## 📋 **MỤC LỤC CHUNG**

### **Response Format**
Tất cả API đều trả về JSON với format:
```json
{
  "success": boolean,
  "message": "Thông báo bằng tiếng Việt",
  "data": { ... } // Tùy chọn
}
```

### **Authentication Header**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### **HTTP Status Codes**
| Code | Ý nghĩa |
|------|---------|
| 200 | OK - Thành công |
| 201 | Created - Tạo mới thành công |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Thiếu token |
| 403 | Forbidden - Token không hợp lệ/hết hạn |
| 404 | Not Found - Không tìm thấy |
| 429 | Too Many Requests - Quá giới hạn rate limit |

---

## 🔑 **AUTHENTICATION ENDPOINTS**

### **1. POST /api/auth/register**
**Mục đích:** Đăng ký tài khoản khách hàng mới  

**Authentication:** Không yêu cầu  

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "fullName": "string",
  "phone": "string"
}
```

**Validation:**
- Email: Phải đúng định dạng email
- Password: Tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
- confirmPassword: Phải khớp với password
- fullName: Bắt buộc
- phone: Tùy chọn

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "MaTaiKhoan": "TK012",
      "TenDangNhap": "test@example.com",
      "role": "Khách hàng",
      "MaKH": "KH012",
      "TenKH": "Nguyễn Văn Test"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email đã được đăng ký"
}
```

**Ví dụ curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567"
  }'
```

---

### **2. POST /api/auth/login**
**Mục đích:** Đăng nhập tài khoản  

**Authentication:** Không yêu cầu  

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "MaTaiKhoan": "TK012",
      "TenDangNhap": "user@example.com",
      "role": "Khách hàng",
      "MaKH": "KH012",
      "TenKH": "Nguyễn Văn A"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Mật khẩu không đúng"
}
```

**Ví dụ curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test123!"
  }'
```

---

### **3. POST /api/auth/logout**
**Mục đích:** Đăng xuất (xóa cookies)  

**Authentication:** Không yêu cầu (nhưng nên gửi refresh token)  

**Request Body:**
```json
{
  "refreshToken": "string" // Tùy chọn
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**Ví dụ curl:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGci..."}'
```

---

### **4. GET /api/auth/me**
**Mục đích:** Lấy thông tin user hiện tại  

**Authentication:** ✅ Yêu cầu Bearer Token  

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "MaTaiKhoan": "TK012",
      "TenDangNhap": "user@example.com",
      "role": "Khách hàng",
      "TrangThai": 1,
      "customer": {
        "MaKH": "KH012",
        "TenKH": "Nguyễn Văn A",
        "Email": "user@example.com",
        "SDT": "0901234567"
      }
    }
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Không tìm thấy token xác thực"
}
```

**Ví dụ curl:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGci..."
```

---

### **5. POST /api/auth/refresh**
**Mục đích:** Làm mới Access Token bằng Refresh Token  

**Authentication:** Không yêu cầu (dùng refresh token trong body)  

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "Refresh token không hợp lệ hoặc đã hết hạn"
}
```

**Ví dụ curl:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGci..."}'
```

---

## 🛒 **PRODUCT ENDPOINTS**

### **6. GET /api/products**
**Mục đích:** Lấy danh sách sản phẩm (có phân trang & lọc)  

**Authentication:** Không yêu cầu  

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|---------|
| category | string | - | Lọc theo mã loại (L01, L02) |
| sort | string | newest | Sắp xếp: price-asc, price-desc, name-asc, newest |
| page | number | 1 | Trang hiện tại |
| limit | number | 20 | Số sản phẩm/trang (max 100) |

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "MaSP": "SP01",
        "TenSP": "Bột Matcha Uji Premium 100g",
        "GiaBan": "450000",
        "TrangThai": "1",
        "MaLoai": "L01",
        "loaisanpham": {
          "TenLoai": "Bột Matcha Nguyên Chất"
        },
        "sanpham_anh": [
          {
            "MaAnh": "IMG001",
            "DuongDanAnh": "/images/products/sp01_1.jpg",
            "AnhChinh": 1
          }
        ],
        "tonkho": [{"MaKho": "KHO01", "SoLuong": 50}],
        "tonkhocuahang": [
          {"MaCH": "CH01", "SoLuong": 13},
          {"MaCH": "CH03", "SoLuong": 10}
        ],
        "totalStock": 50
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 7,
      "totalPages": 1
    }
  }
}
```

**Ví dụ curl:**
```bash
# Lấy 4 sản phẩm đầu tiên
curl "http://localhost:5000/api/products?limit=4"

# Lọc theo loại, sắp xếp giá tăng dần
curl "http://localhost:5000/api/products?category=L01&sort=price-asc&page=1&limit=10"
```

---

### **7. GET /api/products/:id**
**Mục đích:** Lấy chi tiết một sản phẩm  

**Authentication:** Không yêu cầu  

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "MaSP": "SP01",
    "TenSP": "Bột Matcha Uji Premium 100g",
    "MaCodeSp": "MTC-UJI-100",
    "GiaVon": "300000",
    "GiaBan": "450000",
    "Mota": "Bột matcha thượng hạng từ vùng Uji...",
    "TrangThai": "1",
    "loaisanpham": {...},
    "sanpham_anh": [...],
    "tonkho": [...],
    "tonkhocuahang": [...],
    "totalStock": 50
  }
}
```

**Ví dụ curl:**
```bash
curl http://localhost:5000/api/products/SP01
```

---

### **8. GET /api/products/:id/related**
**Mục đích:** Lấy sản phẩm liên quan (cùng loại)  

**Authentication:** Không yêu cầu  

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "MaSP": "SP02",
      "TenSP": "Bột Matcha Lễ Hội 50g",
      "GiaBan": "600000",
      "sanpham_anh": [...]
    }
  ]
}
```

**Ví dụ curl:**
```bash
curl http://localhost:5000/api/products/SP01/related
```

---

## 🛒 **ORDER ENDPOINTS (Yêu cầu Authentication)**

### **9. POST /api/orders**
**Mục đích:** Tạo đơn hàng mới từ giỏ hàng  

**Authentication:** ✅ Yêu cầu Bearer Token  

**Request Body:**
```json
{
  "items": [
    {
      "MaSP": "SP01",
      "quantity": 2,
      "price": 450000
    }
  ],
  "MaCH": "CH01",
  "payment_method": "COD | BankTransfer | VNPay",
  "address_id": "string (tùy chọn)",
  "customer_note": "string (tùy chọn)",
  "shipping_fee": 0
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "MaDH": "DH008",
    "order_code": "ORD-20260505-5XD",
    "TongTien": 900000,
    "payment_method": "COD"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Sản phẩm Bột Matcha Uji Premium 100g không đủ số lượng trong kho (còn 13)"
}
```

**Ví dụ curl:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGci..." \
  -d '{
    "items": [
      {"MaSP": "SP01", "quantity": 2, "price": 450000}
    ],
    "MaCH": "CH01",
    "payment_method": "COD",
    "customer_note": "Giao hàng giờ hành chính"
  }'
```

---

### **10. GET /api/orders/:id**
**Mục đích:** Lấy chi tiết đơn hàng  

**Authentication:** ✅ Yêu cầu Bearer Token (chỉ chủ đơn hàng mới xem được)  

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "MaDH": "DH008",
    "MaCH": "CH01",
    "MaKH": "KH012",
    "order_code": "ORD-20260505-5XD",
    "TongTien": 900000,
    "subtotal": 900000,
    "shipping_fee": 0,
    "payment_method": "COD",
    "TrangThai": 1,
    "payment_status": 0,
    "NgayTao": "2026-05-05T10:24:27.000Z",
    "chitietdonhang": [
      {
        "MaSP": "SP01",
        "SoLuong": 2,
        "TongTien": 900000,
        "sanpham": {
          "TenSP": "Bột Matcha Uji Premium 100g",
          "sanpham_anh": [...]
        }
      }
    ],
    "khachhang": {...},
    "taikhoan": {...}
  }
}
```

**Ví dụ curl:**
```bash
curl http://localhost:5000/api/orders/DH008 \
  -H "Authorization: Bearer eyJhbGci..."
```

---

### **11. GET /api/orders**
**Mục đích:** Lấy danh sách đơn hàng của khách hàng (phân trang)  

**Authentication:** ✅ Yêu cầu Bearer Token  

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|---------|
| page | number | 1 | Trang hiện tại |
| limit | number | 10 | Số đơn hàng/trang |

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "MaDH": "DH008",
        "order_code": "ORD-20260505-5XD",
        "TongTien": 900000,
        "payment_method": "COD",
        "TrangThai": 1,
        "NgayTao": "2026-05-05T10:24:27.000Z",
        "chitietdonhang": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Ví dụ curl:**
```bash
curl "http://localhost:5000/api/orders?page=1&limit=5" \
  -H "Authorization: Bearer eyJhbGci..."
```

---

## 💳 **PAYMENT ENDPOINTS**

### **12. POST /api/payments/checkout**
**Mục đích:** Khởi tạo thanh toán (VNPay URL)  

**Authentication:** ✅ Yêu cầu Bearer Token  

**Request Body:**
```json
{
  "orderId": "DH008",
  "amount": 900000,
  "orderInfo": "Thanh toan don hang DH008",
  "ipAddr": "127.0.0.1"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Tạo URL thanh toán thành công",
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "paymentId": "PAY123456789ABCDEF"
  }
}
```

**Ví dụ curl:**
```bash
curl -X POST http://localhost:5000/api/payments/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGci..." \
  -d '{
    "orderId": "DH008",
    "amount": 900000,
    "orderInfo": "Thanh toan don hang DH008"
  }'
```

---

### **13. GET /api/payments/callback**
**Mục đích:** VNPay callback handler (redirect từ VNPay)  

**Authentication:** Không yêu cầu (VNPay gọi)  

**Query Parameters:** VNPay trả về các tham số: `vnp_TxnRef`, `vnp_Amount`, `vnp_ResponseCode`, `vnp_SecureHash`, etc.  

**Behavior:**
- Nếu `vnp_ResponseCode === '00'`: Thanh toán thành công → Redirect to `/order-confirmation?status=success`
- Nếu khác: Thanh toán thất bại → Redirect to `/order-confirmation?status=failed`

**Ví dụ URL callback:**
```
http://localhost:3000/order-confirmation?status=success&orderId=DH008
```

---

### **14. GET /api/payments/:id**
**Mục đích:** Lấy chi tiết thanh toán  

**Authentication:** ✅ Yêu cầu Bearer Token  

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "payment_id": "PAY123456789ABCDEF",
    "MaHD": "DH008",
    "MaKH": "KH012",
    "amount": 900000,
    "payment_method": "VNPay",
    "status": 1,
    "paid_at": "2026-05-05T10:30:00.000Z",
    "donhang": {...},
    "payment_logs": [...]
  }
}
```

---

### **15. GET /api/payments**
**Mục đích:** Lấy lịch sử thanh toán của khách hàng  

**Authentication:** ✅ Yêu cầu Bearer Token  

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|---------|
| page | number | 1 | Trang hiện tại |
| limit | number | 10 | Số thanh toán/trang |

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "payment_id": "PAY123456789ABCDEF",
        "MaHD": "DH008",
        "amount": 900000,
        "payment_method": "VNPay",
        "status": 1,
        "donhang": {...}
      }
    ],
    "pagination": {...}
  }
}
```

---

## 📂 **CATEGORY & SEARCH ENDPOINTS**

### **16. GET /api/categories**
**Mục đích:** Lấy danh sách loại sản phẩm  

**Authentication:** Không yêu cầu  

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "MaLoai": "L01",
      "TenLoai": "Bột Matcha Nguyên Chất",
      "_count": {"sanpham": 5}
    },
    {
      "MaLoai": "L02",
      "TenLoai": "Trà Matcha Túi Lọc",
      "_count": {"sanpham": 2}
    }
  ]
}
```

**Ví dụ curl:**
```bash
curl http://localhost:5000/api/categories
```

---

### **17. GET /api/search**
**Mục đích:** Tìm kiếm sản phẩm  

**Authentication:** Không yêu cầu  

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|---------|
| q | string | - | Từ khóa tìm kiếm |
| limit | number | 20 | Số kết quả tối đa |

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "query": "matcha",
    "results": [
      {
        "MaSP": "SP01",
        "TenSP": "Bột Matcha Uji Premium 100g",
        "GiaBan": "450000",
        "sanpham_anh": [...]
      }
    ],
    "count": 5
  }
}
```

**Ví dụ curl:**
```bash
curl "http://localhost:5000/api/search?q=matcha&limit=10"
```

---

### **18. GET /api/health**
**Mục đích:** Kiểm tra trạng thái backend  

**Authentication:** Không yêu cầu  

**Response Success (200):**
```json
{
  "status": "OK",
  "timestamp": "2026-05-05T17:15:48.147Z"
}
```

**Ví dụ curl:**
```bash
curl http://localhost:5000/api/health
```

---

## 🔒 **SECURITY FEATURES**

### **1. Password Hashing**
- Sử dụng **bcryptjs** với 10 rounds (BCRYPT_ROUNDS)
- Hash được lưu vào trường `MatKhau` trong bảng `taikhoan`
- So sánh bằng `bcrypt.compare()`

### **2. JWT Authentication**
- **Access Token:** 15 phút (JWT_EXPIRE=15m)
- **Refresh Token:** 7 ngày (JWT_REFRESH_EXPIRE=7d)
- **Secrets:** JWT_SECRET & JWT_REFRESH_SECRET (đổi trong production!)

### **3. Rate Limiting**
- **Auth endpoints:** 5 requests/15 phút/IP
- **General API:** 100 requests/15 phút/IP
- Trả về 429 khi vượt quá giới hạn

### **4. VNPay Security**
- Sử dụng **HMAC-SHA512** để ký và xác thực
- Verify callback signature trước khi xử lý
- Log tất cả callback events vào `payment_logs`

### **5. CORS & Helmet**
- Chỉ cho phép origin: `http://localhost:3000` (CORS_ORIGIN)
- HTTP security headers (Helmet)

---

## ⚠️ **LƯU Ý QUAN TRỌNG CHO PRODUCTION**

### **1. Thay đổi Secrets trong `.env`:**
```bash
JWT_SECRET=your-super-secret-jwt-key-CHANGE-IN-PRODUCTION
JWT_REFRESH_SECRET=your-refresh-secret-key-CHANGE-IN-PRODUCTION
VNP_TMN_CODE=your_actual_merchant_code
VNP_HASH_SECRET=your_actual_hash_secret
```

### **2. Database:**
```bash
DATABASE_URL=mysql://user:password@host:3306/database_name
```

### **3. CORS:**
```bash
CORS_ORIGIN=https://your-production-domain.com
```

### **4. HTTPS:**
- Đảm bảo dùng HTTPS trong production
- Cookies: `secure: true` khi NODE_ENV=production

---

## 📊 **ERROR HANDLING**

Tất cả lỗi đều trả về JSON với format:
```json
{
  "success": false,
  "message": "Thông báo lỗi bằng tiếng Việt"
}
```

**Các loại lỗi thường gặp:**
- `400`: Dữ liệu không hợp lệ (validation failed)
- `401`: Thiếu token hoặc token sai
- `403`: Token hết hạn hoặc user bị khóa
- `404`: Không tìm thấy tài nguyên
- `429`: Quá giới hạn request (rate limit)
- `500`: Lỗi server (hiển thị trong terminal log)

---

## 📝 **TESTING CHECKLIST**

- [x] Task 1: Fix Prisma import
- [x] Task 2: Dọn dẹp terminal & port
- [x] Task 3: Chạy thử backend ổn định
- [x] Task 4: Test Auth Flow (Register/Login)
- [x] Task 5: Test E2E Flow (Cart → Checkout → Order)
- [x] Task 6: Review Security Issues
- [x] Task 7: Viết Documentation (file này)

**Tổng tiến độ: 100% hoàn thành!** 🎉

---

**Tài liệu này bao gồm đầy đủ 18 API endpoints với:**
✅ Request/Response schemas  
✅ Authentication requirements  
✅ Ví dụ curl commands  
✅ Status codes & error handling  
✅ Security features  
✅ Production notes  

**Ngày tạo:** May 6, 2026  
**Tác giả:** GitHub Copilot  
**Version:** 1.0
