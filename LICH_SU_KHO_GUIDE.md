# 📦 Hướng dẫn tính năng - Lịch sử Nhập/Xuất/Chuyển hàng

## 📋 Tổng quan

Tính năng **Lịch sử Nhập/Xuất/Chuyển hàng** giúp bạn theo dõi toàn bộ giao dịch liên quan đến tồn kho. Mỗi khi tạo phiếu nhập, xuất, hoặc chuyển hàng, hệ thống sẽ tự động ghi lại lịch sử chi tiết.

### ✨ Các tính năng chính:

- ✅ **Ghi lịch sử tự động**: Mỗi phiếu nhập/xuất/chuyển được tạo sẽ tự động ghi vào bảng lịch sử
- ✅ **Bộ lọc linh hoạt**: Lọc theo loại giao dịch, khoảng thời gian, kho hàng, sản phẩm
- ✅ **Thống kê chi tiết**: Xem tổng số lượng và tổng tiền nhập/xuất/chuyển
- ✅ **Theo dõi nhân viên**: Biết ai tạo phiếu và khi nào
- ✅ **Quản lý trạng thái**: Cập nhật trạng thái giao dịch (chờ xác nhận, đã xác nhận, hoàn thành)

---

## 🗄️ Cấu hình Database

### 1️⃣ Tạo bảng `lichsukho` trong SQL Server:

```sql
CREATE TABLE lichsukho (
  MaLS VARCHAR(20) PRIMARY KEY,
  MaSP VARCHAR(20) NOT NULL,
  MaKho VARCHAR(20) NULL,        -- Kho (cho nhập, kho xuất cho chuyển)
  MaCH VARCHAR(20) NULL,         -- Cửa hàng (cho xuất, kho nhận cho chuyển)
  LoaiGiaoDich VARCHAR(20) NOT NULL, -- 'nhap', 'xuat', 'chuyen'
  SoLuong INT NOT NULL,
  GiaTien DECIMAL(10,2) NULL,
  TongTien DECIMAL(10,2) NULL,
  MaPhieu VARCHAR(20) NOT NULL,
  MaNhanVien VARCHAR(20) NULL,
  GhiChu NVARCHAR(500) NULL,
  NgayTao DATETIME DEFAULT GETDATE(),
  TrangThaiGiaoDich TINYINT DEFAULT 1, -- 0: Chờ, 1: Xác nhận, 2: Hoàn thành
  
  FOREIGN KEY (MaSP) REFERENCES sanpham(MaSP),
  FOREIGN KEY (MaKho) REFERENCES kho(MaKho),
  FOREIGN KEY (MaCH) REFERENCES cuahang(MaCH),
  FOREIGN KEY (MaNhanVien) REFERENCES nhanvien(MaNV),
  FOREIGN KEY (MaPhieu) REFERENCES phieunhap(MaPN)
);

-- Tạo index để tối ưu hóa truy vấn
CREATE INDEX idx_lichsu_kho ON lichsukho(MaKho);
CREATE INDEX idx_lichsu_ch ON lichsukho(MaCH);
CREATE INDEX idx_lichsu_sp ON lichsukho(MaSP);
CREATE INDEX idx_lichsu_phieu ON lichsukho(MaPhieu);
CREATE INDEX idx_lichsu_date ON lichsukho(NgayTao);
CREATE INDEX idx_lichsu_loai ON lichsukho(LoaiGiaoDich);
```

---

## 🔧 Cơ chế hoạt động

### 1. Tạo phiếu nhập (Phiếu Nhập)

**Flow:**
```
Người dùng tạo Phiếu Nhập
     ↓
API /api/phieu (POST, type=nhap)
     ↓
Tạo phiếu nhập → Cập nhật tonkho
     ↓
Tự động gọi taoLichSuNhap() cho mỗi sản phẩm
     ↓
Ghi vào bảng lichsukho với:
  - LoaiGiaoDich = 'nhap'
  - MaKho = Kho nhập hàng
  - MaPhieu = Mã PN
```

