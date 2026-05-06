// import { IKhuyenMai } from '@/types';

// const getBaseUrl = () => {
//   if (typeof window !== 'undefined') return '';
//   const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
//   return url.endsWith('/') ? url.slice(0, -1) : url;
// };

// const API_ENDPOINT = `${getBaseUrl()}/api/khuyen-mai`;

// /**
//  * Hàm helper để fetch dữ liệu và bắt lỗi chi tiết
//  */
// async function handleResponse(res: Response, defaultErrorMessage: string) {
//   if (!res.ok) {
//     let errorDetail = '';
//     try {
//       const errorData = await res.json();
//       errorDetail = errorData.error || errorData.message || '';
//     } catch {
//       errorDetail = 'Server không phản hồi nội dung lỗi';
//     }

//     const message = `${defaultErrorMessage} (${res.status}${errorDetail ? ` - ${errorDetail}` : ''})`;
//     console.error(`[API Error]:`, message);
//     throw new Error(message);
//   }
//   return res.json();
// }

// // =========================================================
// // KHUYẾN MÃI SẢN PHẨM
// // =========================================================

// export async function getAllKhuyenMai() {
//   const res = await fetch(`${API_ENDPOINT}?type=khuyen-mai`, { cache: 'no-store' });
//   const data = await handleResponse(res, 'Không thể tải danh sách khuyến mãi');
//   return data.data || [];
// }

// export async function getKhuyenMaiByStore(storeId: string) {
//   const res = await fetch(`${API_ENDPOINT}?type=khuyen-mai&storeId=${encodeURIComponent(storeId)}`, { cache: 'no-store' });
//   const data = await handleResponse(res, 'Không thể tải khuyến mãi của cửa hàng');
//   return data.data || [];
// }

// export async function getKhuyenMaiByProduct(productId: string) {
//   const res = await fetch(`${API_ENDPOINT}?type=khuyen-mai&productId=${encodeURIComponent(productId)}`, { cache: 'no-store' });
//   const data = await handleResponse(res, 'Không thể tải khuyến mãi của sản phẩm');
//   return data.data || [];
// }

// export async function createKhuyenMai(khuyenMai: IKhuyenMai) {
//   const res = await fetch(`${API_ENDPOINT}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ ...khuyenMai, type: 'khuyen-mai' }),
//   });

//   const data = await handleResponse(res, 'Không thể tạo khuyến mãi');
//   return data;
// }

// export async function updateKhuyenMai(
//   Makhuyenmai: string,
//   khuyenMai: Partial<Omit<IKhuyenMai, 'Makhuyenmai'>>
// ) {
//   const res = await fetch(`${API_ENDPOINT}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ Makhuyenmai, ...khuyenMai }),
//   });

//   const data = await handleResponse(res, 'Không thể cập nhật khuyến mãi');
//   return data;
// }

// export async function deleteKhuyenMai(Makhuyenmai: string) {
//   const res = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(Makhuyenmai)}`, {
//     method: 'DELETE',
//   });

//   const data = await handleResponse(res, 'Không thể xóa khuyến mãi');
//   return data;
// }

// // =========================================================
// // MÃ GIẢM GIÁ (dùng bảng KhuyenMai)
// // =========================================================

// export async function getAllMaGiamGia() {
//   const res = await fetch(`${API_ENDPOINT}?type=ma-giam-gia`, { cache: 'no-store' });
//   const data = await handleResponse(res, 'Không thể tải danh sách mã giảm giá');
//   return data.data || [];
// }

// export async function searchMaGiamGia(keyword: string) {
//   const res = await fetch(`${API_ENDPOINT}?type=ma-giam-gia&search=${encodeURIComponent(keyword)}`, { cache: 'no-store' });
//   const data = await handleResponse(res, 'Không thể tìm kiếm mã giảm giá');
//   return data.data || [];
// }

// export async function createMaGiamGia(maGiamGia: Partial<IKhuyenMai>) {
//   const res = await fetch(`${API_ENDPOINT}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ ...maGiamGia, type: 'ma-giam-gia' }),
//   });

//   const data = await handleResponse(res, 'Không thể tạo mã giảm giá');
//   return data;
// }

// export async function updateMaGiamGia(
//   Makhuyenmai: string,
//   maGiamGia: Partial<Omit<IKhuyenMai, 'Makhuyenmai'>>
// ) {
//   const res = await fetch(`${API_ENDPOINT}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ Makhuyenmai, ...maGiamGia }),
//   });

//   const data = await handleResponse(res, 'Không thể cập nhật mã giảm giá');
//   return data;
// }

// export async function deleteMaGiamGia(Makhuyenmai: string) {
//   const res = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(Makhuyenmai)}`, {
//     method: 'DELETE',
//   });

//   const data = await handleResponse(res, 'Không thể xóa mã giảm giá');
//   return data;
// }

import { IKhuyenMai } from '@/types';

const API_ENDPOINT = `/api/khuyen-mai`;

async function handleResponse(res: Response, defaultErrorMessage: string) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || defaultErrorMessage);
  }
  return res.json();
}

// KHUYẾN MÃI SẢN PHẨM (Bảng khuyenmai)
export async function getAllKhuyenMai() {
  const res = await fetch(`${API_ENDPOINT}?type=san-pham`, { cache: 'no-store' });
  const data = await handleResponse(res, 'Lỗi tải KM sản phẩm');
  return data.data || [];
}

export async function createKhuyenMai(data: any) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, type: 'san-pham' }),
  });
  return handleResponse(res, 'Lỗi tạo KM sản phẩm');
}

// MÃ GIẢM GIÁ KHÁCH HÀNG (Bảng khuyenmaikhachhang)
export async function getAllMaGiamGia() {
  const res = await fetch(`${API_ENDPOINT}?type=khach-hang`, { cache: 'no-store' });
  const data = await handleResponse(res, 'Lỗi tải voucher khách hàng');
  return data.data || [];
}

export async function createMaGiamGia(data: any) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, type: 'khach-hang' }),
  });
  return handleResponse(res, 'Lỗi tạo voucher khách hàng');
}

// HÀM CHUNG DÙNG CHO CẢ HAI
export async function updateKhuyenMaiGeneric(id: string, data: any, type: string) {
  const res = await fetch(API_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, id, type }),
  });
  return handleResponse(res, 'Lỗi cập nhật');
}

export async function deleteKhuyenMaiGeneric(id: string, type: string) {
  const res = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(id)}&type=${type}`, {
    method: 'DELETE',
  });
  return handleResponse(res, 'Lỗi xóa');
}