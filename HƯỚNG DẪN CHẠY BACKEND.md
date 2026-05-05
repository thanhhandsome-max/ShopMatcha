# 🍵 HƯỚNG DẪN KHỞI CHẠY ỨNG DỤNG SHOP MATCHA

## 📋 Tổng Quan Dự Án

- **Frontend**: Next.js 15 (cổng: 3000)
- **Backend**: Express.js + TypeScript (cổng: 5000)
- **Database**: MySQL (matcha_shop)
- **⚠️ Lưu ý**: Cần bật XAMPP (MySQL) trước khi chạy backend!

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

### Bước 1: Khởi động MySQL qua XAMPP ⚠️

1. Mở **XAMPP Control Panel**
2. Nhấn nút **Start** bên cạnh **MySQL**
3. Đợi MySQL chuyển sang màu xanh (Running)
4. Kiểm tra MySQL chạy trên port **3306**

### Bước 2: Mở Terminal 1 (Backend)

```bash
cd c:\ShopMatcha\shopmatcha-backend
npm run dev
```

**Kết quả:**
```
Server is running on port 5000
```

### Bước 3: Mở Terminal 2 (Frontend)

```bash
cd c:\ShopMatcha
npm run dev
```

**Kết quả:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in xxxms
```

### Bước 4: Truy Cập Ứng Dụng

Mở trình duyệt và vào: **http://localhost:3000**

---------------

## 📁 Cấu Hình Các Biến Môi Trường

### Frontend (c:\ShopMatcha\.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (c:\ShopMatcha\shopmatcha-backend\.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://root:@localhost:3306/matcha_shop
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

**⚠️ Lưu ý XAMPP:**
- Đảm bảo MySQL đang chạy trên port 3306 trong XAMPP
- Database name: `matcha_shop` (không phải `web_matcha`)
- Username: `root`, Password: (để trống)

---

## 🔌 API Endpoints Chính

### Danh sách sản phẩm
```
GET http://localhost:5000/api/products
hoặc qua Next.js proxy: http://localhost:3000/api/products
```

### Chi tiết sản phẩm
```
GET http://localhost:5000/api/products/:id
hoặc qua Next.js proxy: http://localhost:3000/api/products/:id
```

### Danh mục
```
GET http://localhost:5000/api/categories
```

### Tìm kiếm
```
GET http://localhost:5000/api/search?query=matcha
```

### Health Check
```
GET http://localhost:5000/api/health
GET http://localhost:5000/health
```

**💡 Lưu ý**: Frontend (Next.js) sẽ tự động proxy các request `/api/*` đến backend port 5000

---

## 🗄️ Cài đặt Database (Sử dụng XAMPP MySQL)

### ⚠️ Bước quan trọng: Bật XAMPP trước!

1. Mở **XAMPP Control Panel**
2. Nhấn **Start** bên cạnh **MySQL**
3. Kiểm tra MySQL đang chạy trên port **3306**

### Tạo database

1. **Mở phpMyAdmin**: http://localhost/phpmyadmin
2. Import file database SQL

3. **Chạy migration:**
```bash
cd c:\ShopMatcha\shopmatcha-backend
npx prisma db push
```

4. **Kiểm tra kết nối:**
```bash
mysql -u root -p
# Nhập password (để trống nếu chưa đặt)
SHOW DATABASES;
```

---

## 📊 Quy Trình Khởi Chạy Tóm Tắt

```
┌─────────────────────────────────────────┐
│   Khởi chạy Ứng dụng Shop Matcha       │
└─────────────────────────────────────────┘
           ↓
   ┌──────────────────────────┐
   │ 1. Bật XAMPP MySQL      │
   │   (Port 3306)           │
   └──────────────────────────┘
           ↓
   ┌───────────────────┐
   │ 2. Cài Dependencies│
   │ npm install       │
   └───────────────────┘
           ↓
   ┌──────────────────────────┐
   │ Terminal 1: Backend       │──→ http://localhost:5000
   │ cd shopmatcha-backend     │
   │ npm run dev               │
   └──────────────────────────┘
           ↓
   ┌──────────────────────────┐
   │ Terminal 2: Frontend      │──→ http://localhost:3000
   │ npm run dev               │
   └──────────────────────────┘
           ↓
   ┌─────────────────────────────┐
   │ 3. Mở trình duyệt:          │
   │    http://localhost:3000     │
   └─────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### ⚠️ Lỗi thường gặp với XAMPP

**MySQL không khởi động được:**
1. Mở XAMPP Control Panel
2. Nhấn **Config** bên cạnh MySQL
3. Kiểm tra port là **3306**
4. Nếu port 3306 bị chiếm, đổi sang port khác và cập nhật trong `.env`

**Không kết nối được database:**
```bash
# Kiểm tra MySQL có đang chạy không
netstat -ano | findstr :3306

# Thử kết nối manual
mysql -u root -p
# Password: (để trống)
```

### Port 5000 đã sử dụng

Tìm process sử dụng port 5000:
```bash
netstat -ano | findstr :5000
```

Đóng process (thay `PID` bằng process ID):
```bash
taskkill /PID [PID] /F
```

Hoặc thay đổi port trong `shopmatcha-backend/.env`:
```env
PORT=5001
```

### Port 3000 đã sử dụng (Next.js)

Next.js sẽ tự động chuyển sang port khác (3001, 3002...).

### CORS errors

Kiểm tra `CORS_ORIGIN` trong `shopmatcha-backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

### Backend không kết nối được

1. Kiểm tra backend có đang chạy không: http://localhost:5000/api/health
2. Kiểm tra MySQL đã bật trong XAMPP chưa
3. Xem log lỗi trong terminal backend

---

## 📦 Build & Deployment

### Build Frontend (Next.js)
```bash
cd c:\ShopMatcha
npm run build
# Output: .next/ folder
```

### Build Backend
```bash
cd c:\ShopMatcha\shopmatcha-backend
npm run build
# Output: dist/ folder
```

### Chạy Production

**Backend:**
```bash
cd c:\ShopMatcha\shopmatcha-backend
npm run start
# Chạy trên port 5000
```

**Frontend (Next.js Production):**
```bash
cd c:\ShopMatcha
npm start
# Chạy trên port 3000
```

**⚠️ Lưu ý**: Production vẫn cần XAMPP MySQL đang chạy!

---

## 📝 Ghi Chú Quan Trọng

- **Frontend Port**: 3000 (Next.js dev server)
- **Backend Port**: 5000 (Express server)
- **Database**: MySQL tại `localhost:3306` (Quản lý qua XAMPP)
- **Hot Reload**: Cả Frontend và Backend đều hỗ trợ hot reload
- **CORS**: Đã cấu hình `CORS_ORIGIN=http://localhost:3000`
- **⚠️ Bắt buộc**: Phải bật XAMPP MySQL trước khi chạy backend!

---

## 🎉 Bạn Đã Sẵn Sàng!

Bây giờ hãy:
1. ✅ Mở **XAMPP Control Panel** và bật **MySQL**
2. ✅ Mở Terminal 1 và chạy backend (port 5000)
3. ✅ Mở Terminal 2 và chạy frontend (port 3000)  
4. ✅ Truy cập **http://localhost:3000**
5. ✅ Thưởng thức ứng dụng! 🍵

---

**Cập nhật**: 5 tháng 5, 2026  
**Phiên bản**: 2.0.0 (Đã cập nhật port Next.js)