### 2. Tạo phiếu xuất (Phiếu Xuất)

**Flow:**
```
Người dùng tạo Phiếu Xuất
     ↓
API /api/phieu (POST, type=xuat)
     ↓
Tạo phiếu xuất → Cập nhật tonkho
     ↓
Tự động gọi taoLichSuXuat() cho mỗi sản phẩm
     ↓
Ghi vào bảng lichsukho với:
  - LoaiGiaoDich = 'xuat'
  - MaCH = Cửa hàng xuất hàng
  - MaPhieu = Mã PX
```

### 3. Tạo phiếu chuyển (Phiếu Chuyển Hàng)

**Flow:**
```
Người dùng tạo Phiếu Chuyển Hàng
     ↓
API /api/phieu (POST, type=chuyen)
     ↓
Tạo phiếu chuyển → Cập nhật tonkho
     ↓
Tự động gọi taoLichSuChuyen() cho mỗi sản phẩm
     ↓
Ghi vào bảng lichsukho với:
  - LoaiGiaoDich = 'chuyen'
  - MaKho = Kho xuất (kho nguồn)
  - MaCH = Kho nhận (kho đích)
  - MaPhieu = Mã PC
```

---

## 📁 Cấu trúc file mới

```
src/
├── services/
│   └── lich-su-kho.service.ts          ← Service client gọi API
│
├── components/
│   └── lichsukho/
│       ├── LichSuKhoTable.tsx           ← Bảng danh sách lịch sử
│       ├── LichSuKhoFilter.tsx          ← Bộ lọc tìm kiếm
│       └── LichSuKhoStats.tsx           ← Thống kê nhập/xuất/chuyển
│
├── app/api/
│   └── lich-su-kho/
│       └── route.ts                    ← API endpoint
│
├── types/
│   └── index.ts                        ← Thêm ILichSuKho interface
│
└── app/(admin)/(others-pages)/quan-ly-kho/
    └── lich-su/
        └── page.tsx                    ← Trang xem lịch sử
```

---

## 🔌 API Endpoints

### GET `/api/lich-su-kho`

Lấy toàn bộ lịch sử hoặc bộ lọc:

**Query Parameters:**
- `type`: Loại giao dịch (`nhap`, `xuat`, `chuyen`)
- `kho`: Mã kho
- `sanpham`: Mã sản phẩm
- `phieu`: Mã phiếu (PN, PX, PC)
- `startDate`: Từ ngày (ISO format)
- `endDate`: Đến ngày (ISO format)

**Example:**
```bash
GET /api/lich-su-kho?type=nhap&startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "ok": true,
  "lichSu": [
    {
      "MaLS": "LS00001",
      "MaSP": "SP001",
      "TenSP": "Sản phẩm A",
      "MaCodeSp": "CODE001",
      "MaKho": "K001",
      "TenKho": "Kho 1",
      "MaCH": null,
      "TenCH": null,
      "LoaiGiaoDich": "nhap",
      "SoLuong": 100,
      "GiaTien": 50000,
      "TongTien": 5000000,
      "MaPhieu": "PN001",
      "MaNhanVien": "NV001",
      "TenNhanVien": "Nguyễn Văn A",
      "GhiChu": "Nhập từ nhà cung cấp",
      "NgayTao": "2024-01-15T10:30:00Z",
      "TrangThaiGiaoDich": 1
    }
  ],
  "count": 1
}
```

### POST `/api/lich-su-kho`

Tạo bản ghi lịch sử mới (thường được gọi tự động từ phiếu service):

**Request Body:**
```json
{
  "type": "nhap",
  "maSP": "SP001",
  "soLuong": 100,
  "giaTien": 50000,
  "tongTien": 5000000,
  "maPhieu": "PN001",
  "maNhanVien": "NV001",
  "ghiChu": "Nhập từ nhà cung cấp"
}
```

### PUT `/api/lich-su-kho`

Cập nhật trạng thái lịch sử:

