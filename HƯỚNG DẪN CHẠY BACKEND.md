# 🍵 HƯỚNG DẪN KHỞI CHẠY ỨNG DỤNG SHOP MATCHA

## 📋 Tổng Quan Dự Án

- **Frontend**: Next.js + React + Vite (cổng: 5173)
- **Backend**: Express.js + TypeScript (cổng: 5000)
- **Database**: MySQL (web_matcha)

---

## ✅ Bước 0: Chuẩn Bị

### Kiểm tra yêu cầu hệ thống

```bash
node --version    # Node.js v18+
npm --version     # npm v9+
mysql --version   # MySQL 8.0+
```

### Cài đặt dependencies

**Cài frontend:**
```bash
cd c:\ShopMatcha
npm install
```

**Cài backend:**
```bash
cd c:\ShopMatcha\shopmatcha-backend
npm install
```

---

## 🚀 Cách 1: Chạy Backend & Frontend Cùng Một Lúc (Đơn Giản)

### Bước 1: Mở Terminal 1 (Backend)

```bash
cd c:\ShopMatcha\shopmatcha-backend
npm run dev
```

**Kết quả:**
```
Server is running on port 5000
```

### Bước 2: Mở Terminal 2 (Frontend)

```bash
cd c:\ShopMatcha
npm run dev
```

**Kết quả:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Bước 3: Truy Cập Ứng Dụng

Mở trình duyệt và vào: **http://localhost:5173**

---

## 🎯 Cách 2: Sử Dụng Concurrently (Chạy Cùng Một Terminal)

### Cài đặt Concurrently

```bash
cd c:\ShopMatcha
npm install --save-dev concurrently
```

### Thêm Script vào `package.json`

Mở file `c:\ShopMatcha\package.json` và thêm vào phần `scripts`:

```json
"scripts": {
  "dev": "vite",
  "dev:full": "concurrently \"cd shopmatcha-backend && npm run dev\" \"npm run dev\"",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Chạy cả hai cùng lúc

```bash
cd c:\ShopMatcha
npm run dev:full
```

---

## 🔧 Cách 3: Sử Dụng Batch Script (Windows)

Tạo file `c:\ShopMatcha\start-dev.bat`:

```batch
@echo off
echo Starting Shop Matcha Development Environment...
echo.

start cmd /k "cd /d c:\ShopMatcha\shopmatcha-backend && npm run dev"
echo [✓] Backend started on http://localhost:5000

timeout /t 3 /nobreak
echo.

start cmd /k "cd /d c:\ShopMatcha && npm run dev"
echo [✓] Frontend started on http://localhost:5173

echo.
echo [✓] Open browser: http://localhost:5173
pause
```

**Chạy:**
```bash
c:\ShopMatcha\start-dev.bat
```

---

## 📁 Cấu Hình Các Biến Môi Trường

### Frontend (c:\ShopMatcha\.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_API_URL=http://localhost:5000/api
CORS_ORIGIN=http://localhost:5173
```

### Backend (c:\ShopMatcha\shopmatcha-backend\.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://root:@localhost:3306/web_matcha
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
LOG_LEVEL=debug
```

---

## 🔌 API Endpoints Chính

### Danh sách sản phẩm
```
GET http://localhost:5000/api/products
```

### Chi tiết sản phẩm
```
GET http://localhost:5000/api/products/:id
```

### Sản phẩm liên quan
```
GET http://localhost:5000/api/products/:id/related
```

### Danh mục
```
GET http://localhost:5000/api/categories
```

### Tìm kiếm
```
GET http://localhost:5000/api/search?query=matcha
```

### Khuyến mãi
```
GET http://localhost:5000/api/promotions
```

### Health Check
```
GET http://localhost:5000/api/health
GET http://localhost:5000/health
```

---

## 🗄️ Cài đặt Database

### Nếu chưa có database

1. **Tạo database:**
```sql
CREATE DATABASE web_matcha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Chạy migration:**
```bash
cd c:\ShopMatcha\shopmatcha-backend
npx prisma db push
```

3. **Seed dữ liệu (nếu có):**
```bash
npx prisma db seed
```

---

## 📊 Quy Trình Khởi Chạy Tóm Tắt

```
┌─────────────────────────────────────────┐
│   Khởi chạy Ứng dụng Shop Matcha       │
└─────────────────────────────────────────┘
           ↓
   ┌───────────────────┐
   │ Cài Dependencies  │
   │ npm install       │
   └───────────────────┘
           ↓
   ┌──────────────────────┐
   │ Terminal 1: Backend  │──→ http://localhost:5000
   │ npm run dev          │
   └──────────────────────┘
           ↓
   ┌──────────────────────┐
   │ Terminal 2: Frontend │──→ http://localhost:5173
   │ npm run dev          │
   └──────────────────────┘
           ↓
   ┌─────────────────────────┐
   │ Mở: http://localhost:5173 │
   └─────────────────────────┘
```

---

## 🛠️ Troubleshooting

### Port 5000 đã sử dụng

Tìm process sử dụng port 5000:
```bash
netstat -ano | findstr :5000
```

Đóng process (thay `PID` bằng process ID):
```bash
taskkill /PID [PID] /F
```

Hoặc thay đổi port trong `.env`:
```env
PORT=5001
```

### Port 5173 đã sử dụng

Vite sẽ tự động chuyển sang port khác (5174, 5175...).

### MySQL không kết nối

Kiểm tra MySQL service:
```bash
mysql -u root -p
```

Hoặc chạy MySQL Server nếu dùng Docker:
```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 mysql:8
```

### CORS errors

Kiểm tra `CORS_ORIGIN` trong `shopmatcha-backend/.env` khớp với frontend URL.

---

## 📦 Build & Deployment

### Build Frontend
```bash
cd c:\ShopMatcha
npm run build
```

### Build Backend
```bash
cd c:\ShopMatcha\shopmatcha-backend
npm run build
```

### Chạy Production

**Backend:**
```bash
cd c:\ShopMatcha\shopmatcha-backend
npm run start
```

**Frontend (Preview):**
```bash
cd c:\ShopMatcha
npm run preview
```

---

## 📝 Ghi Chú

- **Frontend Port**: 5173 (Vite dev server)
- **Backend Port**: 5000 (Express server)
- **Database**: MySQL tại `localhost:3306`
- **Hot Reload**: Cả Frontend và Backend đều hỗ trợ hot reload
- **CORS**: Đã cấu hình để cho phép cross-origin requests

---

## 🎉 Bạn Đã Sẵn Sàng!

Bây giờ hãy:
1. ✅ Mở Terminal 1 và chạy backend
2. ✅ Mở Terminal 2 và chạy frontend  
3. ✅ Truy cập http://localhost:5173
4. ✅ Thưởng thức ứng dụng!

---

**Tạo lúc**: 5 tháng 5, 2026  
**Phiên bản**: 1.0.0
