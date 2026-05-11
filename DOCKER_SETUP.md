# Hướng dẫn cài Docker Desktop cho Windows

## Tại sao cần Docker?
- Chạy SQL Server database trong container
- Không cần cài SQL Server local
- Dễ quản lý và cleanup

## Bước cài đặt:

### 1. Tải Docker Desktop
- Truy cập: https://www.docker.com/products/docker-desktop
- Chọn phiên bản Windows
- Download file .exe

### 2. Cài đặt
- Chạy file .exe đã tải
- Follow hướng dẫn cài đặt
- Restart máy tính sau khi cài xong

### 3. Khởi động Docker Desktop
- Mở Docker Desktop từ Start Menu
- Chờ cho nó khởi động hoàn toàn (có thể mất vài phút)
- Icon cá heo sẽ xuất hiện ở system tray

### 4. Test Docker
Mở Command Prompt hoặc PowerShell và chạy:
```bash
docker --version
docker run hello-world
```

Nếu thấy "Hello from Docker!" thì thành công!

### 5. Chạy SQL Server
Sau khi Docker hoạt động:
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Thanh@123" -p 1433:1433 --name sqlserver --hostname sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

### 6. Setup database
```bash
npm run setup-db
```

## Lưu ý quan trọng:
- Docker Desktop cần Windows 10/11 Pro hoặc Education
- Nếu dùng Windows Home, cần WSL2
- Đảm bảo Virtualization được enable trong BIOS
- Restart máy tính sau khi cài

## Nếu gặp lỗi:
- Kiểm tra Windows version
- Enable Virtualization trong BIOS
- Cài WSL2 nếu cần: `wsl --install`

## Alternative: Chạy không cần database
App hiện tại có thể chạy với mock data:
```bash
npm run dev
```
Truy cập: http://localhost:3000