```json
{
  "maLS": "LS00001",
  "trangThai": 2,
  "ghiChu": "Đã hoàn thành kiểm kho"
}
```

### DELETE `/api/lich-su-kho`

Xóa bản ghi lịch sử:

```json
{
  "maLS": "LS00001"
}
```

---

## 🎨 Giao diện & Sử dụng

### Truy cập trang lịch sử kho:

```
Admin Dashboard → Quản lý kho → Lịch sử nhập/xuất/chuyển hàng
```

hoặc trực tiếp: `/admin/quan-ly-kho/lich-su`

### Tính năng giao diện:

1. **Bộ lọc tìm kiếm:**
   - Lọc theo loại giao dịch
   - Lọc theo khoảng ngày
   - Nút Lọc & Reset

2. **Thống kê:**
   - Tổng số lượng và tiền nhập
   - Tổng số lượng và tiền xuất
   - Tổng số lượng và tiền chuyển

3. **Danh sách:**
   - Hiển thị chi tiết đầy đủ
   - Badge màu sắc cho loại giao dịch
   - Badge trạng thái giao dịch
   - Định dạng tiền tệ VND

---

## 💻 Sử dụng Service từ Component

### Import service:

```typescript
import * as lichSuService from '@/services/lich-su-kho.service';
```

### Lấy lịch sử:

```typescript
// Lấy tất cả
const allHistory = await lichSuService.getAllLichSuKho();

// Lấy theo loại
const importHistory = await lichSuService.getLichSuByType('nhap');
const exportHistory = await lichSuService.getLichSuByType('xuat');

// Lấy theo kho
const warehouseHistory = await lichSuService.getLichSuByKho('K001');

// Lấy theo sản phẩm
const productHistory = await lichSuService.getLichSuBySanPham('SP001');

// Lấy theo phiếu
const slipHistory = await lichSuService.getLichSuByPhieu('PN001');
```

---

## 🐛 Xử lý lỗi

Nếu gặp lỗi khi tạo phiếu:

1. **Lỗi: "Không thể ghi lịch sử"**
   - Kiểm tra database connection
   - Xem logs: Console browser F12 → Network/Console

2. **Lỗi: "Không thể tải lịch sử"**
   - Kiểm tra xem bảng `lichsukho` đã được tạo chưa
   - Kiểm tra các foreign keys có hợp lệ không

3. **Lịch sử không hiển thị**
   - Kiểm tra API response: F12 → Network
   - Kiểm tra dữ liệu trong database

---

## 📊 Mở rộng tính năng

### Thêm export Excel:

```typescript
// Cần cài: npm install xlsx
import * as XLSX from 'xlsx';

const exportToExcel = (data: ILichSuKho[]) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử kho');
  XLSX.writeFile(wb, 'lich-su-kho.xlsx');
};
```

### Thêm biểu đồ thống kê:

Sử dụng ApexCharts hoặc Chart.js để vẽ biểu đồ:
- Biểu đồ cột: Nhập/xuất theo tháng
- Biểu đồ tròn: Phân bổ theo loại giao dịch
- Biểu đồ dòng: Tren số lượng theo thời gian

---

## ✅ Checklist triển khai

- [ ] Chạy SQL script tạo bảng `lichsukho`
- [ ] Kiểm tra import statement trong phieu.service.ts
- [ ] Test tạo phiếu nhập (kiểm tra auto history)
- [ ] Test tạo phiếu xuất (kiểm tra auto history)
- [ ] Test tạo phiếu chuyển (kiểm tra auto history)
- [ ] Truy cập trang `/admin/quan-ly-kho/lich-su`
- [ ] Test bộ lọc (loại, ngày)
- [ ] Kiểm tra thống kê hiển thị đúng
- [ ] Kiểm tra logs không có lỗi

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console browser (F12)
2. Kiểm tra Network tab để xem API response
3. Xem SQL error logs
4. Kiểm tra xem tất cả import/export có đúng không

---

**Ngày tạo:** 2024
**Phiên bản:** 1.0
