

import { query } from '@/lib/db';

export const PhieuSQLService = {
  // =========================================================
  // 1. TRUY VẤN DANH SÁCH (READ ALL)
  // =========================================================
  getAllPhieuNhap: async () => await query('SELECT * FROM phieunhap ORDER BY NgayTao DESC'),
  getAllPhieuXuat: async () => await query('SELECT * FROM phieuxuat ORDER BY NgayTao DESC'),
  getAllPhieuChuyen: async () => await query('SELECT * FROM phieuchuyenhang ORDER BY NgayTao DESC'),

  // =========================================================
  // 2. TRUY VẤN CHI TIẾT (READ ONE & DETAILS)
  // =========================================================
  getPhieuNhap: async (MaPN: string) => 
    (await query('SELECT * FROM phieunhap WHERE MaPN = @MaPN', { MaPN }))[0] || null,
  getChiTietPhieuNhap: async (MaPN: string) => 
    await query('SELECT * FROM chitietphieunhap WHERE MaPN = @MaPN', { MaPN }),

  getPhieuXuat: async (MaPX: string) => 
    (await query('SELECT * FROM phieuxuat WHERE MaPX = @MaPX', { MaPX }))[0] || null,
  getChiTietPhieuXuat: async (MaPX: string) => 
    await query('SELECT * FROM chitietphieuxuat WHERE MaPX = @MaPX', { MaPX }),

  getPhieuChuyen: async (MaPC: string) => 
    (await query('SELECT * FROM phieuchuyenhang WHERE MaPC = @MaPC', { MaPC }))[0] || null,
  getChiTietPhieuChuyen: async (MaPC: string) => 
    await query('SELECT * FROM chitietphieuchuyenhang WHERE MaPC = @MaPC', { MaPC }),

  // =========================================================
  // 3. TẠO PHIẾU NHẬP (Mã PN00X)
  // =========================================================
  taoPhieuNhap: async (phieu: any, chitiet: any[]) => {
    const lastPhieu = await query('SELECT TOP 1 MaPN FROM phieunhap ORDER BY LEN(MaPN) DESC, MaPN DESC');
    let nextStt = 1;
    if (lastPhieu && lastPhieu[0]?.MaPN) {
      const lastId = lastPhieu[0].MaPN.toString().replace('PN', '').trim();
      nextStt = parseInt(lastId) + 1;
    }
    const MaPN = `PN${String(nextStt).padStart(3, '0')}`;

    await query(
      `INSERT INTO phieunhap (MaPN, MaNPP, MaNV, TongTien, NgayTao, TrangThai) 
       VALUES (@MaPN, @MaNPP, @MaNV, @TongTien, @NgayTao, @TrangThai)`,
      {
        MaPN,
        MaNPP: phieu.MaNPP,
        MaNV: phieu.MaNV,
        TongTien: Number(phieu.TongTien) || 0,
        NgayTao: phieu.NgayTao || new Date(),
        TrangThai: (phieu.TrangThai !== undefined && phieu.TrangThai !== '') ? Number(phieu.TrangThai) : 1
      }
    );

    // Gộp sản phẩm trùng trước khi insert chi tiết
    const gopSP = chitiet.reduce((acc: any[], item: any) => {
      const tonTai = acc.find(x => x.MaSP === item.MaSP);
      if (tonTai) {
        tonTai.SoLuong += Number(item.SoLuong);
        tonTai.TongTien += (Number(item.TongTien) || 0);
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    for (const item of gopSP) {
      await query(
        `INSERT INTO chitietphieunhap (MaPN, MaSP, SoLuong, TongTien) VALUES (@MaPN, @MaSP, @SoLuong, @TongTien)`,
        { MaPN, MaSP: item.MaSP, SoLuong: Number(item.SoLuong), TongTien: Number(item.TongTien) || 0 }
      );
    }
    return MaPN;
  },

  // =========================================================
  // 4. TẠO PHIẾU XUẤT (Mã PX00X)
  // =========================================================
  taoPhieuXuat: async (phieu: any, chitiet: any[]) => {
    const lastPhieu = await query('SELECT TOP 1 MaPX FROM phieuxuat ORDER BY LEN(MaPX) DESC, MaPX DESC');
    let nextStt = 1;
    if (lastPhieu && lastPhieu[0]?.MaPX) {
      const lastId = lastPhieu[0].MaPX.toString().replace('PX', '').trim();
      nextStt = parseInt(lastId) + 1;
    }
    const MaPX = `PX${String(nextStt).padStart(3, '0')}`;

    await query(
      `INSERT INTO phieuxuat (MaPX, MaCH, MaNV, TongTien, NgayTao, TrangThai) 
       VALUES (@MaPX, @MaCH, @MaNV, @TongTien, @NgayTao, @TrangThai)`,
      {
        MaPX,
        MaCH: phieu.MaCH,
        MaNV: phieu.MaNV,
        TongTien: Number(phieu.TongTien) || 0,
        NgayTao: phieu.NgayTao || new Date(),
        TrangThai: (phieu.TrangThai !== undefined && phieu.TrangThai !== '') ? Number(phieu.TrangThai) : 1
      }
    );

    for (const item of chitiet) {
      await query(
        `INSERT INTO chitietphieuxuat (MaPX, MaSP, SoLuong) VALUES (@MaPX, @MaSP, @SoLuong)`,
        { MaPX, MaSP: item.MaSP, SoLuong: Number(item.SoLuong) }
      );
    }
    return MaPX;
  },

  // =========================================================
  // 5. TẠO PHIẾU CHUYỂN HÀNG (Mã PCH00X)
  // =========================================================
  taoPhieuChuyen: async (phieu: any, chitiet: any[]) => {
    const lastPhieu = await query('SELECT TOP 1 MaPC FROM phieuchuyenhang ORDER BY LEN(MaPC) DESC, MaPC DESC');
    let nextStt = 1;
    if (lastPhieu && lastPhieu[0]?.MaPC) {
      const lastId = lastPhieu[0].MaPC.toString().replace('PCH', '').trim();
      nextStt = parseInt(lastId) + 1;
    }
    const MaPC = `PCH${String(nextStt).padStart(3, '0')}`;

    await query(
      `INSERT INTO phieuchuyenhang (MaPC, MaNV, MaCH_Xuat, MaCH_Nhan, NgayTao, TrangThai) 
       VALUES (@MaPC, @MaNV, @MaCH_Xuat, @MaCH_Nhan, @NgayTao, @TrangThai)`,
      {
        MaPC,
        MaNV: phieu.MaNV,
        MaCH_Xuat: phieu.MaCH_Xuat,
        MaCH_Nhan: phieu.MaCH_Nhan,
        NgayTao: phieu.NgayTao || new Date(),
        TrangThai: (phieu.TrangThai !== undefined && phieu.TrangThai !== '') ? Number(phieu.TrangThai) : 1
      }
    );

    for (const item of chitiet) {
      await query(
        `INSERT INTO chitietphieuchuyenhang (MaPC, MaSP, SoLuong) VALUES (@MaPC, @MaSP, @SoLuong)`,
        { MaPC, MaSP: item.MaSP, SoLuong: Number(item.SoLuong) }
      );
    }
    return MaPC;
  },

  // =========================================================
  // 6. XÓA PHIẾU (XÓA CHI TIẾT TRƯỚC, PHIẾU CHÍNH SAU)
  // =========================================================
  xoaPhieu: async (type: 'nhap' | 'xuat' | 'chuyen', id: string) => {
    if (type === 'nhap') {
      await query(`DELETE FROM chitietphieunhap WHERE MaPN = @id`, { id });
      await query(`DELETE FROM phieunhap WHERE MaPN = @id`, { id });
    } else if (type === 'xuat') {
      await query(`DELETE FROM chitietphieuxuat WHERE MaPX = @id`, { id });
      await query(`DELETE FROM phieuxuat WHERE MaPX = @id`, { id });
    } else if (type === 'chuyen') {
      await query(`DELETE FROM chitietphieuchuyenhang WHERE MaPC = @id`, { id });
      await query(`DELETE FROM phieuchuyenhang WHERE MaPC = @id`, { id });
    }
    return true;
  }
};