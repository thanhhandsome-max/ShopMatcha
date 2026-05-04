// =========================================================================
// NHÓM 1: CÁC BẢNG ĐỘC LẬP
// =========================================================================

export interface ICuaHang {
  MaCH: string;
  TenCH: string;
  DiaChi?: string;
  SDT?: string;
}

export interface IKhachHang {
  MaKH: string;
  TenKH: string;
  SDT?: string;
  NgaySinh?: Date | string;
  GioiTinh?: string;
  DiaChi?: string;
  Email?: string;
  NgayTao?: Date | string;
  TrangThai?: number; // tinyint
}

export interface IKho {
  MaKho: string;
  TenKho: string;
  DiaChi?: string;
  SoDienThoai?: string;
  TrangThai?: number;
}

export interface ILoaiSanPham {
  MaLoai: string;
  TenLoai: string;
  MoTa?: string;
  TrangThai?: number;
}

export interface INhanVien {
  MaNV: string;
  HoTen: string;
  NgayNhanChuc?: Date | string;
  TrangThai?: string;
  DiaChi?: string;
  SDT?: string;
  LuongNen?: number; // decimal
  Email?: string;
}

export interface INhaPhanPhoi {
  MaNPP: string;
  TenNPP: string;
  DiaChi?: string;
  SDT?: string;
}

export interface ITaiKhoan {
  MaTK: string;
  TenDangNhap: string;
  MatKhau: string;
  TrangThai?: number;
}

export interface IVaiTro {
  MaVaiTro: string;
  TenVaiTro: string;
}

// =========================================================================
// NHÓM 2: CÁC BẢNG LIÊN KẾT CẤP 1
// =========================================================================

export interface IAddress {
  address_id: string;
  Makh: string;
  ten?: string;
  Sdt?: string;
  tinhthanhpho?: string;
  quanhuyen?: string;
  coinh?: string;
}

export interface IKhuyenMaiKhachHang {
  Makmkh: string;
  MaKH: string;
  giatri?: number;
  thoihan?: Date | string;
  mota?: string;
  Uutien?: number;
}

export interface IPhanQuyen {
  MaTK: string;
  MaVaiTro: string;
}

export interface IPhieuChuyenHang {
  MaPC: string;
  MaCH_Xuat: string;
  MaCH_Nhan: string;
  TongTien?: number;
  NgayTao?: Date | string;
  trangthai?: number;
}

export interface IPhieuNhap {
  MaPN: string;
  MaNPP?: string;
  MaNV?: string;
  TongTien?: number;
  NgayTao?: Date | string;
  TrangThai?: number;
}

export interface IPhieuXuat {
  MaPX: string;
  NgayTao?: Date | string;
  TongTien?: number;
  TrangThai?: number;
  MaNV?: string;
  MaCH?: string;
}

export interface ISanPham {
  MaSP: string;
  TenSanPham: string;
  MaCodeSp?: string;
  GiaVon?: number;
  GiaBan?: number;
  Anh?: string; // product main image filename or relative URL
  MoTa?: string;
  TrangThai?: number;
  MaLoai?: string;
  NgayTao?: Date | string;
}

// =========================================================================
// NHÓM 3: CÁC BẢNG LIÊN KẾT CẤP 2 (CHI TIẾT & CHỨC NĂNG)
// =========================================================================

export interface IKhuyenMai {
  Makhuyenmai: string;
  MaCH?: string;
  Masp?: string;
  mota?: string;
  giatrima?: number;
  thoihan?: Date | string;
}

export interface ISanPhamAnh {
  MaAnh: string;
  MaSP: string;
  DuongDanAnh: string;
  ThuTu?: number;
  AnhChinh?: number; // tinyint (0 hoặc 1) có thể dùng boolean
}

export interface ITonKho {
  MaKho: string;
  MaSP: string;
  SoLuong?: number;
  NgayCapNhat?: Date | string;
}

export interface IChiTietPhieuNhap {
  MaPN: string;
  MaSP: string;
  SoLuong: number;
  TongTien: number;
}

export interface IChiTietPhieuXuat {
  MaPX: string;
  MaSP: string;
  SoLuong?: number;
}

export interface IPhieuNhanHang {
  MaPNH: string;
  MaPC: string;
  TongTien?: number;
  NgayTao?: Date | string;
  trangthai?: number;
}

export interface IHoaDon {
  MaHD: string;
  MaCuahang?: string;
  MaNV?: string;
  Makh?: string;
  Makmkh?: string;
  order_code?: string;
  order_type?: number;
  TongTien?: number;
  subtotal?: number;
  shipping_fee?: number;
  TrangThai?: number;
  payment_status?: number;
  payment_method?: string;
  address_id?: string;
  customer_note?: string;
  NgayTao?: Date | string;
}

// =========================================================================
// NHÓM 4 & 5: CHI TIẾT HÓA ĐƠN & GIAO DỊCH THƯƠNG MẠI
// =========================================================================

export interface IChiTietPhieuChuyenHang {
  MaPC: string;
  MaSp: string;
  SoLuong: number;
  TongTien: number;
}

export interface IChiTietPhieuNhanHang {
  MaPNH: string;
  MaSp: string;
  SoLuong: number;
  TongTien: number;
}

export interface IChiTietHoaDon {
  MaHD: string;
  MaSP: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

export interface IChuyenHanhThanhPham {
  MaHD: string;
  MaVanDon?: string;
  DonViVanChuyen?: string;
  NgayGui?: Date | string;
  NgayDuKien?: Date | string;
  NgayNhan?: Date | string;
  TrangThai?: number;
  GhiChu?: string;
}

export interface IPayment {
  payment_id: string;
  MaHD: string;
  transaction_id?: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  payment_endpoint?: string;
  status?: number;
  paid_at?: Date | string;
  note?: string;
}

export interface IPaymentLog {
  Payment_Logs_id?: number; // Sinh tự động (IDENTITY) nên có thể optional khi tạo mới
  payment_id: string;
  log_type?: string;
  vnp_TxnRef?: string;
  response_code?: string;
  message?: string;
  new_data?: string; // Chứa chuỗi JSON
  created_at?: Date | string;
}