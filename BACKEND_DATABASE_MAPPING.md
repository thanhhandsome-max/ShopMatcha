# Backend Implementation Roadmap & Database Schema Mapping
## ShopMatcha - Detailed Development Guide

---

## 📊 Data Flow Architecture

### Order Flow
```
Customer Cart (Frontend)
    ↓
POST /api/orders (Create Order)
    ↓
OrderService.createOrder()
    ├─ Validate cart items & stock
    ├─ Create donhang record
    ├─ Create chitietdonhang records (order items)
    ├─ Decrement tonkho (warehouse stock)
    └─ Return order with MaDH
    ↓
POST /api/payments/create (Request payment URL)
    ├─ Fetch donhang
    ├─ Create VNPay URL with order details
    └─ Return paymentUrl
    ↓
Frontend redirects to VNPay
    ↓
GET /api/payments/vnpay-return (VNPay callback)
    ├─ Verify VNPay signature
    ├─ Create payments record
    ├─ Update donhang.payment_status
    ├─ Create payment_logs
    └─ Update donhang.TrangThai (to processing)
    ↓
Order Confirmation (Frontend)
```

### Product Search Flow
```
Frontend Search Query
    ↓
GET /api/search?q=matcha&category=CAT001
    ↓
SearchService.searchProducts()
    ├─ Build WHERE clause with LIKE queries
    ├─ Apply category filter if provided
    ├─ Apply price range filter if provided
    └─ Return matching sanpham records
    ↓
GET /api/products/:id/related
    ├─ Fetch product's MaLoai
    ├─ Query other products with same MaLoai
    └─ Return related products
    ↓
Display products & recommendations (Frontend)
```

### Inventory Flow
```
Admin receives stock
    ↓
POST /api/warehouses/:id/import
    ├─ Create phieunhap record
    ├─ Create chitietphieunhap for each item
    ├─ Update tonkho (warehouse stock)
    └─ Return receipt
    ↓
Stock available
    ↓
GET /api/stock/warehouse/:id
    ├─ Query tonkho for warehouse
    ├─ Include sanpham & kho relations
    └─ Display inventory
    ↓
Stock low alert
    └─ Trigger reorder notification
```

---

## 🗄️ Database Schema Mapping to API Resources

### User & Authentication
```
taikhoan (Users/Accounts)
├─ MaTaiKhoan (PK)
├─ Email (UNIQUE)
├─ MatKhau (hashed)
├─ TrangThai (1=active, 0=inactive)
├─ NgayTao
└─ NgayCapNhat

    ↓ API: /api/auth/*
    ├─ POST /register → Create taikhoan + khachhang
    ├─ POST /login → Verify password, return JWT
    ├─ GET /profile → Return taikhoan data
    └─ POST /logout → Invalidate JWT
```

### Customer Management
```
khachhang (Customers)
├─ MaKH (PK)
├─ TenKH
├─ SDT
├─ Email (UNIQUE)
├─ NgaySinh
├─ GioiTinh
├─ DiaChi
├─ MaTaiKhoan (FK → taikhoan)
├─ TrangThai
└─ NgayTao

address (Customer Addresses)
├─ MaAddress (PK)
├─ MaKH (FK → khachhang)
├─ DiaChiChiTiet
├─ QuanHuyen
├─ ThanhPho
├─ QuocGia
├─ MaPostal
└─ MaChinh (default address flag)

    ↓ API: /api/customers/* & /api/addresses/*
    ├─ GET /customers/:id → Return khachhang
    ├─ GET /customers/:id/addresses → Return address[]
    ├─ POST /addresses → Create address
    ├─ PUT /addresses/:id → Update address
    └─ DELETE /addresses/:id → Delete address
```

### Product Catalog
```
loaisanpham (Categories)
├─ MaLoai (PK)
├─ TenLoai
├─ Mota
└─ TrangThai

sanpham (Products)
├─ MaSP (PK)
├─ TenSP
├─ MoTa
├─ GiaVon
├─ GiaBan
├─ MaLoai (FK → loaisanpham)
├─ Hinh (image URL)
├─ TrangThai
├─ NgayTao
└─ NgayCapNhat

    ↓ API: /api/products/* & /api/categories/*
    ├─ GET /products → Return sanpham[] with filters
    ├─ GET /products/:id → Return single sanpham
    ├─ POST /products → Create sanpham
    ├─ PUT /products/:id → Update sanpham
    ├─ DELETE /products/:id → Soft delete sanpham
    ├─ GET /categories → Return loaisanpham[]
    ├─ POST /categories → Create loaisanpham
    ├─ PUT /categories/:id → Update loaisanpham
    └─ GET /search → Search across sanpham
```

