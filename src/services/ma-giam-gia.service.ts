import { IMaGiamGia } from '@/types';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API_ENDPOINT = `${getBaseUrl()}/api/ma-giam-gia`;

/**
 * Hàm helper để fetch dữ liệu và bắt lỗi chi tiết
 */
async function handleResponse(res: Response, defaultErrorMessage: string) {
  if (!res.ok) {
    let errorDetail = '';
    try {
      const errorData = await res.json();
      errorDetail = errorData.error || errorData.message || '';
    } catch {
      errorDetail = 'Server không phản hồi nội dung lỗi';
    }

    const message = `${defaultErrorMessage} (${res.status}${errorDetail ? ` - ${errorDetail}` : ''})`;
    console.error(`[API Error]:`, message);
    throw new Error(message);
  }
  return res.json();
}

// ---------------------------------------------------------
// LẤY DANH SÁCH MÃ GIẢM GIÁ
// ---------------------------------------------------------

export async function getAllMaGiamGia() {
  const res = await fetch(`${API_ENDPOINT}`, { cache: 'no-store' });
  const data = await handleResponse(res, 'Không thể tải danh sách mã giảm giá');
  return data.data || [];
}

export async function getMaGiamGiaByFilters(filters: {
  isActive?: boolean;
  search?: string;
  sort?: string;
} = {}) {
  const params = new URLSearchParams();
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);

  const res = await fetch(`${API_ENDPOINT}?${params.toString()}`, { cache: 'no-store' });
  const data = await handleResponse(res, 'Không thể tải mã giảm giá');
  return data.data || [];
}

export async function getActiveMaGiamGia() {
  return getMaGiamGiaByFilters({ isActive: true });
}

export async function searchMaGiamGia(keyword: string) {
  return getMaGiamGiaByFilters({ search: keyword });
}

// ---------------------------------------------------------
// TẠO MÃ GIẢM GIÁ MỚI
// ---------------------------------------------------------

export async function createMaGiamGia(maGiamGia: Omit<IMaGiamGia, 'NgayTao' | 'NgayCapNhat' | 'SoLanSuDung'>) {
  const res = await fetch(`${API_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(maGiamGia),
  });

  const data = await handleResponse(res, 'Không thể tạo mã giảm giá');
  return data;
}

// ---------------------------------------------------------
// CẬP NHẬT MÃ GIẢM GIÁ
// ---------------------------------------------------------

export async function updateMaGiamGia(
  MaGG: string,
  maGiamGia: Partial<Omit<IMaGiamGia, 'MaGG' | 'NgayTao' | 'NgayCapNhat'>>
) {
  const res = await fetch(`${API_ENDPOINT}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ MaGG, ...maGiamGia }),
  });

  const data = await handleResponse(res, 'Không thể cập nhật mã giảm giá');
  return data;
}

export async function toggleMaGiamGia(MaGG: string, isActive: boolean) {
  return updateMaGiamGia(MaGG, { TrangThai: isActive ? 1 : 0 });
}

export async function incrementMaGiamGiaUsage(MaGG: string) {
  // Lấy mã hiện tại, tăng SoLanSuDung lên 1
  const all = await getAllMaGiamGia();
  const current = all.find((m: IMaGiamGia) => m.MaGG === MaGG);
  if (current) {
    return updateMaGiamGia(MaGG, { SoLanSuDung: (current.SoLanSuDung || 0) + 1 });
  }
  return null;
}

// ---------------------------------------------------------
// XÓA MÃ GIẢM GIÁ
// ---------------------------------------------------------

export async function deleteMaGiamGia(MaGG: string) {
  const res = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(MaGG)}`, {
    method: 'DELETE',
  });

  const data = await handleResponse(res, 'Không thể xóa mã giảm giá');
  return data;
}
