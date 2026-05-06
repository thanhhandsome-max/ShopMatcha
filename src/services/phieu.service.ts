import * as lichSuService from './lich-su-kho.service';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // Client side dùng relative path
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Server side dùng absolute path
};

const API_ENDPOINT = `${getBaseUrl()}/api/phieu`;

// ---------------------------------------------------------
// CÁC HÀM XỬ LÝ PHIẾU NHẬP
// ---------------------------------------------------------

/** Lấy danh sách phiếu nhập */
export async function getPhieuNhapList() {
  const res = await fetch(`${API_ENDPOINT}?type=nhap`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu nhập');
  const data = await res.json();
  // Trả về mảng phiếu dựa trên cấu trúc { ok: true, phieu: [...] } từ route.ts
  return data.phieu || [];
}

/** Lấy chi tiết một phiếu nhập (Bao gồm thông tin phiếu và danh sách sản phẩm) */
export async function getPhieuNhapDetail(MaPN: string) {
  const res = await fetch(`${API_ENDPOINT}?type=nhap&maphieu=${MaPN}&chitiet=true`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải chi tiết phiếu nhập');
  return await res.json();
}

/** Tạo phiếu nhập mới và cập nhật tồn kho */
export async function createPhieuNhap(phieuNhap: any, chiTiet: any[]) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'nhap', phieu: phieuNhap, chitiet: chiTiet }),
  });
  if (!res.ok) throw new Error('Lỗi khi tạo phiếu nhập');
  const data = await res.json();
  
  // Ghi lịch sử kho cho mỗi sản phẩm
  try {
    for (const item of chiTiet) {
      await lichSuService.taoLichSuNhap({
        maSP: item.MaSP,
        soLuong: item.SoLuong,
        giaTien: item.TongTien ? item.TongTien / item.SoLuong : undefined,
        tongTien: item.TongTien,
        maPhieu: data.MaPN,
        maNhanVien: phieuNhap.MaNV,
        ghiChu: phieuNhap.GhiChu,
      });
    }
  } catch (error) {
    console.error('Lỗi khi ghi lịch sử nhập:', error);
    // Không throw error ở đây vì phiếu đã được tạo thành công
  }
  
  return data.MaPN; // Trả về MaPN từ database
}

// ---------------------------------------------------------
// CÁC HÀM XỬ LÝ PHIẾU XUẤT
// ---------------------------------------------------------

/** Lấy danh sách phiếu xuất */
export async function getPhieuXuatList() {
  const res = await fetch(`${API_ENDPOINT}?type=xuat`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải danh sách phiếu xuất');
  const data = await res.json();
  return data.phieu || [];
}

/** Lấy chi tiết một phiếu xuất */
export async function getPhieuXuatDetail(MaPX: string) {
  const res = await fetch(`${API_ENDPOINT}?type=xuat&maphieu=${MaPX}&chitiet=true`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Không thể tải chi tiết phiếu xuất');
  return await res.json();
}

/** Tạo phiếu xuất mới */
export async function createPhieuXuat(phieuXuat: any, chiTiet: any[]) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'xuat', phieu: phieuXuat, chitiet: chiTiet }),
  });
  if (!res.ok) throw new Error('Lỗi khi tạo phiếu xuất');
  const data = await res.json();
  
  // Ghi lịch sử kho cho mỗi sản phẩm
  try {
    for (const item of chiTiet) {
      await lichSuService.taoLichSuXuat({
        maSP: item.MaSP,
        maCH: phieuXuat.MaCH,
        soLuong: item.SoLuong,
        giaTien: item.TongTien ? item.TongTien / item.SoLuong : undefined,
        tongTien: item.TongTien,
        maPhieu: data.MaPX,
        maNhanVien: phieuXuat.MaNV,
        ghiChu: phieuXuat.GhiChu,
      });
    }
  } catch (error) {
    console.error('Lỗi khi ghi lịch sử xuất:', error);
    // Không throw error ở đây vì phiếu đã được tạo thành công
  }
  
  return data.MaPX; // Trả về MaPX từ database
}

// ---------------------------------------------------------
// CÁC HÀM CẬP NHẬT VÀ XÓA
// ---------------------------------------------------------

export async function updatePhieu(type: 'nhap' | 'xuat', id: string, data: any) {
  const res = await fetch(API_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, maphieu: id, phieu: data }),
  });
  if (!res.ok) throw new Error(`Không thể cập nhật phiếu ${type}`);
  return await res.json();
}

export async function deletePhieu(type: 'nhap' | 'xuat', id: string) {
  const res = await fetch(API_ENDPOINT, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, maphieu: id }),
  });

  // Kiểm tra nếu Server trả về lỗi không phải JSON (như lỗi 500 kèm text)
  if (!res.ok) {
    const errorText = await res.text(); // Đọc dạng text thay vì JSON để tránh crash
    throw new Error(errorText || `Không thể xóa phiếu ${type}`);
  }

  // Kiểm tra xem phản hồi có nội dung không trước khi .json()
  const text = await res.text();
  return text ? JSON.parse(text) : { ok: true };
}

  export async function createPhieuChuyen(phieuChuyen: any, chiTiet: any[]) {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chuyen', phieu: phieuChuyen, chitiet: chiTiet }),
    });
    if (!res.ok) throw new Error('Lỗi khi tạo phiếu chuyển hàng');
    const data = await res.json();
    
    // Ghi lịch sử kho cho mỗi sản phẩm
    try {
      for (const item of chiTiet) {
        await lichSuService.taoLichSuChuyen({
          maSP: item.MaSP,
          maKhoXuat: phieuChuyen.MaCH_Xuat || phieuChuyen.MaKhoXuat,
          maKhoNhan: phieuChuyen.MaCH_Nhan || phieuChuyen.MaKhoNhan,
          soLuong: item.SoLuong,
          giaTien: item.TongTien ? item.TongTien / item.SoLuong : undefined,
          tongTien: item.TongTien,
          maPhieu: data.MaPC,
          maNhanVien: phieuChuyen.MaNV,
          ghiChu: phieuChuyen.GhiChu,
        });
      }
    } catch (error) {
      console.error('Lỗi khi ghi lịch sử chuyển:', error);
      // Không throw error ở đây vì phiếu đã được tạo thành công
    }
    
    return data.MaPC;
  }
// ---------------------------------------------------------
// EXPORT ĐỐI TƯỢNG PHIEUSERVICE ĐỂ FIX LỖI BUILD
// ---------------------------------------------------------

export const PhieuService = {
  // Danh sách nhập
  getPhieuNhapList,
  getAllPhieuNhap: getPhieuNhapList,
  
  // Chi tiết nhập
  getPhieuNhapDetail,
  getPhieuNhap: getPhieuNhapDetail,
  getChiTietPhieuNhap: getPhieuNhapDetail,
  
  // Tạo nhập
  createPhieuNhap,
  taoPhieuNhap: createPhieuNhap,

  // Danh sách xuất
  getPhieuXuatList,
  getAllPhieuXuat: getPhieuXuatList,

  // Chi tiết xuất
  getPhieuXuatDetail,
  getPhieuXuat: getPhieuXuatDetail,
  getChiTietPhieuXuat: getPhieuXuatDetail,

  // Tạo xuất
  createPhieuXuat,
  taoPhieuXuat: createPhieuXuat,

  // Hành động khác
  updatePhieu,
  deletePhieu,

  getAllPhieuChuyen: () => fetch(`${API_ENDPOINT}?type=chuyen`).then(res => res.json()).then(data => data.phieu || []),
  createPhieuChuyen,
  taoPhieuChuyen: createPhieuChuyen,
};