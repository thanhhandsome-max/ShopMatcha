/**
 * Service quản lý Lịch sử biến động kho - ShopMatcha
 */

const API_URL = '/api/lich-su-kho';

// 1. Tìm kiếm lịch sử với bộ lọc (Dùng cho Table & Stats)
export const searchLichSu = async (filter: any) => {
  try {
    const params = new URLSearchParams();
    if (filter.type) params.append('type', filter.type);
    if (filter.kho) params.append('kho', filter.kho);
    if (filter.sanpham) params.append('sanpham', filter.sanpham);
    if (filter.phieu) params.append('phieu', filter.phieu);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tải lịch sử kho');
    
    return data.lichSu || [];
  } catch (error) {
    console.error('Service Search Error:', error);
    throw error;
  }
};

// 2. Ghi lịch sử Chuyển hàng (Mặc định: Chờ xử lý - 0)
export const taoLichSuChuyen = async (data: any) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chuyen',
        maSP: data.maSP,
        maCH: data.maCH, // Cửa hàng xuất
        soLuong: data.soLuong,
        tongTien: data.tongTien,
        maPhieu: data.maPhieu,
        maNhanVien: data.maNhanVien,
        trangthai: 0, // ÉP LOGIC: Phiếu chuyển mới luôn là Chờ xử lý
        ghiChu: data.ghiChu || 'Chờ xác nhận nhập kho'
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi ghi lịch sử chuyển');
    
    return result;
  } catch (error) {
    console.error('Service Post Chuyen Error:', error);
    throw error;
  }
};

// 3. Ghi lịch sử Nhận hàng (Mặc định: Hoàn thành - 1)
export const taoLichSuNhan = async (data: any) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'nhan',
        maSP: data.maSP,
        maCH: data.maCH, // Cửa hàng nhận
        soLuong: data.soLuong,
        tongTien: data.tongTien,
        maPhieu: data.maPhieu,
        maNhanVien: data.maNhanVien,
        trangthai: 1, // ÉP LOGIC: Phiếu nhận luôn là Hoàn thành
        ghiChu: data.ghiChu || `Nhận hàng từ phiếu ${data.maPC_Goc}`
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi ghi lịch sử nhận');
    
    return result;
  } catch (error) {
    console.error('Service Post Nhan Error:', error);
    throw error;
  }
};

// 4. Cập nhật trạng thái lịch sử (Đồng bộ khi nhận hàng thành công)
export const syncTrangThaiLichSu = async (maPhieu: string, trangthai: number) => {
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maPhieu: maPhieu,
        trangthai: trangthai
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi đồng bộ trạng thái');
    
    return result;
  } catch (error) {
    console.error('Service Sync Error:', error);
    throw error;
  }
};

// 5. Xóa lịch sử (Dùng khi xóa phiếu)
export const xoaLichSuTheoPhieu = async (maPhieu: string) => {
  try {
    const res = await fetch(`${API_URL}?maPhieu=${maPhieu}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Không thể xóa lịch sử liên quan');
    
    return await res.json();
  } catch (error) {
    console.error('Service Delete Error:', error);
    throw error;
  }
};