### Inventory Management
```
kho (Warehouses)
├─ MaKho (PK)
├─ TenKho
├─ DiaChi
├─ SoDienThoai
└─ TrangThai

tonkho (Warehouse Stock)
├─ MaKho (FK → kho) [PK]
├─ MaSP (FK → sanpham) [PK]
└─ SoLuong

cuahang (Stores)
├─ MaCH (PK)
├─ TenCH
├─ DiaChi
├─ SDT
└─ TrangThai

tonkhocuahang (Store Stock)
├─ MaCH (FK → cuahang) [PK]
├─ MaSP (FK → sanpham) [PK]
└─ SoLuong

    ↓ API: /api/stock/*, /api/stores/*, /api/warehouses/*
    ├─ GET /stock/warehouse/:id → Return tonkho[]
    ├─ GET /stock/store/:id → Return tonkhocuahang[]
    ├─ POST /stock/check → Verify availability
    ├─ PUT /stock/warehouse/:id → Update tonkho
    ├─ GET /stores → Return cuahang[]
    ├─ GET /stores/:id → Return with stock info
    ├─ GET /warehouses → Return kho[]
    └─ POST /warehouses/transfer → Transfer between locations
```

### Order Management
```
donhang (Orders)
├─ MaDH (PK)
├─ order_code (UNIQUE) → Generated ORD-DATE-SEQUENCE
├─ MaKH (FK → khachhang)
├─ MaTaiKhoan (FK → taikhoan)
├─ MaCH (FK → cuahang) → source store
├─ address_id (FK → address)
├─ order_type (1=online, 2=in-store)
├─ subtotal
├─ shipping_fee
├─ TongTien
├─ TrangThai (1=pending, 2=confirmed, 3=shipped, 4=delivered, 5=cancelled)
├─ payment_status (0=unpaid, 1=paid)
├─ payment_method (vnpay, cod, bank transfer)
├─ customer_note
├─ NgayTao
└─ NgayCapNhat

chitietdonhang (Order Items)
├─ MaDH (FK → donhang) [PK]
├─ MaSP (FK → sanpham) [PK]
├─ SoLuong
└─ TongTien

    ↓ API: /api/orders/*
    ├─ POST /orders → Create donhang + chitietdonhang
    ├─ GET /orders → List user's orders
    ├─ GET /orders/:id → Return order details
    ├─ PUT /orders/:id/status → Update TrangThai
    ├─ DELETE /orders/:id → Cancel order (set TrangThai=5)
    └─ GET /invoices/:id → Generate invoice from order
```

### Payment Processing
```
payments (Payment Records)
├─ payment_id (PK) → Generated PAY-SEQUENCE
├─ MaHD (FK → donhang)
├─ MaKH (FK → khachhang)
├─ transaction_id (from VNPay)
├─ amount
├─ currency (default: VND)
├─ payment_method (vnpay, cod, etc.)
├─ payment_endpoint (VNPay URL)
├─ status (0=pending, 1=success, 2=failed)
├─ paid_at
├─ note
└─ NgayTao

payment_logs (Payment Event Logs)
├─ Payment_Logs_id (PK) [autoincrement]
├─ payment_id (FK → payments)
├─ log_type (initiated, verified, completed, failed)
├─ vnp_TxnRef (VNPay transaction ref)
├─ response_code (00=success, others=error)
├─ message (VNPay response message)
├─ new_data (JSON response from VNPay)
└─ created_at

    ↓ API: /api/payments/*
    ├─ POST /payments/create → Create VNPay URL
    ├─ GET /payments/vnpay-return → Handle VNPay callback
    ├─ GET /payments/:id → Return payment record
    └─ GET /payments/:id/logs → Return payment_logs[]
```

