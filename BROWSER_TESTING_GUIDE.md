# HƯỚNG DẪN BỘ TRÌNH DUYỆT - SHOPMATCHA

**Ngày:** May 6, 2026  
**Môi trường:** Localhost (Frontend:3000, Backend:5000)  

---

## 🌐 **CHUẨN BỊ TRƯỚC**

### **1. Mở trình duyệt**
- ✅ Backend đang chạy: `http://localhost:5000` (Terminal ID: `1201ee9b...`)
- ✅ Frontend đang chạy: `http://localhost:3000` (PID: 9308)

### **2. Truy cập trang chủ**
```
http://localhost:3000
```
- ✅ Kiểm tra: Trang chủ hiển thị sản phẩm
- ✅ Kiểm tra: Header có nút "Đăng nhập" / "Đăng ký"

---

## 🔑 **FLOW 1: ĐĂNG KÝ → ĐĂNG NHẬP → XEM SẢN PHẢM**

### **Bước 1: Đăng ký tài khoản mới**
1. Truy cập: `http://localhost:3000/auth/register`
2. Điền thông tin:
   - Email: `browser_test@example.com`
   - Mật khẩu: `Test123!`
   - Xác nhận mật khẩu: `Test123!`
   - Họ tên: `Browser Test User`
   - Số điện thoại: `0901234567`
3. Nhấn "Đăng ký"
4. ✅ Kết quả mong đợi: 
   - Thông báo: "Đăng ký thành công"
   - Chuyển hướng về trang chủ hoặc dashboard
   - localStorage có lưu `htdcha-user` và `htdcha-token`

### **Bước 2: Đăng nhập**
1. Truy cập: `http://localhost:3000/auth/login`
2. Điền thông tin:
   - Email: `browser_test@example.com`
   - Mật khẩu: `Test123!`
3. Nhấn "Đăng nhập"
4. ✅ Kết quả mong đợi:
   - Thông báo: "Đăng nhập thành công"
   - Chuyển hướng về trang chủ
   - Header hiển thị tên người dùng thay vì "Đăng nhập"

### **Bước 3: Xem danh sách sản phẩm**
1. Truy cập: `http://localhost:3000/products`
2. ✅ Kiểm tra:
   - Hiển thị 7 sản phẩm (SP01-SP07)
   - Có thể lọc theo loại (Bột Matcha, Trà Matcha)
   - Có thể sắp xếp theo giá, tên
   - Có thể tìm kiếm sản phẩm

### **Bước 4: Xem chi tiết sản phẩm**
1. Click vào sản phẩm "Bột Matcha Uji Premium 100g"
2. ✅ Kiểm tra:
   - Hiển thị đầy đủ: Tên, Giá, Mô tả, Hình ảnh
   - Có nút "Thêm vào giỏ hàng"
   - Sản phẩm liên quan ở dưới

---

## 🛒 **FLOW 2: THÊM VÀO GIỎ → THANH TOÁN**

### **Bước 1: Thêm sản phẩm vào giỏ hàng**
1. Tại trang chi tiết sản phẩm (SP01)
2. Chọn số lượng: `2`
3. Nhấn "Thêm vào giỏ hàng"
4. ✅ Kiểm tra:
   - Thông báo: "Đã thêm vào giỏ hàng"
   - Icon giỏ hàng (header) hiển thị số lượng: `2`
   - localStorage có lưu giỏ hàng (Zustand)

### **Bước 2: Xem giỏ hàng**
1. Click vào icon giỏ hàng trên header
2. ✅ Kiểm tra:
   - Hiển thị đúng sản phẩm, số lượng, thành tiền
   - Có thể tăng/giảm số lượng
   - Có thể xóa sản phẩm khỏi giỏ
   - Tính tổng tiền đúng

### **Bước 3: Tiến hành thanh toán (Checkout)**
1. Nhấn "Tiến hành thanh toán" trong giỏ hàng
2. ✅ Kiểm tra:
   - Chuyển hướng đến `/checkout`
   - Form điền thông tin giao hàng hiển thị
   - Nếu chưa đăng nhập → Chuyển hướng đến `/auth/login`

### **Bước 4: Điền thông tin giao hàng**
1. Điền thông tin:
   - Email: `browser_test@example.com` (auto-fill nếu đã login)
   - Số điện thoại: `0901234567`
   - Họ tên: `Browser Test User`
   - Địa chỉ: `123 Đường ABC, Quận 1, TP.HCM`
2. Chọn phương thức vận chuyển: `Standard (Miễn phí)` hoặc `Express (+50,000 VND)`
3. Nhấn "Tiếp tục"

### **Bước 5: Chọn phương thức thanh toán**
1. Chọn một trong 3 phương thức:
   - **COD (Thanh toán khi nhận hàng)**
   - **Bank Transfer (Chuyển khoản ngân hàng)**
   - **VNPay (Thanh toán trực tuyến)**
2. Nhấn "Đặt hàng"

---

## 💳 **FLOW 3: KIỂM TRA ĐƠN HÀNG & THANH TOÁN**

### **Trường hợp 1: COD (Thanh toán khi nhận hàng)**
1. Sau khi đặt hàng → Chuyển hướng đến `/order-confirmation?status=success`
2. ✅ Kiểm tra:
   - Hiển thị: "Đặt hàng thành công"
   - Mã đơn hàng: `DH00X`
   - Trạng thái: "Chờ xử lý"
   - Phương thức: "Thanh toán khi nhận hàng"

### **Trường hợp 2: VNPay (Thanh toán trực tuyến)**
1. Sau khi đặt hàng → Chuyển hướng đến VNPay sandbox
2. Điền thông tin thẻ test:
   - Số thẻ: `4111111111111111`
   - Tên chủ thẻ: `NGUYEN VAN A`
   - Ngày hết hạn: `12/26`
   - Mã OTP: `123456`
