import * as lichSuService from './lich-su-kho.service';

const API_URL = '/api/phieu';

/**
 * SERVICE QUẢN LÝ PHIẾU (FRONTEND) - SHOPMATCHA
 * Điều phối luồng dữ liệu giữa API Phiếu và API Lịch sử kho
 */

// 1. Lấy danh sách phiếu theo loại (nhap, xuat, chuyen, nhan)
export const getPhieuList = async (type: string) => {
  const res = await fetch(`${API_URL}?type=${type}`);
  const data = await res.json();
  return data.ok ? data.phieu : [];
};

// 2. Lấy chi tiết sản phẩm của một phiếu
export const getPhieuDetail = async (type: string, id: string) => {
  const res = await fetch(`${API_URL}?type=${type}&maphieu=${id}&chitiet=true`);
  const data = await res.json();
  return data.ok ? data.chitiet : [];
};

// 3. HÀM TẠO PHIẾU TỔNG HỢP (Xử lý đa nghiệp vụ)
export const createPhieu = async (type: string, phieuData: any, chiTiet: any[]) => {
  try {
    // BƯỚC 1: Tạo phiếu chính trong DB nghiệp vụ
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, phieu: phieuData, chitiet: chiTiet }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi khi tạo phiếu');

    const maPhieuMoi = result.MaPhieu;

    // BƯỚC 2: Ghi Lịch sử kho cho từng sản phẩm (Để Dashboard nhảy số)
    for (const item of chiTiet) {
      const historyPayload = {
        maSP: item.MaSP,
        soLuong: item.SoLuong,
        tongTien: item.TongTien || (item.DonGia * item.SoLuong) || 0,
        maPhieu: maPhieuMoi,
        maNhanVien: phieuData.MaNV,
      };

      if (type === 'nhap') {
        await lichSuService.searchLichSu({ ...historyPayload, type: 'nhap', maKho: phieuData.MaKho });
      } 
      else if (type === 'xuat') {
        await lichSuService.searchLichSu({ ...historyPayload, type: 'xuat', maKho: phieuData.MaKho, maCH: phieuData.MaCH });
      } 
      else if (type === 'chuyen') {
        // Ghi lịch sử chuyển với trạng thái 0 (Chờ xử lý)
        await lichSuService.taoLichSuChuyen({
          ...historyPayload,
          maCH: phieuData.MaCH_Xuat,
        });
      } 
      else if (type === 'nhan') {
        // Ghi lịch sử nhận với trạng thái 1 (Hoàn thành)
        await lichSuService.taoLichSuNhan({
          ...historyPayload,
          maCH: phieuData.MaCH,
          maPC_Goc: phieuData.MaPC
        });
      }
    }

    // BƯỚC 3: ĐẶC BIỆT - Nếu là phiếu Nhận, tiến hành đồng bộ trạng thái phiếu Chuyển gốc
    if (type === 'nhan' && phieuData.MaPC) {
      await lichSuService.syncTrangThaiLichSu(phieuData.MaPC.trim(), 1);
      console.log(`[ShopMatcha] Đã đồng bộ trạng thái Hoàn thành cho phiếu gốc: ${phieuData.MaPC}`);
    }

    return maPhieuMoi;
  } catch (error: any) {
    console.error('Create Phieu Flow Error:', error);
    throw error;
  }
};

// 4. Xóa phiếu và dọn dẹp lịch sử
export const deletePhieu = async (type: string, id: string) => {
  try {
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, maphieu: id }),
    });

    if (res.ok) {
      // Xóa luôn các bản ghi lịch sử liên quan để sạch dữ liệu
      await lichSuService.xoaLichSuTheoPhieu(id);
    }

    return await res.json();
  } catch (error) {
    console.error('Delete Phieu Error:', error);
    throw error;
  }
};