### Promotions & Discounts
```
khuyenmai (Promotions)
├─ MaKM (PK)
├─ TenKM
├─ Mota
├─ TyLe (discount percentage, 0-100)
├─ GiaTriMin (minimum order value)
├─ NgayBatDau
├─ NgayKetThuc
├─ GioiHanSuDung
├─ TrangThai
└─ NgayTao

khuyenmaikhachhang (Customer Promotions)
├─ Makmkh (PK)
├─ MaKM (FK → khuyenmai)
├─ MaKH (FK → khachhang)
├─ NgayApply
└─ SoLanSuDung

    ↓ API: /api/promotions/*
    ├─ GET /promotions → List active promotions
    ├─ GET /promotions/:id/details → Return promotion details
    └─ POST /promotions/apply → Apply to customer
```

### Receipts & Transfers
```
phieunhap (Import Receipts)
├─ MaPN (PK)
├─ MaNPP (FK → nhaphanphoi)
├─ MaNV (FK → nhanvien)
├─ TongTien
├─ NgayTao
└─ TrangThai

chitietphieunhap (Import Items)
├─ MaPN (FK → phieunhap) [PK]
├─ MaSP (FK → sanpham) [PK]
├─ SoLuong
└─ TongTien

phieuxuat (Export Receipts)
├─ MaPX (PK)
├─ MaNV (FK → nhanvien)
├─ MaCH (FK → cuahang)
├─ NgayTao
└─ TrangThai

chitietphieuxuat (Export Items)
├─ MaPX (FK → phieuxuat) [PK]
├─ MaSP (FK → sanpham) [PK]
└─ SoLuong

phieuchuyenhang (Transfer Receipts)
├─ MaPC (PK)
├─ MaCH_Xuat (FK → cuahang - source)
├─ MaCH_Nhan (FK → cuahang - destination)
├─ TongTien
├─ NgayTao
└─ trangthai

    ↓ API: /api/warehouses/* & /api/invoices/*
    ├─ POST /warehouses/:id/import → Create phieunhap
    ├─ GET /warehouses/:id/imports → List phieunhap
    ├─ POST /warehouses/transfer → Create phieuchuyenhang
    ├─ GET /invoices/:id → Return invoice data
    └─ GET /invoices/:id/pdf → Generate PDF
```

### Employee & Authorization
```
nhanvien (Employees)
├─ MaNV (PK)
├─ HoTen
├─ NgayNhanChuc
├─ TrangThai (active, inactive, on-leave)
├─ DiaChi
├─ SDT
├─ Email (UNIQUE)
├─ LuongNen
├─ MaCH (FK → cuahang) → assigned store
├─ MaKho (FK → kho) → assigned warehouse
└─ MaTaiKhoan (FK → taikhoan)

vaitro (Roles)
├─ MaVaiTro (PK)
└─ TenVaiTro (Admin, Manager, Staff, Customer)

phanquyen (Role Assignments)
├─ MaTK (FK → taikhoan) [PK]
├─ MaVaiTro (FK → vaitro) [PK]
├─ MaNV (FK → nhanvien)
└─ NgayGan

    ↓ API: Auth Middleware
    ├─ authMiddleware → Verify JWT
    └─ authorize(['Admin', 'Manager']) → Check roles
```

---

## 🔄 Entity Relationships Diagram (Text Format)

```
User Flow:
taikhoan (1) ---(many)--- khachhang (Customer)
            |
            +---(many)--- nhanvien (Employee)
            |
            +---(many)--- phanquyen (Role Assignment)
                |
                +---(many)--- vaitro (Roles)

Product Flow:
loaisanpham (1) ---(many)--- sanpham (Product)
                        |
                        +---(many)--- tonkho (Warehouse Stock)
                        |
                        +---(many)--- tonkhocuahang (Store Stock)

Order Flow:
donhang (Order)
├─ many-to-one: khachhang (Customer)
├─ many-to-one: taikhoan (User Account)
├─ many-to-one: cuahang (Store)
├─ many-to-one: address (Delivery Address)
├─ one-to-many: chitietdonhang (Order Items)
│              └─ many-to-one: sanpham (Product)
├─ one-to-many: payments (Payments)
├─ one-to-one: chuyenhangthanhpham (Shipment)
└─ many-to-many: khuyenmaikhachhang (Promotions)

Payment Flow:
payments (1) ---(many)--- payment_logs (Event Logs)
          |
          +---(many-to-one)--- donhang (Order)
          |
          +---(many-to-one)--- khachhang (Customer)

Inventory Flow:
kho (Warehouse) ---(many)--- tonkho (Warehouse Stock)
                          └─ many-to-one: sanpham (Product)

cuahang (Store) ---(many)--- tonkhocuahang (Store Stock)
                         └─ many-to-one: sanpham (Product)
```

