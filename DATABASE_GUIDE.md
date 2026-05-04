# 📋 Hướng Dẫn Cập Nhật Database - ADMIN_MCSHOP

Khi bạn thay đổi database mới với các bảng mới, dưới đây là tất cả các file cần sửa để sử dụng data đó:

---

## 🔧 1. FILE KẾT NỐI DATABASE

**File:** `src/lib/db.ts`
- Cấu hình kết nối SQL Server
- Kiểm tra biến môi trường: `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_DATABASE`, `DB_PORT`
- Không cần thay đổi code, chỉ cần cập nhật `.env` file

---

## 📦 2. FILE ĐỊNH NGHĨA INTERFACE TYPES

**File:** `src/types/index.ts`

Các interface hiện tại:
- `VaiTro` - Vai trò người dùng
- `TaiKhoan` - Tài khoản đăng nhập
- `Kho` - Kho hàng
- `CuaHang` - Cửa hàng
- `NhanVien` - Nhân viên
- `LoaiSP` - Loại sản phẩm
- `SanPham` - Sản phẩm
- `TonKho` - Tồn kho
- `NhaPP` - Nhà phân phối
- `KhachHang` - Khách hàng
- `KhuyenMai` - Khuyến mại
- `MaGiamGia` - Mã giảm giá
- `PhieuNhap` - Phiếu nhập
- `CT_PhieuNhap` - Chi tiết phiếu nhập
- `PhieuXuat` - Phiếu xuất
- `CT_PhieuXuat` - Chi tiết phiếu xuất
- `PhieuChuyen` - Phiếu chuyển
- `CT_PhieuChuyen` - Chi tiết phiếu chuyển
- `DonHang` - Đơn hàng

**Cần sửa:**
- Nếu tên cột trong database khác, cập nhật tên cột trong interface
- Nếu có bảng mới, thêm interface mới
- Nếu xóa bảng, xóa interface tương ứng

---

## 🌐 3. FILE API ENDPOINTS (Route Handlers)

### 3.1 LoaiSP (Loại Sản Phẩm)
**File:** `src/app/api/loai-san-pham/route.ts`

```typescript
const TABLE = 'LoaiSP'; // ← Tên bảng trong database
```

**Các method:**
- `GET()` - Lấy tất cả loại sản phẩm
- `POST()` - Thêm loại sản phẩm mới (cần: MaLSP, TenLSP)
- `PUT()` - Cập nhật loại sản phẩm (cần: MaLSP, TenLSP)
- `DELETE()` - Xóa loại sản phẩm (cần: MaLSP)

**Cần sửa:**
- Sửa `TABLE` nếu tên bảng khác
- Sửa các column names trong câu SQL SELECT/INSERT/UPDATE/DELETE
- Sửa tên tham số trong `req.input()` nếu tên cột khác

### 3.2 SanPham (Sản Phẩm)
**File:** `src/app/api/san-pham/route.ts`

```typescript
const TABLE = 'SanPham'; // ← Tên bảng trong database
```

**Các method:**
- `GET()` - Lấy tất cả sản phẩm
- `POST()` - Thêm sản phẩm mới (tự động generate MaSP)
- `PUT()` - Cập nhật sản phẩm (cần: MaSP, TenSP, MaLSP)
- `DELETE()` - Xóa sản phẩm (cần: MaSP, tự động xóa ảnh từ thư mục)

**Cấu trúc dữ liệu cần có:**
```javascript
{
  MaSP: string,      // Primary key, tự động generate
  TenSP: string,     // Tên sản phẩm
  Gia: number,       // Giá
  TrangThai: number, // 1: Đang bán, 2: Hết hàng, 0: Ngừng kinh doanh
  Nhan: string,      // Nhãn hiệu
  MoTa: string,      // Mô tả
  Anh: string,       // Tên file ảnh (lưu tại public/images/product/)
  MaLSP: string      // Foreign key - Mã loại sản phẩm
}
```

**Cần sửa:**
- Cột SELECT trong GET()
- Cột INSERT trong POST()
- Cột UPDATE trong PUT()

---

## 🛠️ 4. FILE SERVICES (Client-side)

### 4.1 LoaiSanPham Service
**File:** `src/services/LoaiSanPham.service.ts`

```typescript
const base = '/api/loai-san-pham'; // ← Endpoint API
```

Các method:
- `getAll()` - Lấy tất cả loại sản phẩm
- `create(payload)` - Thêm mới
- `update(maLSP, tenLSP)` - Sửa
- `delete(maLSP)` - Xóa

**Cần sửa:** Nếu API endpoint khác, sửa `base` URL

### 4.2 SanPham Service
**File:** `src/services/SanPham.service.ts`

```typescript
const base = '/api/san-pham'; // ← Endpoint API
```

Các method:
- `getAll()` - Lấy tất cả sản phẩm
- `create(payload)` - Thêm mới
- `update(maSP, payload)` - Sửa
- `delete(maSP)` - Xóa

