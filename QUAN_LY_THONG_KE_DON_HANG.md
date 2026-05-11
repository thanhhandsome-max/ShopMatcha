# 📊 Hướng Dẫn Chức Năng Quản Lý & Thống Kê Đơn Hàng

## 🎯 Tổng Quát

Hệ thống đơn hàng ShopMatcha hiện đã được tách thành **2 trang riêng biệt**:

### 1️⃣ **Quản Lý Đơn Hàng** (`/don-hang`)
- ✅ Quản lý toàn bộ đơn hàng
- ✅ Thay đổi trạng thái đơn hàng
- ✅ Hủy đơn hàng với lý do
- ✅ Xem chi tiết đơn hàng
- ✅ Bộ lọc nâng cao
- ❌ **Đã xóa:** Phần thống kê tổng quan (5 metrics)

### 2️⃣ **Thống Kê Đơn Hàng** (`/thong-ke-don-hang`) - **MỚI**
- 📊 Dashboard phân tích chi tiết
- 📈 Thống kê theo trạng thái
- 🎨 Tabs lọc nhanh theo status
- 📉 Lọc theo thời gian & cửa hàng
- 📋 View chi tiết từng đơn

---

## 🗂️ Cấu Trúc Thư Mục

```
src/app/(admin)/(others-pages)/
├── don-hang/
│   └── page.tsx                    # Quản lý đơn hàng
├── thong-ke-don-hang/             # Mới
│   └── page.tsx                    # Thống kê đơn hàng
src/layout/
└── AppSidebar.tsx                 # Sidebar cập nhật
```

---

## 📍 Sidebar Menu

Menu đơn hàng giờ có **2 submenu**:

```
📦 Quản lý đơn hàng
  ├─ 🎯 Quản lý đơn hàng    → /don-hang
  └─ 📊 Thống kê đơn hàng   → /thong-ke-don-hang
```

---

## 🚀 Tính Năng Chi Tiết

### **Quản Lý Đơn Hàng** 

**Features:**
- Hiển thị bảng đơn hàng chi tiết
- Lọc theo: Trạng thái, Cửa hàng, Ngày, Tìm kiếm
- Modal chi tiết từng đơn:
  - Thông tin khách hàng
  - Danh sách sản phẩm
  - Chi tiết thanh toán
  - Thay đổi trạng thái
  - Hủy đơn hàng

**Trạng Thái Đơn Hàng:**
- 🟨 Chờ xử lý (1)
- 🔵 Đang xử lý (2)
- 🟦 Đang giao (3)
- 🟩 Hoàn thành (4)
- 🔴 Đã hủy (5)

---

### **Thống Kê Đơn Hàng** ✨ NEW

**Features:**
- **Overview Stats:**
  - Tổng đơn hàng
  - Tổng doanh thu
  - Đang xử lý (count)
  - Hoàn thành (count)
  - Đã hủy (count)

- **Status Tabs:** Lọc nhanh theo trạng thái
  - 📋 Tất cả
  - ⏳ Chờ xử lý
  - ⚙️ Đang xử lý
  - 🚚 Đang giao
  - ✅ Hoàn thành

- **Advanced Filters:**
  - Thời gian: Từ - Đến
  - Cửa hàng
  - Tìm kiếm nhanh (Mã đơn, SĐT)

- **Bảng Orders:**
  - Mã đơn
  - Khách hàng
  - SĐT
  - Tổng tiền
  - Trạng thái (color-coded)
  - Ngày tạo
  - Chi tiết (button)

- **Modal Chi Tiết:** Hiển thị đầy đủ thông tin đơn hàng

---

## 🔧 API Endpoints

Hệ thống sử dụng các endpoints sau:

```
GET  /api/don-hang                              # Lấy danh sách
POST /api/don-hang/[maHD]                       # Chi tiết
PUT  /api/don-hang/[maHD]/update-status         # Thay đổi trạng thái
DELETE /api/don-hang/[maHD]/cancel              # Hủy đơn
GET  /api/don-hang/stats/tong-hop               # Thống kê tổng
GET  /api/don-hang/stats/theo-trang-thai        # Thống kê trạng thái
```

