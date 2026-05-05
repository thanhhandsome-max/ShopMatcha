# API Phiếu Nhập Xuất - Documentation

## 📋 Tổng Quan
API xử lý phiếu nhập hàng từ nhà phân phối và phiếu xuất hàng khỏi kho.

---

## 🔗 Base URL
```
/api/phieu
```

---

## 📥 GET - Lấy Danh Sách

### Lấy tất cả phiếu nhập
```
GET /api/phieu?type=nhap
```

**Response:**
```json
{
  "ok": true,
  "phieu": [
    {
      "MaPN": "PN1704067200000",
      "MaNPP": "NPP001",
      "MaNV": "NV001",
      "TongTien": 500000,
      "NgayTao": "2024-01-01",
      "TrangThai": 1
    }
  ]
}
```

### Lấy tất cả phiếu xuất
```
GET /api/phieu?type=xuat
```

### Lấy phiếu cụ thể (nhập)
```
GET /api/phieu?type=nhap&maphieu=PN1704067200000
```

### Lấy phiếu cụ thể với chi tiết sản phẩm
```
GET /api/phieu?type=nhap&maphieu=PN1704067200000&chitiet=true
```

**Response:**
```json
{
  "ok": true,
  "phieu": [...],
  "chitiet": [
    {
      "MaPN": "PN1704067200000",
      "MaSP": "SP001",
      "SoLuong": 10,
      "TongTien": 100000
    }
  ]
}
```

---

## ✍️ POST - Tạo Phiếu Mới

### Tạo phiếu nhập
```
POST /api/phieu
Content-Type: application/json

{
  "type": "nhap",
  "phieu": {
    "MaNPP": "NPP001",
    "MaNV": "NV001",
    "TongTien": 500000,
    "NgayTao": "2024-01-01",
    "TrangThai": 1
  },
  "chitiet": [
    {
      "MaSP": "SP001",
      "SoLuong": 10,
      "TongTien": 100000
    },
    {
      "MaSP": "SP002",
      "SoLuong": 20,
      "TongTien": 400000
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "success": true,
  "MaPN": "PN1704067200000"
}
```

### Tạo phiếu xuất
```
POST /api/phieu

{
  "type": "xuat",
  "phieu": {
    "MaNV": "NV001",
    "MaCH": "CH001",
    "TongTien": 300000,
    "NgayTao": "2024-01-01",
    "TrangThai": 1
  },
  "chitiet": [
    {
      "MaSP": "SP001",
      "SoLuong": 5
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "success": true,
  "MaPX": "PX1704067200000"
}
```

---

## ✏️ PUT - Cập Nhật Phiếu

### Cập nhật phiếu nhập
```
PUT /api/phieu
Content-Type: application/json

{
  "type": "nhap",
  "maphieu": "PN1704067200000",
  "phieu": {
    "TongTien": 550000,
    "TrangThai": 2
  }
}
```

### Cập nhật phiếu xuất
```
PUT /api/phieu

{
  "type": "xuat",
  "maphieu": "PX1704067200000",
  "phieu": {
    "TrangThai": 1
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

---

## 🗑️ DELETE - Xóa Phiếu

### Xóa phiếu nhập
```
DELETE /api/phieu
Content-Type: application/json

{
  "type": "nhap",
  "maphieu": "PN1704067200000"
}
```

### Xóa phiếu xuất
```
DELETE /api/phieu

{
  "type": "xuat",
  "maphieu": "PX1704067200000"
}
```

**Response:**
```json
{
  "ok": true
}
```

---

## ⚠️ Error Responses

### Missing type
```json
{
  "ok": false,
  "error": "Missing or invalid type"
}
```

### Database error
```json
{
  "ok": false,
  "error": "Error message here"
}
```

### Missing fields
```json
{
  "ok": false,
  "error": "Missing MaPN"
}
```

---

## 🎯 Lưu Ý

1. **Mã phiếu tự động**: Mã phiếu được tạo tự động với pattern `PN/PX + timestamp`
2. **Chi tiết phiếu**: Chi tiết phiếu được lưu tự động khi tạo phiếu
3. **Xóa phiếu**: Khi xóa phiếu, tất cả chi tiết sẽ bị xóa
4. **Cập nhật**: Chỉ cập nhật các trường được cung cấp, không cần truyền tất cả

---

## 🔧 Frontend Integration

### React Hook ví dụ
```typescript
// Lấy danh sách
const fetchPhieu = async (type: 'nhap' | 'xuat') => {
  const res = await fetch(`/api/phieu?type=${type}`);
  const data = await res.json();
  return data.phieu;
};

// Tạo phiếu
const createPhieu = async (type: 'nhap' | 'xuat', phieu, chitiet) => {
  const res = await fetch('/api/phieu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, phieu, chitiet })
  });
  const data = await res.json();
  return data.MaPN || data.MaPX;
};

// Cập nhật
const updatePhieu = async (type: 'nhap' | 'xuat', maphieu, phieu) => {
  const res = await fetch('/api/phieu', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, maphieu, phieu })
  });
  return res.json();
};

// Xóa
const deletePhieu = async (type: 'nhap' | 'xuat', maphieu) => {
  const res = await fetch('/api/phieu', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, maphieu })
  });
  return res.json();
};
```
