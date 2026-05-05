# CÔNG VIỆC CÒN LẠI - SHOPMATCHA AUTH & PAYMENT SYSTEM

**Ngày cập nhật:** May 5, 2026  
**Trạng thái:** Đang dở dang - Cần hoàn thành các task còn lại  

---

## 📊 **TÓM TẮT CÔNG VIỆC ĐÃ HOÀN THÀNH (100%)**

### ✅ **Authentication System (Task 1-9, 18, 19)**
1. ✅ Cập nhật Prisma schema (bám sát DB - không thêm field mới)
2. ✅ Tạo auth middleware & JWT utilities
3. ✅ Implement authService (password hashing, validation)
4. ✅ Tạo authController (register/login/logout endpoints)
5. ✅ Tạo authRoutes (định nghĩa API endpoints)
6. ✅ Cấu hình environment variables (.env)
7. ✅ Update frontend login page (gọi API đăng nhập)
8. ✅ Update frontend register page (gọi API đăng kí)
9. ✅ Update AuthContext (thêm login, register, logout functions)
10. ✅ Cài đặt dependencies (bcryptjs, jsonwebtoken, joi, zustand)
11. ✅ Thiết lập rate limiting & CORS cho auth endpoints

### ✅ **Order & Payment System (Task 11-17)**
12. ✅ Xử lý giỏ hàng (Zustand + localStorage - không tạo bảng mới)
13. ✅ Tạo order API (tạo đơn hàng từ frontend cart)
14. ✅ Implement VNPay integration (generate payment URL)
15. ✅ Tạo payment callback handler (VNPay return URL)
16. ✅ Tạo order history endpoints (GET /api/orders)
17. ✅ Build checkout page UI (shipping + payment form)
18. ✅ Build order confirmation page (đã tích hợp API)

---

## ⚠️ **CÔNG VIỆC CÒN LẠI (PRIORITY TASKS)**

### 🔥 **TASK 1: FIX LỖI PRISMA IMPORT (IN-PROGRESS - QUAN TRỌNG NHẤT)**
**Trạng thái:** Đang dở dang  
**Mức độ:** 🔥 Critical (Chặn toàn bộ hệ thống hoạt động)

**Vấn đề:**
- File `authService.ts` và `orderService.ts` gọi `prisma.$transaction` nhưng chưa import đúng cách
- Đã thử sửa nhiều lần nhưng vẫn còn lỗi
- Backend không chạy ổn định (port 5000 bị chiếm, phải chạy port 5001)

**Cần làm:**
1. **Kiểm tra lại toàn bộ file `authService.ts`:**
   - Xóa tất cả các dòng `const prisma = await getPrisma()` dư thừa
   - Đảm bảo chỉ dùng `(await getPrisma())` khi gọi database
   - Kiểm tra các hàm: `registerCustomer()`, `loginUser()`, `generateMaTaiKhoan()`, `generateMaKH()`

2. **Kiểm tra lại toàn bộ file `orderService.ts`:**
   - Tương tự như trên, đảm bảo dùng `(await getPrisma())` nhất quán
   - Kiểm tra hàm `createOrder()`, `getOrderById()`, `getOrdersByCustomer()`

3. **Kiểm tra file `paymentController.ts` và `orderController.ts`:**
   - Đảm bảo không có `require()` động gây lỗi
   - Nên dùng import tĩnh từ `../lib/prisma`

**Cách fix đề xuất:**
```typescript
// Thay vì:
const result = await prisma.donhang.findMany(...);

// Hãy dùng:
const prisma = await getPrisma();
const result = await prisma.donhang.findMany(...);
```

Hoặc tốt nhất là sửa `getPrisma()` để trả về instance trực tiếp thay vì phải await.

---

### 🧹 **TASK 2: DỌN DẸP TERMINAL & KILL PROCESSES**
**Trạng thái:** Đã làm một phần  
**Mức độ:** 🟡 Medium (Cần hoàn thành để test)

**Cần làm:**
1. Kill tất cả process node.exe đang chạy rác:
   ```bash
   taskkill /F /IM node.exe
   ```

2. Kiểm tra port 5000 đã được giải phóng chưa:
   ```bash
   netstat -ano | findstr :5000
   ```

3. Đảm bảo file `.env` đã đặt `PORT=5000` (đã sửa)

---

### 🚀 **TASK 3: CHẠY THỬ BACKEND ỔN ĐỊNH**
**Trạng thái:** Chưa làm  
**Mức độ:** 🟡 Medium (Cần để test API)

**Cần làm:**
1. Chạy backend:
   ```bash
   cd c:\ShopMatcha\shopmatcha-backend
   npm run dev
   ```

2. Kiểm tra output:
   - Phải hiện: `Server is running on port 5000`
   - Không được hiện lỗi `prisma` import
   - Không được chạy port khác (5001, 5002...)

3. Test nhanh bằng curl:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Kỳ vọng: `{"status":"OK","timestamp":"..."}`

---

### 🧪 **TASK 4: TEST AUTH FLOW END-TO-END**
**Trạng thái:** Chưa làm  
**Mức độ:** 🟢 High (Kiểm tra chức năng)

**Cần làm:**
1. **Test Register API:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!","confirmPassword":"Test123!","fullName":"Nguyễn Văn Test","phone":"0901234567"}'
   ```
   - Kỳ vọng: Trả về `success:true` + `accessToken` + `refreshToken`

2. **Test Login API:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!"}'
   ```
   - Kỳ vọng: Trả về `success:true` + `accessToken` + `refreshToken`

3. **Test Protected Route (với JWT token):**
   ```bash
   curl http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer <accessToken_từ_login>"
   ```
   - Kỳ vọng: Trả về thông tin user