---

## 💾 Service Functions

Tất cả functions nằm trong `src/services/don-hang.service.ts`:

```typescript
// Lấy danh sách với lọc
getDonHangWithFilter(filter)

// Chi tiết đơn hàng
getDonHangDetail(maHD)
getChiTietDonHang(maHD)

// Cập nhật trạng thái
updateTrangThaiDonHang(maHD, trangThai)

// Hủy đơn
huyDonHang(maHD, lyDo)

// Thống kê
getThongKeDonHang(filter)
getThongKeTheoTrangThai(filter)
```

---

## 🎨 Styling & Colors

| Trạng Thái | Color Scheme | Icon |
|-----------|--------------|------|
| Chờ xử lý | Amber (🟨) | ⏳ |
| Đang xử lý | Blue (🔵) | ⚙️ |
| Đang giao | Indigo (🟦) | 🚚 |
| Hoàn thành | Emerald (🟩) | ✅ |
| Đã hủy | Rose (🔴) | ❌ |

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimized
- ✅ Desktop enhanced
- ✅ Table scrollable
- ✅ Modals fit viewport

---

## 🔄 Workflow Ví Dụ

### Quản Lý Đơn Hàng:
1. Mở page `/don-hang`
2. Áp dụng bộ lọc (nếu cần)
3. Click "Chi tiết" trên đơn hàng
4. Modal hiện chi tiết
5. Thay đổi trạng thái hoặc hủy đơn
6. Bảng tự động cập nhật

**Lưu ý:** Trang này chỉ tập trung vào quản lý đơn hàng, không còn phần thống kê tổng quan.

### Thống Kê Đơn Hàng:
1. Mở page `/thong-ke-don-hang`
2. Xem overview stats
3. Lọc theo status (tab)
4. Hoặc áp dụng filter nâng cao
5. Xem bảng đơn hàng theo bộ lọc
6. Click "Chi tiết" để xem toàn bộ

---

## 🐛 Fix Log

### Issue: 404 Not Found - DELETE /api/don-hang/[maHD]/cancel
**Nguyên nhân:** Next.js 15+ yêu cầu `params` phải là `Promise`
**Fix:** Thêm `await params` trong route handler

### Before:
```typescript
export async function DELETE(
  req: NextRequest,
  { params }: { params: { maHD: string } }
)
```

### After:
```typescript
type RouteContext = {
  params: Promise<{ maHD: string }>;
};

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { maHD } = await params;
```

---

## 📊 Database Schema Reference

Bảng chính: `hoadon`

```sql
- MaHD (PK)
- MaKH
- MaCuahang
- MaNV
- TongTien
- TrangThai (1,2,3,4,5)
- NgayTao
- subtotal
- shipping_fee
- payment_status
- payment_method
```

---

## 🚀 Testing

### Quản Lý Đơn Hàng:
- [ ] Hiển thị danh sách
- [ ] Lọc theo trạng thái
- [ ] Mở modal chi tiết
- [ ] Thay đổi trạng thái
- [ ] Hủy đơn hàng
- [ ] **Đã xóa:** Thống kê tổng quan (5 metrics)

### Thống Kê Đơn Hàng:
- [ ] Stats overview hiển thị
- [ ] Tabs lọc hoạt động
- [ ] Filter nâng cao hoạt động
- [ ] Bảng update theo filter
- [ ] Modal chi tiết hoạt động

---

## 📝 Notes

- Cả 2 page đều sử dụng chung service & types
- Modal reusable cho cả 2 page
- Filter logic nhất quán
- UI/UX consistent
- Performance optimized
- **Lưu ý:** Trang quản lý đơn hàng đã loại bỏ phần thống kê tổng quan để tập trung vào chức năng quản lý

---

**Bản cập nhật:** v2.1 - Removed Stats from Management Page
**Ngày:** May 2026
