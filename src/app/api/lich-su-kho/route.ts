import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------
// 1. GET: LẤY DANH SÁCH LỊCH SỬ (Dùng cho Dashboard & Báo cáo)
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');     // nhap, xuat, chuyen, nhan
    const kho = searchParams.get('kho');       // MaKho hoặc MaCH
    const sanpham = searchParams.get('sanpham');
    const phieu = searchParams.get('phieu');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sqlQuery = `
        SELECT 
          ls.MaLS, ls.MaSP, sp.TenSanPham,
          UPPER(ls.LoaiBienDong) as LoaiBienDong, 
          ls.SoLuong, ls.TongTien,
          ls.MaKho, ls.MaCH, 
          ls.MaPhieuLienQuan, ls.MaNV, 
          ls.NgayTao, ls.GhiChu,
          ISNULL(ls.TrangThaiGiaoDich, 1) as TrangThaiGiaoDich
        FROM lichsukho ls
        LEFT JOIN sanpham sp ON ls.MaSP = sp.MaSP
        WHERE 1=1
      `;

    const params: Record<string, any> = {};

    // Bộ lọc loại biến động
    if (type) {
      sqlQuery += ` AND ls.LoaiBienDong = @type`;
      params.type = type.toUpperCase(); 
    }

    // Bộ lọc địa điểm (Kho hoặc Cửa hàng)
    if (kho) {
      sqlQuery += ` AND (ls.MaKho = @kho OR ls.MaCH = @kho)`;
      params.kho = kho;
    }

    if (sanpham) {
      sqlQuery += ` AND ls.MaSP = @sanpham`;
      params.sanpham = sanpham;
    }

    if (phieu) {
      sqlQuery += ` AND ls.MaPhieuLienQuan = @phieu`;
      params.phieu = phieu;
    }

    if (startDate) {
      sqlQuery += ` AND ls.NgayTao >= @startDate`;
      params.startDate = new Date(startDate);
    }

    if (endDate) {
      sqlQuery += ` AND ls.NgayTao <= @endDate`;
      params.endDate = new Date(endDate);
    }

    sqlQuery += ` ORDER BY ls.NgayTao DESC`;

    const lichSu = await dbQuery(sqlQuery, params);

    return NextResponse.json({
      ok: true,
      lichSu: lichSu || [],
      count: lichSu?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 2. POST: TẠO BẢN GHI LỊCH SỬ (Đã fix logic TrangThai)
// ---------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type, maSP, maCH, maKho, soLuong, tongTien, 
      maPhieu, maNhanVien, ghiChu, trangthai 
    } = body;

    // 2.1 Tạo mã lịch sử tự động (LS00001)
    const lastLS = await dbQuery('SELECT TOP 1 MaLS FROM lichsukho ORDER BY LEN(MaLS) DESC, MaLS DESC');
      let nextStt = 1;
      if (lastLS && lastLS[0]?.MaLS) {
        const match = lastLS[0].MaLS.toString().match(/\d+/);
        if (match) nextStt = parseInt(match[0]) + 1;
      }
    const MaLS = `LS${String(nextStt).padStart(5, '0')}`;

    // 2.2 Thiết lập dữ liệu ghi log
    const insertParams: Record<string, any> = {
      MaLS,
      MaSP: maSP,
      SoLuong: Number(soLuong),
      TongTien: Number(tongTien) || 0,
      MaPhieuLienQuan: maPhieu,
      MaNV: maNhanVien || null,
      GhiChu: ghiChu || null,
      NgayTao: new Date(),
      // LOGIC QUAN TRỌNG: Lấy trangThai từ API Phieu gửi sang (0 hoặc 1)
      TrangThaiGiaoDich: trangthai !== undefined ? Number(trangthai) : 1,
      MaKho: maKho || null,
      MaCH: maCH || null,
      LoaiBienDong: type.toUpperCase()
    };

    const insertSQL = `
      INSERT INTO lichsukho (
        MaLS, MaSP, MaKho, MaCH, LoaiBienDong, SoLuong, 
        TongTien, MaPhieuLienQuan, MaNV, GhiChu, 
        NgayTao, TrangThaiGiaoDich
      ) VALUES (
        @MaLS, @MaSP, @MaKho, @MaCH, @LoaiBienDong, @SoLuong,
        @TongTien, @MaPhieuLienQuan, @MaNV, @GhiChu,
        @NgayTao, @TrangThaiGiaoDich
      )
    `;

    await dbQuery(insertSQL, insertParams);

    return NextResponse.json({ ok: true, maLS: MaLS });
  } catch (error: any) {
    console.error('[LS KHO API POST ERROR]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 3. PUT: CẬP NHẬT TRẠNG THÁI (Khi nhận hàng thành công)
// ---------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { maPhieu, trangthai } = body;

    if (!maPhieu) return NextResponse.json({ ok: false, error: 'Thiếu mã phiếu đối ứng' }, { status: 400 });

    // Cập nhật tất cả các dòng lịch sử liên quan đến mã phiếu này
    // (Dùng để chuyển trạng thái từ 0 sang 1 cho phiếu chuyển)
    await dbQuery(
      `UPDATE lichsukho SET TrangThaiGiaoDich = @trangthai WHERE MaPhieuLienQuan = @maPhieu`,
      { maPhieu, trangthai: Number(trangthai) }
    );

    return NextResponse.json({ ok: true, message: 'Đồng bộ lịch sử thành công' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 4. DELETE: XÓA LỊCH SỬ
// ---------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const maLS = searchParams.get('maLS');
    const maPhieu = searchParams.get('maPhieu');

    if (maLS) {
      await dbQuery('DELETE FROM lichsukho WHERE MaLS = @maLS', { maLS });
    } else if (maPhieu) {
      await dbQuery('DELETE FROM lichsukho WHERE MaPhieuLienQuan = @maPhieu', { maPhieu });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}