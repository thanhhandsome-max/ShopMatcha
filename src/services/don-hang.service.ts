const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url; // Xử lý dấu / ở cuối
};

const API_ENDPOINT = `${getBaseUrl()}/api/don-hang`;

/**
 * Hàm helper để fetch dữ liệu và bắt lỗi chi tiết
 */
async function handleResponse(res: Response, defaultErrorMessage: string) {
  if (!res.ok) {
    let errorDetail = '';
    try {
      const errorData = await res.json();
      errorDetail = errorData.message || errorData.error || '';
    } catch {
      errorDetail = 'Server không phản hồi nội dung lỗi';
    }
    
    const message = `${defaultErrorMessage} (Mã lỗi: ${res.status}${errorDetail ? ` - ${errorDetail}` : ''})`;
    console.error(`[API Error]:`, message);
    throw new Error(message);
  }
  return res.json();
}

// ---------------------------------------------------------
// LẤY DANH SÁCH ĐƠN HÀNG
// ---------------------------------------------------------

export async function getAllDonHang() {
  const res = await fetch(`${API_ENDPOINT}`, { cache: 'no-store' });
  const data = await handleResponse(res, 'Không thể tải danh sách đơn hàng');
  return data.donHang || [];
}

export async function getDonHangWithFilter(filter: {
  trangThai?: number;
  cuaHang?: string;
  startDate?: Date;
  endDate?: Date;
  timKiem?: string;
} = {}) {
  const params = new URLSearchParams();
  if (filter.trangThai !== undefined) params.append('status', filter.trangThai.toString());
  if (filter.cuaHang) params.append('store', filter.cuaHang);
  if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
  if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
  if (filter.timKiem) params.append('search', filter.timKiem);

  const res = await fetch(`${API_ENDPOINT}?${params.toString()}`, { cache: 'no-store' });
  const data = await handleResponse(res, 'Không thể tải danh sách đơn hàng');
  return data.donHang || [];
}

export async function getDonHangDetail(maHD: string) {
  const res = await fetch(`${API_ENDPOINT}/${maHD}`, { cache: 'no-store' });
  return handleResponse(res, 'Không thể tải chi tiết đơn hàng');
}

export async function getChiTietDonHang(maHD: string) {
  const res = await fetch(`${API_ENDPOINT}/${maHD}/chi-tiet`, { cache: 'no-store' });
  return handleResponse(res, 'Không thể tải chi tiết sản phẩm');
}

// ---------------------------------------------------------
// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
// ---------------------------------------------------------

export async function updateTrangThaiDonHang(maHD: string, trangThai: number, ghiChu?: string) {
  const res = await fetch(`${API_ENDPOINT}/${maHD}/update-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trangThai, ghiChu }),
  });
  return handleResponse(res, 'Không thể cập nhật trạng thái đơn hàng');
}

export const chuyenTrangThaiChoXuLy = (maHD: string) => updateTrangThaiDonHang(maHD, 1, 'Chuyển sang chờ xử lý');
export const chuyenTrangThaiDangXuLy = (maHD: string) => updateTrangThaiDonHang(maHD, 2, 'Đang xử lý');
export const chuyenTrangThaiDangGiao = (maHD: string) => updateTrangThaiDonHang(maHD, 3, 'Đang giao hàng');
export const chuyenTrangThaiHoanThanh = (maHD: string) => updateTrangThaiDonHang(maHD, 4, 'Đã hoàn thành');

// ---------------------------------------------------------
// HỦY & THỐNG KÊ & THANH TOÁN
// ---------------------------------------------------------

export async function huyDonHang(maHD: string, lyDo: string) {
  const res = await fetch(`${API_ENDPOINT}/${maHD}/cancel`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lyDo }),
  });
  return handleResponse(res, 'Không thể hủy đơn hàng');
}

export async function getThongKeDonHang() {
  const res = await fetch(`${API_ENDPOINT}/stats/tong-hop`, { cache: 'no-store' });
  return handleResponse(res, 'Không thể lấy thống kê tổng hợp');
}

export async function getThongKeTheoTrangThai() {
  const res = await fetch(`${API_ENDPOINT}/stats/theo-trang-thai`, { cache: 'no-store' });
  return handleResponse(res, 'Không thể lấy thống kê trạng thái');
}

export async function updateTrangThaiThanhToan(maHD: string, paymentStatus: number, paymentMethod?: string) {
  const res = await fetch(`${API_ENDPOINT}/${maHD}/update-payment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus, paymentMethod }),
  });
  return handleResponse(res, 'Không thể cập nhật trạng thái thanh toán');
}