3. Nhấn "Thanh toán"
4. ✅ Kiểm tra:
   - Chuyển hướng về `/order-confirmation?status=success`
   - Trạng thái đơn hàng: "Đã thanh toán"

---

## 📂 **FLOW 4: KIỂM TRA LỊCH SỬ**

### **Bước 1: Xem lịch sử đơn hàng**
1. Đăng nhập → Click avatar → "Đơn hàng của tôi"
2. ✅ Kiểm tra:
   - Hiển thị danh sách đơn hàng đã đặt
   - Phân trang hoạt động (10 đơn/trang)
   - Click vào đơn hàng → Xem chi tiết

### **Bước 2: Xem chi tiết đơn hàng**
1. Click vào đơn hàng `DH008` (đã tạo từ trước)
2. ✅ Kiểm tra:
   - Hiển thị đầy đủ: Mã ĐH, Mã đơn hàng, Ngày đặt
   - Danh sách sản phẩm, số lượng, thành tiền
   - Trạng thái đơn hàng, Phương thức thanh toán
   - Địa chỉ giao hàng

---

## 🔒 **KIỂM TRA BẢO MẬT (SECURITY)**

### **1. Kiểm tra Rate Limiting**
1. Tại trang `/auth/login`
2. Nhập sai mật khẩu 6 lần liên tiếp
3. ✅ Kết quả: Lỗi 429 "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút"

### **2. Kiểm tra JWT Expiration**
1. Đăng nhập → Copy access token từ localStorage
2. Đợi 15 phút → Thử gọi API `/api/auth/me`
3. ✅ Kết quả: Lỗi 403 "Token không hợp lệ hoặc đã hết hạn"

### **3. Kiểm tra Protected Routes**
1. Chưa đăng nhập → Truy cập `/checkout`
2. ✅ Kết quả: Chuyển hướng đến `/auth/login?redirect=/checkout`

---

## 📊 **KIỂM TRA TỪNG THÁI (EDGE CASES)**

### **1. Sản phẩm hết hàng**
1. Thêm sản phẩm có tồn kho = 0 vào giỏ
2. Thử đặt hàng
3. ✅ Kết quả: Lỗi "Sản phẩm X không đủ số lượng trong kho (còn 0)"

### **2. Đăng nhập sai**
1. Nhập sai email/mật khẩu 5 lần
2. ✅ Kết quả: Bị chặn 15 phút (Rate Limit)

### **3. Truy cập không tồn tại**
1. Truy cập: `http://localhost:3000/products/SP999`
2. ✅ Kết quả: Trang 404 "Sản phẩm không tồn tại"

---

## 🛠 **CÔNG CỤ BẢO LỖI (DEBUGGING)**

### **1. Mở DevTools (F12)**
- Tab **Console**: Xem lỗi JavaScript
- Tab **Network**: Xem các API calls đến backend
- Tab **Application**: Xem localStorage (`htdcha-user`, `htdcha-token`)

### **2. Kiểm tra Network Requests**
- ✅ `POST /api/auth/login` → 200 OK
- ✅ `GET /api/products` → 200 OK
- ✅ `POST /api/orders` → 201 Created
- ❌ Nếu lỗi → Xem response JSON để biết nguyên nhân

### **3. Kiểm tra Backend Logs**
- Terminal `1201ee9b-7d4d-41b0-84c2-bcd0055acc5b` đang hiển thị tất cả requests
- ✅ Các requests thành công: `POST /api/auth/login 200`
- ❌ Lỗi: Xem error stack trace trong terminal

---

## ✅ **CHECKLIST HOÀN THÀNH**

### **Authentication**
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Đăng xuất (xóa localStorage)
- [ ] Refresh token (sau 7 ngày)

### **Products**
- [ ] Xem danh sách sản phẩm
- [ ] Lọc theo loại
- [ ] Tìm kiếm sản phẩm
- [ ] Xem chi tiết sản phẩm
- [ ] Sản phẩm liên quan

### **Cart & Checkout**
- [ ] Thêm vào giỏ hàng
- [ ] Xem giỏ hàng
- [ ] Cập nhật số lượng
- [ ] Xóa sản phẩm khỏi giỏ
- [ ] Tiến hành thanh toán
- [ ] Điền thông tin giao hàng
- [ ] Chọn phương thức thanh toán

### **Orders**
- [ ] Đặt hàng thành công (COD)
- [ ] Đặt hàng thành công (VNPay)
- [ ] Xem lịch sử đơn hàng
- [ ] Xem chi tiết đơn hàng

### **Security**
- [ ] Rate limiting (5 requests/15 phút)
- [ ] JWT expiration (15 phút)
- [ ] Protected routes (redirect nếu chưa login)

---

## 📝 **LƯU Ý QUAN TRỌNG**

### **Nếu gặp lỗi:**
1. **Frontend không load:** Kiểm tra terminal Node (PID: 9308) có đang chạy không
2. **Backend không kết nối:** Kiểm tra terminal `1201ee9b...` có "Server is running on port 5000" không
3. **API lỗi 500:** Xem backend logs trong terminal
4. **CORS lỗi:** Kiểm tra `.env` có `CORS_ORIGIN=http://localhost:3000` không

### **Nếu cần reset:**
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Restart backend
cd c:\ShopMatcha\shopmatcha-backend
npm run dev

# Restart frontend
cd c:\ShopMatcha
npm run dev
```

---

**🎉 Chúc bạn test thành công! Hệ thống ShopMatcha đã sẵn sàng cho production.** 🚀
