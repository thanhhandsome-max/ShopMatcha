-- CreateTable
CREATE TABLE `chitietdonhang` (
    `MaSP` VARCHAR(10) NOT NULL,
    `MaDH` VARCHAR(10) NOT NULL,
    `SoLuong` INTEGER NULL,
    `TongTien` DECIMAL(15, 2) NULL,

    INDEX `MaDH`(`MaDH`),
    PRIMARY KEY (`MaSP`, `MaDH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitietphieuchuyenhang` (
    `MaPC` VARCHAR(20) NOT NULL,
    `MaSp` VARCHAR(20) NOT NULL,
    `SoLuong` INTEGER NOT NULL DEFAULT 0,
    `TongTien` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaPC`, `MaSp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitietphieunhanhang` (
    `MaPNH` VARCHAR(20) NOT NULL,
    `MaSp` VARCHAR(20) NOT NULL,
    `SoLuong` INTEGER NOT NULL DEFAULT 0,
    `TongTien` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaPNH`, `MaSp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitietphieunhap` (
    `MaPN` VARCHAR(20) NOT NULL,
    `MaSP` VARCHAR(20) NOT NULL,
    `SoLuong` INTEGER NOT NULL DEFAULT 0,
    `TongTien` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaPN`, `MaSP`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitietphieuxuat` (
    `MaPX` VARCHAR(20) NOT NULL,
    `MaSP` VARCHAR(20) NOT NULL,
    `SoLuong` INTEGER NULL,

    PRIMARY KEY (`MaPX`, `MaSP`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chuyenhangthanhpham` (
    `MaHD` VARCHAR(20) NOT NULL,
    `MaVanDon` VARCHAR(100) NULL,
    `DonViVanChuyen` VARCHAR(100) NULL,
    `NgayGui` DATETIME(3) NULL,
    `NgayDuKien` DATETIME(3) NULL,
    `NgayNhan` DATETIME(3) NULL,
    `TrangThai` INTEGER NULL DEFAULT 0,
    `GhiChu` TEXT NULL,

    PRIMARY KEY (`MaHD`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuahang` (
    `MaCH` VARCHAR(20) NOT NULL,
    `TenCH` VARCHAR(100) NOT NULL,
    `DiaChi` VARCHAR(255) NULL,
    `SDT` VARCHAR(15) NULL,

    PRIMARY KEY (`MaCH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donhang` (
    `MaDH` VARCHAR(20) NOT NULL,
    `MaCH` VARCHAR(20) NULL,
    `MaNV` VARCHAR(20) NULL,
    `MaKH` VARCHAR(20) NULL,
    `Makmkh` VARCHAR(20) NULL,
    `MaTaiKhoan` VARCHAR(20) NULL,
    `order_code` VARCHAR(50) NULL,
    `order_type` INTEGER NULL DEFAULT 1,
    `TongTien` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `subtotal` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `shipping_fee` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `TrangThai` INTEGER NULL DEFAULT 1,
    `payment_status` INTEGER NULL DEFAULT 0,
    `payment_method` VARCHAR(50) NULL,
    `address_id` VARCHAR(50) NULL,
    `customer_note` TEXT NULL,
    `NgayTao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `donhang_order_code_key`(`order_code`),
    INDEX `FK_HD_CuaHang`(`MaCH`),
    INDEX `FK_HD_NhanVien`(`MaNV`),
    INDEX `FK_HD_KhachHang`(`MaKH`),
    INDEX `FK_HD_KMKH`(`Makmkh`),
    INDEX `FK_HD_TaiKhoan`(`MaTaiKhoan`),
    INDEX `order_code`(`order_code`),
    PRIMARY KEY (`MaDH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `khachhang` (
    `MaKH` VARCHAR(20) NOT NULL,
    `TenKH` VARCHAR(255) NOT NULL,
    `SDT` VARCHAR(20) NULL,
    `NgaySinh` DATE NULL,
    `GioiTinh` VARCHAR(10) NULL,
    `DiaChi` VARCHAR(255) NULL,
    `Email` VARCHAR(100) NULL,
    `NgayTao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TrangThai` INTEGER NULL DEFAULT 1,
    `MaTaiKhoan` VARCHAR(20) NULL,

    UNIQUE INDEX `khachhang_Email_key`(`Email`),
    INDEX `FK_KH_TaiKhoan`(`MaTaiKhoan`),
    INDEX `Email`(`Email`),
    PRIMARY KEY (`MaKH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kho` (
    `MaKho` VARCHAR(20) NOT NULL,
    `TenKho` VARCHAR(100) NOT NULL,
    `DiaChi` VARCHAR(255) NULL,
    `SoDienThoai` VARCHAR(20) NULL,
    `TrangThai` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`MaKho`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loaisanpham` (
    `MaLoai` VARCHAR(20) NOT NULL,
    `TenLoai` VARCHAR(100) NOT NULL,
    `Mota` TEXT NULL,
    `TrangThai` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`MaLoai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nhanvien` (
    `MaNV` VARCHAR(20) NOT NULL,
    `HoTen` VARCHAR(100) NOT NULL,
    `NgayNhanChuc` DATE NULL,
    `TrangThai` VARCHAR(50) NULL,
    `DiaChi` VARCHAR(255) NULL,
    `SDT` VARCHAR(15) NULL,
    `LuongNen` DECIMAL(15, 2) NULL,
    `Email` VARCHAR(100) NULL,
    `MaCH` VARCHAR(20) NULL,
    `MaKho` VARCHAR(20) NULL,
    `MaTaiKhoan` VARCHAR(20) NULL,

    UNIQUE INDEX `nhanvien_Email_key`(`Email`),
    INDEX `nhanvien_ibfk_1`(`MaCH`),
    INDEX `nhanvien_ibfk_2`(`MaKho`),
    INDEX `nhanvien_ibfk_3`(`MaTaiKhoan`),
    INDEX `Email`(`Email`),
    PRIMARY KEY (`MaNV`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nhaphanphoi` (
    `MaNPP` VARCHAR(20) NOT NULL,
    `TenNPP` VARCHAR(255) NOT NULL,
    `DiaChi` VARCHAR(255) NULL,
    `Sdt` VARCHAR(20) NULL,

    PRIMARY KEY (`MaNPP`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `payment_id` VARCHAR(20) NOT NULL,
    `MaHD` VARCHAR(20) NOT NULL,
    `MaKH` VARCHAR(20) NULL,
    `transaction_id` VARCHAR(100) NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(10) NULL DEFAULT 'VND',
    `payment_method` VARCHAR(50) NULL,
    `payment_endpoint` VARCHAR(255) NULL,
    `status` INTEGER NULL DEFAULT 0,
    `paid_at` DATETIME(3) NULL,
    `note` TEXT NULL,

    INDEX `FK_Payments_HoaDon`(`MaHD`),
    INDEX `FK_Payments_KhachHang`(`MaKH`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_logs` (
    `Payment_Logs_id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_id` VARCHAR(20) NULL,
    `log_type` VARCHAR(50) NULL,
    `vnp_TxnRef` VARCHAR(100) NULL,
    `response_code` VARCHAR(10) NULL,
    `message` TEXT NULL,
    `new_data` JSON NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_Logs_Payments`(`payment_id`),
    PRIMARY KEY (`Payment_Logs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phanquyen` (
    `MaTK` VARCHAR(20) NOT NULL,
    `MaVaiTro` VARCHAR(20) NOT NULL,
    `MaNV` VARCHAR(20) NULL,

    INDEX `FK_PQ_TaiKhoan`(`MaTK`),
    INDEX `FK_PQ_VaiTro`(`MaVaiTro`),
    INDEX `FK_PQ_NhanVien`(`MaNV`),
    PRIMARY KEY (`MaTK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieuchuyenhang` (
    `MaPC` VARCHAR(20) NOT NULL,
    `MaCH_Xuat` VARCHAR(20) NULL,
    `MaCH_Nhan` VARCHAR(20) NULL,
    `TongTien` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `NgayTao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),
    `trangthai` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`MaPC`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieunhanhang` (
    `MaPNH` VARCHAR(20) NOT NULL,
    `MaPC` VARCHAR(20) NULL,
    `MaNV` VARCHAR(20) NULL,
    `MaTaiKhoan` VARCHAR(20) NULL,
    `TongTien` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `NgayTao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),
    `trangthai` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `phieunhanhang_MaPC_key`(`MaPC`),
    PRIMARY KEY (`MaPNH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieunhap` (
    `MaPN` VARCHAR(20) NOT NULL,
    `MaNPP` VARCHAR(20) NULL,
    `MaNV` VARCHAR(20) NULL,
    `TongTien` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `NgayTao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TrangThai` INTEGER NULL DEFAULT 1,
    `MaTaiKhoan` VARCHAR(20) NULL,

    INDEX `FK_PN_NhaPhanPhoi`(`MaNPP`),
    INDEX `FK_PN_NhanVien`(`MaNV`),
    PRIMARY KEY (`MaPN`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieuxuat` (
    `MaPX` VARCHAR(20) NOT NULL,
    `NgayTao` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TongTien` DECIMAL(18, 2) NULL DEFAULT 0.00,
    `TrangThai` INTEGER NULL DEFAULT 1,
    `MaNV` VARCHAR(20) NULL,
    `MaCH` VARCHAR(20) NULL,
    `MaTaiKhoan` VARCHAR(20) NULL,

    INDEX `FK_MaNV`(`MaNV`),
    INDEX `FK_MaCH`(`MaCH`),
    PRIMARY KEY (`MaPX`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sanpham` (
    `MaSP` VARCHAR(20) NOT NULL,
    `TenSP` VARCHAR(255) NOT NULL,
    `MaCodeSp` VARCHAR(50) NULL,
    `GiaVon` DECIMAL(18, 2) NULL DEFAULT 0.00,
    `GiaBan` DECIMAL(18, 2) NULL DEFAULT 0.00,
    `Mota` TEXT NULL,
    `TrangThai` VARCHAR(50) NULL DEFAULT '1',
    `MaLoai` VARCHAR(20) NULL,
    `NgayTao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sanpham_MaCodeSp_key`(`MaCodeSp`),
    INDEX `FK_SanPham_Loai`(`MaLoai`),
    INDEX `MaCodeSp`(`MaCodeSp`),
    PRIMARY KEY (`MaSP`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taikhoan` (
    `MaTaiKhoan` VARCHAR(20) NOT NULL,
    `TenDangNhap` VARCHAR(50) NOT NULL,
    `MatKhau` VARCHAR(255) NOT NULL,
    `TrangThai` INTEGER NULL DEFAULT 1,
    `MaVaiTro` VARCHAR(20) NULL,

    UNIQUE INDEX `TenDangNhap`(`TenDangNhap`),
    INDEX `FK_TaiKhoan_VaiTro`(`MaVaiTro`),
    PRIMARY KEY (`MaTaiKhoan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tonkho` (
    `MaKho` VARCHAR(20) NOT NULL,
    `MaSP` VARCHAR(20) NOT NULL,
    `SoLuong` INTEGER NULL DEFAULT 0,
    `NgayCapNhat` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_TonKho_SanPham`(`MaSP`),
    INDEX `FK_TonKho_Kho`(`MaKho`),
    PRIMARY KEY (`MaKho`, `MaSP`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tonkhocuahang` (
    `MaSP` VARCHAR(20) NOT NULL,
    `MaCH` VARCHAR(20) NOT NULL,
    `SoLuong` INTEGER NULL DEFAULT 0,

    INDEX `FK_TonKhoCuaHang_SanPham`(`MaSP`),
    INDEX `FK_TonKhoCuaHang_CuaHang`(`MaCH`),
    PRIMARY KEY (`MaSP`, `MaCH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vaitro` (
    `MaVaiTro` VARCHAR(20) NOT NULL,
    `TenVaiTro` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`MaVaiTro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `address` (
    `address_id` VARCHAR(20) NOT NULL,
    `Makh` VARCHAR(20) NOT NULL,
    `ten` VARCHAR(100) NULL,
    `Sdt` VARCHAR(20) NULL,
    `tinhthanhpho` VARCHAR(100) NULL,
    `quanhuyen` VARCHAR(100) NULL,
    `coinh` VARCHAR(255) NULL,

    INDEX `FK_Address_KhachHang`(`Makh`),
    PRIMARY KEY (`address_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sanpham_anh` (
    `MaAnh` VARCHAR(20) NOT NULL,
    `MaSP` VARCHAR(20) NOT NULL,
    `DuongDanAnh` VARCHAR(255) NOT NULL,
    `ThuTu` INTEGER NULL DEFAULT 0,
    `AnhChinh` INTEGER NULL DEFAULT 0,

    INDEX `FK_Anh_SanPham`(`MaSP`),
    PRIMARY KEY (`MaAnh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `khuyenmai` (
    `Makhuyenmai` VARCHAR(20) NOT NULL,
    `MaCH` VARCHAR(20) NULL,
    `Masp` VARCHAR(20) NULL,
    `mota` TEXT NULL,
    `giatri` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `thoihan` DATETIME(3) NULL,

    PRIMARY KEY (`Makhuyenmai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `khuyenmaikhachhang` (
    `Makmkh` VARCHAR(20) NOT NULL,
    `MaKH` VARCHAR(20) NOT NULL,
    `giatri` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `thoihan` DATETIME(3) NULL,
    `mota` TEXT NULL,
    `Uutien` INTEGER NULL DEFAULT 0,

    INDEX `FK_KMKH_KhachHang`(`MaKH`),
    PRIMARY KEY (`Makmkh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chitietdonhang` ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`MaSP`) REFERENCES `sanpham`(`MaSP`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `chitietdonhang` ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`MaDH`) REFERENCES `donhang`(`MaDH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `chitietphieuchuyenhang` ADD CONSTRAINT `FK_CTPC_PhieuChuyen` FOREIGN KEY (`MaPC`) REFERENCES `phieuchuyenhang`(`MaPC`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `chitietphieuchuyenhang` ADD CONSTRAINT `FK_CTPC_SanPham` FOREIGN KEY (`MaSp`) REFERENCES `sanpham`(`MaSP`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `chitietphieunhanhang` ADD CONSTRAINT `FK_CTPNH_PhieuNhan` FOREIGN KEY (`MaPNH`) REFERENCES `phieunhanhang`(`MaPNH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `chitietphieunhanhang` ADD CONSTRAINT `FK_CTPNH_SanPham` FOREIGN KEY (`MaSp`) REFERENCES `sanpham`(`MaSP`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `chitietphieunhap` ADD CONSTRAINT `FK_CTPN_PhieuNhap` FOREIGN KEY (`MaPN`) REFERENCES `phieunhap`(`MaPN`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieunhap` ADD CONSTRAINT `FK_CTPN_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `sanpham`(`MaSP`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieuxuat` ADD CONSTRAINT `chitietphieuxuat_ibfk_1` FOREIGN KEY (`MaPX`) REFERENCES `phieuxuat`(`MaPX`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieuxuat` ADD CONSTRAINT `chitietphieuxuat_ibfk_2` FOREIGN KEY (`MaSP`) REFERENCES `sanpham`(`MaSP`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chuyenhangthanhpham` ADD CONSTRAINT `FK_GiaoHang_HoaDon` FOREIGN KEY (`MaHD`) REFERENCES `donhang`(`MaDH`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donhang` ADD CONSTRAINT `FK_HD_TaiKhoan` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `donhang` ADD CONSTRAINT `FK_HD_CuaHang` FOREIGN KEY (`MaCH`) REFERENCES `cuahang`(`MaCH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `donhang` ADD CONSTRAINT `FK_HD_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `donhang` ADD CONSTRAINT `FK_HD_KhachHang` FOREIGN KEY (`MaKH`) REFERENCES `khachhang`(`MaKH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `donhang` ADD CONSTRAINT `FK_HD_KMKH` FOREIGN KEY (`Makmkh`) REFERENCES `khuyenmaikhachhang`(`Makmkh`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `khachhang` ADD CONSTRAINT `FK_KH_TaiKhoan` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `nhanvien` ADD CONSTRAINT `nhanvien_ibfk_1` FOREIGN KEY (`MaCH`) REFERENCES `cuahang`(`MaCH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `nhanvien` ADD CONSTRAINT `nhanvien_ibfk_2` FOREIGN KEY (`MaKho`) REFERENCES `kho`(`MaKho`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `nhanvien` ADD CONSTRAINT `nhanvien_ibfk_3` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `FK_Payments_HoaDon` FOREIGN KEY (`MaHD`) REFERENCES `donhang`(`MaDH`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `FK_Payments_KhachHang` FOREIGN KEY (`MaKH`) REFERENCES `khachhang`(`MaKH`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_logs` ADD CONSTRAINT `FK_Logs_Payments` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phanquyen` ADD CONSTRAINT `FK_PQ_TaiKhoan` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phanquyen` ADD CONSTRAINT `FK_PQ_VaiTro2` FOREIGN KEY (`MaVaiTro`) REFERENCES `vaitro`(`MaVaiTro`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phanquyen` ADD CONSTRAINT `FK_PQ_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieuchuyenhang` ADD CONSTRAINT `FK_PC_CuaHangXuat` FOREIGN KEY (`MaCH_Xuat`) REFERENCES `cuahang`(`MaCH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieuchuyenhang` ADD CONSTRAINT `FK_PC_CuaHangNhan` FOREIGN KEY (`MaCH_Nhan`) REFERENCES `cuahang`(`MaCH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieunhanhang` ADD CONSTRAINT `FK_PNH_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieunhanhang` ADD CONSTRAINT `FK_PNH_TaiKhoan` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieunhanhang` ADD CONSTRAINT `FK_PNH_PhieuChuyen` FOREIGN KEY (`MaPC`) REFERENCES `phieuchuyenhang`(`MaPC`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieunhap` ADD CONSTRAINT `FK_PN_NhaPhanPhoi` FOREIGN KEY (`MaNPP`) REFERENCES `nhaphanphoi`(`MaNPP`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieunhap` ADD CONSTRAINT `FK_PN_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieunhap` ADD CONSTRAINT `FK_PN_TaiKhoan` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieuxuat` ADD CONSTRAINT `FK_MaNV` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieuxuat` ADD CONSTRAINT `FK_MaCH` FOREIGN KEY (`MaCH`) REFERENCES `cuahang`(`MaCH`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `phieuxuat` ADD CONSTRAINT `FK_PX_TaiKhoan2` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `taikhoan`(`MaTaiKhoan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sanpham` ADD CONSTRAINT `FK_SanPham_Loai` FOREIGN KEY (`MaLoai`) REFERENCES `loaisanpham`(`MaLoai`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `taikhoan` ADD CONSTRAINT `FK_TaiKhoan_VaiTro` FOREIGN KEY (`MaVaiTro`) REFERENCES `vaitro`(`MaVaiTro`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tonkho` ADD CONSTRAINT `FK_TonKho_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `sanpham`(`MaSP`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tonkho` ADD CONSTRAINT `FK_TonKho_Kho` FOREIGN KEY (`MaKho`) REFERENCES `kho`(`MaKho`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tonkhocuahang` ADD CONSTRAINT `FK_TonKhoCuaHang_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `sanpham`(`MaSP`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tonkhocuahang` ADD CONSTRAINT `FK_TonKhoCuaHang_CuaHang` FOREIGN KEY (`MaCH`) REFERENCES `cuahang`(`MaCH`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `FK_Address_KhachHang` FOREIGN KEY (`Makh`) REFERENCES `khachhang`(`MaKH`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanpham_anh` ADD CONSTRAINT `FK_Anh_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `sanpham`(`MaSP`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `khuyenmai` ADD CONSTRAINT `FK_KM_CuaHang` FOREIGN KEY (`MaCH`) REFERENCES `cuahang`(`MaCH`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `khuyenmai` ADD CONSTRAINT `FK_KM_SanPham` FOREIGN KEY (`Masp`) REFERENCES `sanpham`(`MaSP`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `khuyenmaikhachhang` ADD CONSTRAINT `FK_KMKH_KhachHang` FOREIGN KEY (`MaKH`) REFERENCES `khachhang`(`MaKH`) ON DELETE CASCADE ON UPDATE CASCADE;
