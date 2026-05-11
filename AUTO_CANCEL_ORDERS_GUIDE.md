# 🚫 Auto Cancel Orders - Tự Động Hủy Đơn Hàng

## 🎯 Chức Năng

Tự động hủy các đơn hàng đang ở trạng thái **"Chờ thanh toán"** sau **10 phút** nếu khách hàng chưa thanh toán.

---

## ⚙️ Cách Hoạt Động

```
1. 🔍 Kiểm tra mỗi phút
2. 📅 Tìm đơn hàng trạng thái = 1 (chờ thanh toán)
3. ⏰ So sánh thời gian tạo với thời gian hiện tại
4. ❌ Tự động hủy nếu quá 10 phút
5. 📝 Ghi log chi tiết
```

---

## 🚀 Cách Chạy

### Phương Pháp 1: Chạy Script Riêng (Khuyến Nghị)

```bash
# Development
npm run auto-cancel

# Production (dùng PM2)
pm2 start scripts/auto-cancel-orders.js --name "auto-cancel-orders"
```

### Phương Pháp 2: Chạy Thủ Công

```bash
# Test một lần
node scripts/auto-cancel-orders.js

# Hoặc gọi API trực tiếp
curl -X POST http://localhost:3000/api/don-hang/auto-cancel
```

---

## 📊 API Endpoint

### POST `/api/don-hang/auto-cancel`

**Response:**
```json
{
  "ok": true,
  "message": "Đã tự động hủy 2 đơn hàng quá hạn",
  "cancelledCount": 2,
  "cancelledOrders": [
    {
      "maHD": "HD001",
      "ngayTao": "2024-01-15T10:00:00.000Z",
      "thoiGianCho": 12
    }
  ]
}
```

---

## 🔧 Cấu Hình

### Thời Gian Chờ (10 phút)
```sql
-- Trong API route, có thể thay đổi từ 10 phút thành thời gian khác
AND NgayTao < DATEADD(MINUTE, -10, GETDATE())
```

### Trạng Thái Đơn Hàng
- `1` = Chờ thanh toán (sẽ bị hủy nếu quá hạn)
- `2` = Đang giao
- `3` = Hoàn thành
- `4` = Đã hủy

---

## 📝 Logs

Script sẽ ghi log chi tiết:

```
[2024-01-15T10:15:00.000Z] 🔍 Đang kiểm tra đơn hàng quá hạn...
[2024-01-15T10:15:00.000Z] ✅ Đã hủy 1 đơn hàng quá hạn
   - HD001: chờ 12 phút
[2024-01-15T10:16:00.000Z] ℹ️  Không có đơn hàng nào cần hủy
```

---

## 🛠️ Troubleshooting

### Lỗi Kết Nối Database
```bash
# Kiểm tra biến môi trường
echo $DB_USER
echo $DB_PASSWORD
echo $DB_SERVER
```

### Script Không Chạy
```bash
# Cài đặt dependencies
npm install

# Test script
node scripts/auto-cancel-orders.js
```

### Đơn Hàng Không Bị Hủy
- Kiểm tra trạng thái đơn hàng trong database
- Đảm bảo `TrangThai = 1`
- Kiểm tra thời gian `NgayTao`

---

## 🔄 Tích Hợp Với Production

### Sử dụng PM2 (Khuyến nghị)
```bash
# Cài đặt PM2
npm install -g pm2

# Chạy service
pm2 start scripts/auto-cancel-orders.js --name "auto-cancel-orders"

# Lưu cấu hình
pm2 save
pm2 startup
```

### Sử dụng Systemd (Linux)
```bash
# Tạo file service
sudo nano /etc/systemd/system/auto-cancel-orders.service

# Nội dung file:
[Unit]
Description=Auto Cancel Orders Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/node scripts/auto-cancel-orders.js
Restart=always

[Install]
WantedBy=multi-user.target

# Khởi động service
sudo systemctl enable auto-cancel-orders
sudo systemctl start auto-cancel-orders
```

---

## 📈 Monitoring

### Xem Logs PM2
```bash
pm2 logs auto-cancel-orders
```

### Restart Service
```bash
pm2 restart auto-cancel-orders
```

### Stop Service
```bash
pm2 stop auto-cancel-orders
```