4. **Test Frontend:**
   - Mở `http://localhost:3000/auth/register` → Đăng kí → Đăng nhập
   - Kiểm tra localStorage có lưu token không
   - Thử truy cập trang cần đăng nhập (checkout)

---

### 🛒 **TASK 5: TEST TOÀN BỘ FLOW (REGISTER → CART → CHECKOUT → PAYMENT)**
**Trạng thái:** Chưa làm  
**Mức độ:** 🟢 High (Kiểm tra toàn bộ hệ thống)

**Cần làm:**
1. **Flow 1: Khách hàng chưa đăng nhập**
   - Thêm sản phẩm vào giỏ hàng (localStorage)
   - Tiến hành checkout → Chuyển hướng đến login
   - Đăng nhập → Quay lại checkout
   - Chọn phương thức thanh toán (COD/BankTransfer/VNPay)
   - Hoàn tất đơn hàng

2. **Flow 2: Khách hàng đã đăng nhập**
   - Đăng nhập trước
   - Thêm sản phẩm vào giỏ → Giỏ hàng lưu theo user
   - Checkout → Tạo đơn hàng (`donhang` + `chitietdonhang`)
   - Thanh toán VNPay → Callback → Cập nhật trạng thái

3. **Kiểm tra Database:**
   - Bảng `donhang` có đơn hàng mới không?
   - Bảng `chitietdonhang` có chi tiết không?
   - Bảng `payments` có bản ghi không?
   - Bảng `tonkhocuahang` đã trừ tồn kho chưa?

---

### 🔒 **TASK 6: REVIEW & FIX SECURITY ISSUES**
**Trạng thái:** Chưa làm  
**Mức độ:** 🔥 Critical (Bảo mật hệ thống)

**Cần làm:**
1. **Password Hashing:**
   - Kiểm tra bcrypt có hoạt động đúng không?
   - Đảm bảo password được hash trước khi lưu DB
   - Test: Đăng nhập với password đúng/sai

2. **JWT Security:**
   - Kiểm tra token có hết hạn đúng 15 phút không?
   - Refresh token có hoạt động không?
   - Kiểm tra middleware `authenticateToken` có chặn request không token không?

3. **VNPay Signature:**
   - Kiểm tra hàm `verifyVNPayReturn()` có xác thực chữ ký đúng không?
   - Test với callback giả lập để kiểm tra

4. **Rate Limiting:**
   - Test: Gọi API login 6 lần liên tiếp → Phải bị chặn (chỉ cho 5 requests/15 phút)

---

### 📝 **TASK 7: VIẾT DOCUMENTATION CHO API ENDPOINTS**
**Trạng thái:** Chưa làm  
**Mức độ:** 🟢 Medium (Dễ bảo trì)

**Cần làm:**
1. Tạo file `API_DOCUMENTATION.md` với các endpoints:
   - `POST /api/auth/register` - Đăng kí
   - `POST /api/auth/login` - Đăng nhập
   - `POST /api/auth/logout` - Đăng xuất
   - `GET /api/auth/me` - Lấy thông tin user
   - `POST /api/auth/refresh` - Làm mới token
   - `POST /api/orders` - Tạo đơn hàng
   - `GET /api/orders/:id` - Chi tiết đơn hàng
   - `GET /api/orders` - Lịch sử đơn hàng
   - `POST /api/payments/checkout` - Khởi tạo thanh toán
   - `GET /api/payments/callback` - VNPay callback

2. Mỗi endpoint cần có:
   - Mô tả
   - Request body/params
   - Response mẫu
   - Status codes
   - Authentication required?

---

## 📋 **PRIORITY ORDER (THỨ TỰ LÀM)**

| Thứ tự | Task | Lý do |
|--------|------|-------|
| 1 | **Fix lỗi prisma import** | Chặn backend chạy, ưu tiên cao nhất |
| 2 | Dọn dẹp terminal & kill processes | Đảm bảo port 5000 sẵn sàng |
| 3 | Chạy thử backend ổn định | Kiểm tra sau khi fix prisma |
| 4 | Test Auth Flow (Register/Login) | Kiểm tra chức năng cơ bản |
| 5 | Test toàn bộ flow (Cart → Checkout → Payment) | Kiểm tra tích hợp |
| 6 | Review Security Issues | Đảm bảo bảo mật |
| 7 | Viết Documentation | Dễ bảo trì sau này |

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

1. **Bám sát cơ sở dữ liệu:**
   - Không thêm field mới vào DB
   - Chỉ dùng các bảng có trong file `web_matcha_5.5.26.sql`
   - Các models: `taikhoan`, `khachhang`, `donhang`, `chitietdonhang`, `payments`, `tonkhocuahang`

2. **Tiếng Việt:**
   - Đảm bảo thông báo lỗi bằng tiếng Việt đúng chính tả
   - Ví dụ: "Đăng nhập thành công", "Mật khẩu không đúng"

3. **Error Handling:**
   - Luôn try-catch trong controllers
   - Log lỗi bằng `console.error()`
   - Trả về response JSON nhất quán: `{ success: boolean, message: string, data?: any }`

---

## 📞 **CONTACT & SUPPORT**

Nếu gặp khó khăn, hãy:
1. Kiểm tra log trong terminal chạy backend
2. Xem file `.env` đã cấu hình đúng chưa
3. Đảm bảo MySQL đang chạy và database `web_matcha` tồn tại
4. Kiểm tra Prisma schema đã khớp với DB chưa (chạy `npx prisma validate`)

---

**File này sẽ được cập nhật liên tục khi hoàn thành các task.** 🚀