---

## 🎯 Key Data Validation Rules

### Order Validation
- ✅ Check product exists and is active (TrangThai=1)
- ✅ Verify sufficient stock in tonkho
- ✅ Validate customer address
- ✅ Calculate totals correctly (subtotal + shipping_fee = TongTien)
- ✅ Ensure payment method is valid

### Payment Validation
- ✅ Verify VNPay signature matches computed hash
- ✅ Check amount matches order TongTien
- ✅ Validate transaction_id is unique
- ✅ Ensure payment status is only updated once

### Stock Validation
- ✅ Quantity must be positive integer
- ✅ Available stock >= requested quantity
- ✅ Update stock atomically (use transactions)
- ✅ Track both warehouse and store stock separately

### Customer Validation
- ✅ Email format is valid
- ✅ Email is unique
- ✅ Phone number format valid (if provided)
- ✅ Address fields required for orders

---

## 🔒 Data Integrity & Constraints

### Foreign Key Constraints
- donhang → khachhang: ON DELETE RESTRICT (prevent orphaned orders)
- donhang → taikhoan: ON DELETE RESTRICT
- chitietdonhang → donhang: ON DELETE CASCADE (delete items with order)
- payments → donhang: ON DELETE CASCADE
- payment_logs → payments: ON DELETE CASCADE

### Unique Constraints
- taikhoan.Email (unique)
- donhang.order_code (unique)
- payments.transaction_id (unique per payment)
- khachhang.Email (unique)
- nhanvien.Email (unique)

### Check Constraints (to implement in application)
- GiaBan >= GiaVon (product prices)
- SoLuong >= 0 (inventory quantities)
- TongTien >= subtotal (order totals)
- TyLe between 0 and 100 (promotion percentages)

---

## 📈 Database Indexes (Performance Optimization)

### Priority 1 (Critical for Query Performance)
```sql
-- User lookups
CREATE INDEX idx_taikhoan_email ON taikhoan(Email);
CREATE INDEX idx_khachhang_email ON khachhang(Email);
CREATE INDEX idx_khachhang_taikhoan ON khachhang(MaTaiKhoan);

-- Order queries
CREATE INDEX idx_donhang_makh ON donhang(MaKH);
CREATE INDEX idx_donhang_taikhoan ON donhang(MaTaiKhoan);
CREATE INDEX idx_donhang_order_code ON donhang(order_code);
CREATE INDEX idx_donhang_ngaytao ON donhang(NgayTao);

-- Product lookups
CREATE INDEX idx_sanpham_maloai ON sanpham(MaLoai);
CREATE INDEX idx_sanpham_trangthai ON sanpham(TrangThai);

-- Stock queries
CREATE INDEX idx_tonkho_makho ON tonkho(MaKho);
CREATE INDEX idx_tonkho_masp ON tonkho(MaSP);
CREATE INDEX idx_tonkhocuahang_mach ON tonkhocuahang(MaCH);
```

### Priority 2 (Regular Queries)
```sql
CREATE INDEX idx_chitietdonhang_madh ON chitietdonhang(MaDH);
CREATE INDEX idx_payments_mahd ON payments(MaHD);
CREATE INDEX idx_address_makh ON address(MaKH);
CREATE INDEX idx_nhanvien_mach ON nhanvien(MaCH);
```

---

## 🚀 Batch Operations (For Efficiency)

### Example: Create Order with Batch Operations
```typescript
async function createOrderWithBatch(
  userId: string,
  orderData: CreateOrderDTO
) {
  // Use Prisma transaction for atomic operations
  return prisma.$transaction(async (tx) => {
    // 1. Create order
    const order = await tx.donhang.create({
      data: { /* order data */ }
    });
    
    // 2. Create all order items in one batch
    await tx.chitietdonhang.createMany({
      data: orderData.items.map(item => ({
        MaDH: order.MaDH,
        MaSP: item.MaSP,
        SoLuong: item.SoLuong,
        TongTien: item.price * item.SoLuong
      }))
    });
    
    // 3. Decrement stock for all items
    for (const item of orderData.items) {
      await tx.tonkho.updateMany({
        where: { MaSP: item.MaSP },
        data: {
          SoLuong: {
            decrement: item.SoLuong
          }
        }
      });
    }
    
    return order;
  });
}
```

