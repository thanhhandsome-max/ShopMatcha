import { query } from '@/lib/db';

/**
 * SERVICE XỬ LÝ NGHIỆP VỤ PHIẾU KHO - SHOPMATCHA
 * Logic: 
 * - Phiếu Chuyển: Mặc định Chờ xử lý (0)
 * - Phiếu Nhận: Mặc định Hoàn thành (1) + Tự động cập nhật Phiếu Chuyển đối ứng
 */

export const PhieuSQLService = {
  // =========================================================
  // 1. TRUY VẤN DANH SÁCH & CHI TIẾT
  // =========================================================
  getAllPhieuNhap: async () => await query('SELECT * FROM phieunhap ORDER BY NgayTao DESC'),
  getAllPhieuXuat: async () => await query('SELECT * FROM phieuxuat ORDER BY NgayTao DESC'),
  getAllPhieuChuyen: async () => await query('SELECT * FROM phieuchuyenhang ORDER BY NgayTao DESC'),
  getAllPhieuNhan: async () => await query('SELECT * FROM phieunhanhang ORDER BY NgayTao DESC'),

  getChiTietPhieuNhap: async (MaPN: string) =>
    await query('SELECT * FROM chitietphieunhap WHERE MaPN = @MaPN', { MaPN }),
  getChiTietPhieuXuat: async (MaPX: string) => 
    await query('SELECT * FROM chitietphieuxuat WHERE MaPX = @MaPX', { MaPX }),
  getChiTietPhieuChuyen: async (MaPC: string) => 
    await query('SELECT * FROM chitietphieuchuyenhang WHERE MaPC = @MaPC', { MaPC }),
  getChiTietPhieuNhan: async (MaPNH: string) => 
    await query('SELECT * FROM chitietphieunhanhang WHERE MaPNH = @MaPNH', { MaPNH }),

  // =========================================================
  // 2. TẠO PHIẾU NHẬP (NPP -> Kho) - Mặc định Hoàn thành (1)
  // =========================================================
  taoPhieuNhap: async (phieu: any, chitiet: any[]) => {
    const MaPN = await generateId('phieunhap', 'PN', 'MaPN');
    await query(
      `INSERT INTO phieunhap (MaPN, MaNPP, MaKho, MaNV, TongTien, NgayTao, TrangThai) 
       VALUES (@MaPN, @MaNPP, @MaKho, @MaNV, @TongTien, @NgayTao, 1)`,
      {
        MaPN,
        MaNPP: phieu.MaNPP,
        MaKho: phieu.MaKho,
        MaNV: phieu.MaNV,
        TongTien: Number(phieu.TongTien) || 0,
        NgayTao: phieu.NgayTao || new Date()
      }
    );
    for (const item of chitiet) {
      await query(`INSERT INTO chitietphieunhap (MaPN, MaSP, SoLuong, TongTien) VALUES (@MaPN, @MaSP, @SoLuong, @TongTien)`,
        { MaPN, MaSP: item.MaSP, SoLuong: Number(item.SoLuong), TongTien: Number(item.TongTien) || 0 });
    }
    return MaPN;
  },

  // =========================================================
  // 3. TẠO PHIẾU XUẤT (Kho -> Cửa hàng) - Mặc định Hoàn thành (1)
  // =========================================================
  taoPhieuXuat: async (phieu: any, chitiet: any[]) => {
    const MaPX = await generateId('phieuxuat', 'PX', 'MaPX');
    await query(
      `INSERT INTO phieuxuat (MaPX, MaKho, MaCH, MaNV, TongTien, NgayTao, TrangThai) 
       VALUES (@MaPX, @MaKho, @MaCH, @MaNV, @TongTien, @NgayTao, 1)`,
      {
        MaPX,
        MaKho: phieu.MaKho,
        MaCH: phieu.MaCH,
        MaNV: phieu.MaNV,
        TongTien: Number(phieu.TongTien) || 0,
        NgayTao: phieu.NgayTao || new Date()
      }
    );
    for (const item of chitiet) {
      await query(`INSERT INTO chitietphieuxuat (MaPX, MaSP, SoLuong) VALUES (@MaPX, @MaSP, @SoLuong)`,
        { MaPX, MaSP: item.MaSP, SoLuong: Number(item.SoLuong) });
    }
    return MaPX;
  },

  // =========================================================
  // 4. TẠO PHIẾU CHUYỂN HÀNG (Mặc định: CHỜ XỬ LÝ = 0)
  // =========================================================
  taoPhieuChuyen: async (phieu: any, chitiet: any[]) => {
    const MaPC = await generateId('phieuchuyenhang', 'PC', 'MaPC');
    await query(
      `INSERT INTO phieuchuyenhang (MaPC, MaCH_Xuat, MaCH_Nhan, MaNV, NgayTao, trangthai, TongTien) 
       VALUES (@MaPC, @MaCH_Xuat, @MaCH_Nhan, @MaNV, @NgayTao, 0, @TongTien)`, // Ép trạng thái 0
      {
        MaPC,
        MaCH_Xuat: phieu.MaCH_Xuat,
        MaCH_Nhan: phieu.MaCH_Nhan,
        MaNV: phieu.MaNV,
        NgayTao: phieu.NgayTao || new Date(),
        TongTien: Number(phieu.TongTien) || 0
      }
    );
    for (const item of chitiet) {
      await query(`INSERT INTO chitietphieuchuyenhang (MaPC, MaSP, SoLuong, TongTien) VALUES (@MaPC, @MaSP, @SoLuong, @TongTien)`,
        { MaPC, MaSP: item.MaSP, SoLuong: Number(item.SoLuong), TongTien: Number(item.TongTien) || 0 });
    }
    return MaPC;
  },

  // =========================================================
  // 5. TẠO PHIẾU NHẬN HÀNG (Mặc định: HOÀN THÀNH = 1 + UPDATE CHÉO)
  // =========================================================
  taoPhieuNhan: async (phieu: any, chitiet: any[]) => {
  const MaPNH = await generateId('phieunhanhang', 'PNH', 'MaPNH');
  const maPC_DoiUng = phieu.MaPC?.trim();

  // 1. Ghi bảng chính
  await query(
    `INSERT INTO phieunhanhang (MaPNH, MaPC, MaCH, MaNV, NgayTao, trangthai, TongTien) 
     VALUES (@MaPNH, @MaPC, @MaCH, @MaNV, @NgayTao, 1, @TongTien)`,
    {
      MaPNH,
      MaPC: maPC_DoiUng || null,
      MaCH: phieu.MaCH,
      MaNV: phieu.MaNV,
      NgayTao: phieu.NgayTao || new Date(),
      TongTien: Number(phieu.TongTien) || 0
    }
  );

  // 2. Xử lý hàng hóa
  let hangHoa = [];
  if (maPC_DoiUng) {
    // Lấy hàng từ phiếu chuyển - Dùng "*" để lấy hết các cột có thể có
    hangHoa = await query(
      `SELECT * FROM chitietphieuchuyenhang WHERE MaPC = @MaPC`,
      { MaPC: maPC_DoiUng }
    );
  } else {
    hangHoa = chitiet;
  }

  // 3. Ghi vào bảng chi tiết (Vòng lặp an toàn)
  if (hangHoa && hangHoa.length > 0) {
    for (const item of hangHoa) {
      // Cách lấy giá trị an toàn: Tìm mọi trường hợp hoa thường của MaSP và SoLuong
      const maSP_Chuan = item.MaSp || item.MaSP || item.masp || item.MaSanPham;
      const soLuong_Chuan = item.SoLuong || item.SOLUONG || item.soluong || 0;

      // CHỈ INSERT NẾU CÓ MÃ SP (Để tránh dòng NULL trong ảnh của Thành)
      if (maSP_Chuan) {
        await query(
          `INSERT INTO chitietphieunhanhang (MaPNH, MaSp, SoLuong, TongTien) 
           VALUES (@MaPNH, @MaSp, @SoLuong, @TongTien)`,
          { 
            MaPNH, 
            MaSp: maSP_Chuan, 
            SoLuong: Number(soLuong_Chuan),
            TongTien: item.TongTien || 0 // Nếu có trường giá trị thì ghi, không thì để 0
          }
        );
      }
    }

    // 4. Đồng bộ trạng thái
    if (maPC_DoiUng) {
      await query(`UPDATE phieuchuyenhang SET TrangThai = 1 WHERE MaPC = @MaPC`, { MaPC: maPC_DoiUng });
      await query(`UPDATE lichsukho SET TrangThaiGiaoDich = 1 WHERE MaPhieuLienQuan = @MaPC`, { MaPC: maPC_DoiUng });
    }
  }

  return MaPNH;
},

  // =========================================================
  // 6. XÓA PHIẾU (Xử lý ràng buộc khóa ngoại)
  // =========================================================
  xoaPhieu: async (type: string, id: string) => {
    const config = {
      nhap: { main: 'phieunhap', detail: 'chitietphieunhap', pk: 'MaPN' },
      xuat: { main: 'phieuxuat', detail: 'chitietphieuxuat', pk: 'MaPX' },
      chuyen: { main: 'phieuchuyenhang', detail: 'chitietphieuchuyenhang', pk: 'MaPC' },
      nhan: { main: 'phieunhanhang', detail: 'chitietphieunhanhang', pk: 'MaPNH' }
    }[type];

    if (!config) return false;

    // Nếu xóa phiếu chuyển, gỡ liên kết ở phiếu nhận trước (Tránh lỗi 547)
    if (type === 'chuyen') {
      await query(`UPDATE phieunhanhang SET MaPC = NULL WHERE MaPC = @id`, { id });
    }

    await query(`DELETE FROM ${config.detail} WHERE ${config.pk} = @id`, { id });
    await query(`DELETE FROM ${config.main} WHERE ${config.pk} = @id`, { id });
    return true;
  }
};

/**
 * HÀM TẠO ID TỰ ĐỘNG (Dùng chung)
 */
async function generateId(table: string, prefix: string, col: string) {
  const last = await query(`SELECT TOP 1 ${col} FROM ${table} ORDER BY LEN(${col}) DESC, ${col} DESC`);
  let nextStt = 1;
  if (last && last[0]?.[col]) {
    const match = last[0][col].toString().match(/\d+/);
    if (match) nextStt = parseInt(match[0]) + 1;
  }
  return `${prefix}${String(nextStt).padStart(3, '0')}`;
}