const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // Client side dùng relative path
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Server side dùng absolute path
};

const API_ENDPOINT = `${getBaseUrl()}/api/lich-su-kho`;

// ---------------------------------------------------------
// LẤY DANH SÁCH LỊCH SỬ
// ---------------------------------------------------------

/** Lấy toàn bộ lịch sử nhập/xuất/chuyển hàng */
export async function getAllLichSuKho() {
  const res = await fetch(`${API_ENDPOINT}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải lịch sử kho');
  const data = await res.json();
  return data.lichSu || [];
}

/** Lấy lịch sử theo loại giao dịch (nhap, xuat, chuyen) */
export async function getLichSuByType(type: 'nhap' | 'xuat' | 'chuyen') {
  const res = await fetch(`${API_ENDPOINT}?type=${type}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Không thể tải lịch sử ${type}`);
  const data = await res.json();
  return data.lichSu || [];
}

/** Lấy lịch sử theo kho */
export async function getLichSuByKho(maKho: string) {
  const res = await fetch(`${API_ENDPOINT}?kho=${maKho}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải lịch sử kho');
  const data = await res.json();
  return data.lichSu || [];
}

/** Lấy lịch sử theo sản phẩm */
export async function getLichSuBySanPham(maSP: string) {
  const res = await fetch(`${API_ENDPOINT}?sanpham=${maSP}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải lịch sử sản phẩm');
  const data = await res.json();
  return data.lichSu || [];
}

/** Lấy lịch sử theo mã phiếu */
export async function getLichSuByPhieu(maPhieu: string) {
  const res = await fetch(`${API_ENDPOINT}?phieu=${maPhieu}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải lịch sử phiếu');
  const data = await res.json();
  return data.lichSu || [];
}

/** Lấy chi tiết một bản ghi lịch sử */
export async function getLichSuDetail(maLS: string) {
  const res = await fetch(`${API_ENDPOINT}/${maLS}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải chi tiết lịch sử');
  return await res.json();
}

// ---------------------------------------------------------
// TẠO LỊCH SỬ MỚI
// ---------------------------------------------------------

/** Ghi lịch sử nhập hàng */
export async function taoLichSuNhap(data: {
  maSP: string;
  soLuong: number;
  giaTien?: number;
  tongTien?: number;
  maPhieu: string; // MaPN
  maNhanVien?: string;
  ghiChu?: string;
}) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'nhap',
      ...data,
    }),
  });
  if (!res.ok) throw new Error('Lỗi khi ghi lịch sử nhập');
  return await res.json();
}

/** Ghi lịch sử xuất hàng */
export async function taoLichSuXuat(data: {
  maSP: string;
  maCH: string; // Cửa hàng
  soLuong: number;
  giaTien?: number;
  tongTien?: number;
  maPhieu: string; // MaPX
  maNhanVien?: string;
  ghiChu?: string;
}) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'xuat',
      ...data,
    }),
  });
  if (!res.ok) throw new Error('Lỗi khi ghi lịch sử xuất');
  return await res.json();
}

/** Ghi lịch sử chuyển hàng */
export async function taoLichSuChuyen(data: {
  maSP: string;
  maKhoXuat: string;
  maKhoNhan: string;
  soLuong: number;
  giaTien?: number;
  tongTien?: number;
  maPhieu: string; // MaPC
  maNhanVien?: string;
  ghiChu?: string;
}) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'chuyen',
      ...data,
    }),
  });
  if (!res.ok) throw new Error('Lỗi khi ghi lịch sử chuyển');
  return await res.json();
}

// ---------------------------------------------------------
// CẬP NHẬT & XÓA
// ---------------------------------------------------------

/** Cập nhật trạng thái lịch sử */
export async function updateLichSu(maLS: string, trangThai: number, ghiChu?: string) {
  const res = await fetch(`${API_ENDPOINT}/${maLS}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trangThai, ghiChu }),
  });
  if (!res.ok) throw new Error('Không thể cập nhật lịch sử');
  return await res.json();
}

/** Xóa bản ghi lịch sử */
export async function deleteLichSu(maLS: string) {
  const res = await fetch(`${API_ENDPOINT}/${maLS}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Không thể xóa lịch sử');
  return await res.json();
}

// ---------------------------------------------------------
// THỐNG KÊ & BÁO CÁO
// ---------------------------------------------------------

/** Lấy thống kê nhập/xuất theo thời gian */
export async function getThongKeGiaoDich(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  const res = await fetch(`${API_ENDPOINT}/thongke?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể lấy thống kê');
  return await res.json();
}

/** Lấy thống kê tồn kho theo sản phẩm */
export async function getThongKeSanPham(maSP: string) {
  const res = await fetch(`${API_ENDPOINT}/thongke/sanpham/${maSP}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể lấy thống kê sản phẩm');
  return await res.json();
}