---

## 🔐 Security Considerations

### SQL Injection Prevention
- ✅ Use Prisma (ORM) - parameterized queries
- ✅ Never concatenate user input into queries
- ✅ Validate input types before querying

### Password Security
- ✅ Hash with bcrypt (10 rounds minimum)
- ✅ Never store plain passwords
- ✅ Compare hashes using bcrypt.compare()

### JWT Security
- ✅ Set expiration time (7 days recommended)
- ✅ Use strong secret key (32+ characters)
- ✅ Include only necessary claims (MaTaiKhoan, role)
- ✅ Verify signature on each request

### Authorization
- ✅ Check user permissions on every protected endpoint
- ✅ Verify resource ownership (e.g., customer can only view own orders)
- ✅ Use role-based access control (RBAC)

### Payment Security
- ✅ Always verify VNPay signature
- ✅ Never expose secret keys in frontend
- ✅ Use HTTPS for all payment requests
- ✅ Log all payment events for audit trail

---

## 📋 Migration Checklist

### Before Phase 1
- [ ] Node.js 18+ installed
- [ ] MySQL database created
- [ ] Environment variables configured
- [ ] TypeScript configuration ready

### Before Phase 2
- [ ] Database migrations applied
- [ ] Prisma schema validated
- [ ] Auth system tested end-to-end
- [ ] JWT token generation verified

### Before Phase 3
- [ ] All product endpoints working
- [ ] Stock calculations correct
- [ ] VNPay test credentials obtained
- [ ] Payment callback URL configured

### Before Phase 4
- [ ] All Phase 1-3 tests passing
- [ ] Performance benchmarks acceptable
- [ ] API documentation generated
- [ ] Database backups automated

---

## 🧪 Testing Strategy by Phase

### Phase 1 Testing
- [ ] Register & login flow
- [ ] JWT token generation & validation
- [ ] Authentication middleware
- [ ] Authorization checks

### Phase 2 Testing
- [ ] Product CRUD operations
- [ ] Category management
- [ ] Stock validation
- [ ] Search filters & sorting

### Phase 3 Testing
- [ ] Order creation with stock check
- [ ] Order cancellation with stock refund
- [ ] VNPay URL generation
- [ ] Payment verification
- [ ] Transaction atomicity

### Phase 4 Testing
- [ ] Customer address management
- [ ] Promotion application
- [ ] Invoice generation
- [ ] Warehouse transfers
- [ ] Report generation
- [ ] Performance under load

---

## 📝 Code Generation Templates

### Service Template
```typescript
export class {Name}Service {
  async getAll(filters?: any) {
    return prisma.{model}.findMany({
      ...(filters && { where: filters }),
      include: { /* relations */ }
    });
  }
  
  async getById(id: string) {
    const item = await prisma.{model}.findUnique({
      where: { {idField}: id },
      include: { /* relations */ }
    });
    if (!item) throw new NotFoundError('{Entity}');
    return item;
  }
  
  async create(data: any) {
    return prisma.{model}.create({ data });
  }
  
  async update(id: string, data: any) {
    return prisma.{model}.update({
      where: { {idField}: id },
      data
    });
  }
  
  async delete(id: string) {
    return prisma.{model}.delete({
      where: { {idField}: id }
    });
  }
}
```

### Controller Template
```typescript
export class {Name}Controller {
  private service = new {Name}Service();
  
  async getAll(req: Request, res: Response) {
    const items = await this.service.getAll(req.query);
    res.json(items);
  }
  
  async getById(req: Request, res: Response) {
    const item = await this.service.getById(req.params.id);
    res.json(item);
  }
  
  async create(req: Request, res: Response) {
    const item = await this.service.create(req.body);
    res.status(201).json(item);
  }
  
  async update(req: Request, res: Response) {
    const item = await this.service.update(req.params.id, req.body);
    res.json(item);
  }
  
  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    res.json({ message: 'Deleted' });
  }
}
```

---

**Document Status:** Complete & Ready for Development  
**Last Updated:** May 5, 2026  
**Maintained By:** Backend Architecture Team
