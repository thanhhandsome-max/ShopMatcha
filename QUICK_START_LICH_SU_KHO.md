# ⚡ Quick Start - Inventory History Feature

## 🎯 What Was Built?

A complete **Inventory Movement History** tracking system for ShopMatcha that automatically logs all import/export/transfer transactions.

---

## 📦 What You Get

```
✅ Automatic history logging when creating phiếu (slips)
✅ Advanced filtering by date, type, warehouse, product
✅ Statistics dashboard with totals and amounts
✅ Easy-to-use admin page
✅ Full API with GET/POST/PUT/DELETE
✅ TypeScript type safety
```

---

## 🚀 How to Deploy (3 Steps)

### Step 1: Create Database Table

Run this SQL script in your SQL Server:

```sql
CREATE TABLE lichsukho (
  MaLS VARCHAR(20) PRIMARY KEY,
  MaSP VARCHAR(20) NOT NULL,
  MaKho VARCHAR(20) NULL,
  MaCH VARCHAR(20) NULL,
  LoaiGiaoDich VARCHAR(20) NOT NULL, -- 'nhap', 'xuat', 'chuyen'
  SoLuong INT NOT NULL,
  GiaTien DECIMAL(10,2) NULL,
  TongTien DECIMAL(10,2) NULL,
  MaPhieu VARCHAR(20) NOT NULL,
  MaNhanVien VARCHAR(20) NULL,
  GhiChu NVARCHAR(500) NULL,
  NgayTao DATETIME DEFAULT GETDATE(),
  TrangThaiGiaoDich TINYINT DEFAULT 1,
  FOREIGN KEY (MaSP) REFERENCES sanpham(MaSP),
  FOREIGN KEY (MaKho) REFERENCES kho(MaKho),
  FOREIGN KEY (MaCH) REFERENCES cuahang(MaCH),
  FOREIGN KEY (MaNhanVien) REFERENCES nhanvien(MaNV)
);

-- Create indexes for performance
CREATE INDEX idx_lichsu_kho ON lichsukho(MaKho);
CREATE INDEX idx_lichsu_ch ON lichsukho(MaCH);
CREATE INDEX idx_lichsu_sp ON lichsukho(MaSP);
CREATE INDEX idx_lichsu_phieu ON lichsukho(MaPhieu);
CREATE INDEX idx_lichsu_date ON lichsukho(NgayTao);
CREATE INDEX idx_lichsu_loai ON lichsukho(LoaiGiaoDich);
```

### Step 2: Start the Application

```bash
npm run dev
```

### Step 3: Test It

1. Go to: **Admin → Quản lý kho → Lịch sử nhập/xuất/chuyển hàng**
   - Or visit: `http://localhost:3000/admin/quan-ly-kho/lich-su`

2. Create a phiếu nhập/xuất (it will auto-log to history)

3. You should see the history appear automatically! 🎉

---

## 📍 File Locations

| Component | Path |
|-----------|------|
| Service | `src/services/lich-su-kho.service.ts` |
| API | `src/app/api/lich-su-kho/route.ts` |
| Table Component | `src/components/lichsukho/LichSuKhoTable.tsx` |
| Filter Component | `src/components/lichsukho/LichSuKhoFilter.tsx` |
| Stats Component | `src/components/lichsukho/LichSuKhoStats.tsx` |
| Page | `src/app/(admin)/(others-pages)/quan-ly-kho/lich-su/page.tsx` |
| Documentation | `LICH_SU_KHO_GUIDE.md` |

---

## 🔑 Key Features

### Auto-logging
When you create a phiếu, it automatically creates history records. No extra work needed!

### Filtering
- By transaction type (nhập, xuất, chuyển)
- By date range
- By warehouse, product, or slip code

### Statistics
Shows totals for:
- Imported quantity & amount
- Exported quantity & amount
- Transferred quantity & amount

### Status Tracking
- Pending (0)
- Confirmed (1)
- Completed (2)

---

## 🧪 Test Checklist

- [ ] Database table created successfully
- [ ] Can create phiếu nhập without errors
- [ ] Can create phiếu xuất without errors
- [ ] Can create phiếu chuyển without errors
- [ ] History page loads at `/admin/quan-ly-kho/lich-su`
- [ ] Records appear in history after creating phiếu
- [ ] Filters work correctly
- [ ] Statistics show correct totals
- [ ] No console errors (F12)

---

## 💡 How It Works

```
You create a Phiếu Nhập
         ↓
phieu.service.ts saves it to database
         ↓
phieu.service.ts automatically calls taoLichSuNhap()
         ↓
History record created in lichsukho table
         ↓
You can see it in /admin/quan-ly-kho/lich-su
```

---

## 🆘 Troubleshooting

### History not showing?
1. Check if database table exists: `SELECT * FROM lichsukho`
2. Check browser console (F12) for errors
3. Verify Network tab shows API calls to `/api/lich-su-kho`

### Getting SQL errors?
1. Make sure all foreign key tables exist (sanpham, kho, cuahang, nhanvien)
2. Check if MaLS primary key has unique values
3. Review error in SQL Server Management Studio

### Phiếu creation fails?
1. Check imports are correct in phieu.service.ts
2. Look at Network tab for response errors
3. Verify lichSuService is being imported properly

---

## 📚 Full Documentation

For complete API documentation, examples, and advanced features:
👉 **Read**: `LICH_SU_KHO_GUIDE.md`

---

## 🎨 UI Preview

The history page includes:

**Filter Section:**
- Dropdown for transaction type
- Date pickers (from/to)
- Filter & Reset buttons

**Statistics Cards:**
- Blue card: Import totals
- Red card: Export totals
- Green card: Transfer totals

**Data Table:**
- 10 columns showing all details
- Colored badges for status
- Currency formatting in VND

---

## 🚀 You're All Set!

Your inventory history feature is ready to use. The system will automatically:
- Log every transaction
- Track users and dates
- Provide rich filtering and statistics

Enjoy tracking your warehouse movements! 📦

---

**Questions?** Check `LICH_SU_KHO_GUIDE.md` for detailed documentation.