**Cần sửa:** Nếu API endpoint khác, sửa `base` URL

---

## 📄 5. COMPONENTS & PAGES SỬ DỤNG DỮ LIỆU

### 5.1 Trang Sản Phẩm
**File:** `src/app/(admin)/(others-pages)/san-pham/page.tsx`

```typescript
const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
// Sử dụng sanPhamService để lấy/thêm/sửa/xóa dữ liệu
```

**Cần sửa:**
- Nếu type của state khác, cập nhật `SanPham[]`
- Nếu API path khác, cập nhật service call

### 5.2 Component Form Sản Phẩm
**File:** `src/components/sanpham/SanPhamForm.tsx`

```typescript
const [formData, setFormData] = useState<Partial<SanPham>>({...});
```

**Cần sửa:**
- Nếu thêm field mới, thêm vào form
- Nếu xóa field, xóa khỏi form
- Cập nhật validation logic nếu cần

### 5.3 Component Select Loại Sản Phẩm
**File:** `src/components/LoaiSanPham/LoaiSanPhamSelect.tsx`

**Cần sửa:** Nếu tên cột hoặc display text khác

---

## 📁 6. UPLOAD API (Nếu dùng)

**File:** `src/app/api/upload/route.ts`

Xử lý upload ảnh sản phẩm, lưu vào: `public/images/product/`

---

## ✅ CHECKLIST HƯỚNG DẪN

Khi cập nhật database mới, thực hiện các bước sau:

### Bước 1: Định nghĩa Type/Interface
- [ ] Cập nhật `src/types/index.ts` để match với schema database mới
- [ ] Định nghĩa tất cả interface cho các bảng mới

### Bước 2: Cập nhật API Routes
- [ ] Cập nhật `src/app/api/loai-san-pham/route.ts` (nếu bảng LoaiSP thay đổi)
- [ ] Cập nhật `src/app/api/san-pham/route.ts` (nếu bảng SanPham thay đổi)
- [ ] Tạo route mới cho bảng mới (nếu có)
- [ ] Sửa các câu SQL SELECT, INSERT, UPDATE, DELETE
- [ ] Sửa các tên column trong câu query

### Bước 3: Cập nhật Services
- [ ] Cập nhật `src/services/LoaiSanPham.service.ts`
- [ ] Cập nhật `src/services/SanPham.service.ts`
- [ ] Tạo service mới cho bảng mới (nếu có)
- [ ] Cập nhật tên API endpoint nếu thay đổi

### Bước 4: Cập nhật Components & Pages
- [ ] Cập nhật type state nếu cần
- [ ] Cập nhật form fields
- [ ] Cập nhật validation logic
- [ ] Cập nhật display/render logic
- [ ] Test CRUD operations (Create, Read, Update, Delete)

### Bước 5: Test
- [ ] Test GET (Lấy dữ liệu)
- [ ] Test POST (Thêm mới)
- [ ] Test PUT (Cập nhật)
- [ ] Test DELETE (Xóa)

---

## 🔗 QUAN HỆ GIỮA CÁC FILE

```
Database (SQL Server)
    ↓
src/lib/db.ts (kết nối)
    ↓
src/app/api/*/route.ts (API endpoints - xử lý SQL queries)
    ↓
src/services/*.service.ts (gọi API từ client)
    ↓
src/app/(admin)/pages & src/components (hiển thị/edit dữ liệu)
    ↓
src/types/index.ts (định nghĩa type cho tất cả)
```

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Environment Variables**: Cần cấu hình `.env` file với:
   ```
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_SERVER=your_server
   DB_DATABASE=your_database
   DB_PORT=1433
   DB_ENCRYPT=false
   ```

2. **SQL Injection Prevention**: Luôn dùng parameterized queries (như `@MaSP`)

3. **Error Handling**: Tất cả API endpoint đều có try-catch và return error message

4. **Auto-increment ID**: MaSP tự động generate bằng cách lấy số cuối cùng + 1

5. **Image Upload**: Ảnh sản phẩm được lưu tại `public/images/product/` và tên file được lưu trong DB

6. **Data Validation**: Các field bắt buộc được validate trước khi insert vào DB

---

## 🚀 TẠAM TẮT - BƯỚC NHANH

Nếu chỉ thay bảng/cột mới:
1. Cập nhật interface trong `src/types/index.ts`
2. Sửa tên bảng và tên cột trong `src/app/api/*/route.ts`
3. Sửa tên field trong form component
4. Test thử CRUD

Nếu thêm bảng hoàn toàn mới:
1. Tạo interface mới trong `src/types/index.ts`
2. Tạo route file mới: `src/app/api/new-table/route.ts`
3. Tạo service mới: `src/services/NewTable.service.ts`
4. Tạo page/component mới để hiển thị/edit
5. Test CRUD

---

**Cần hỗ trợ gì không? Hãy tell me chi tiết thay đổi database của bạn! 😊**
