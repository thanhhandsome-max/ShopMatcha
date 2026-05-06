import { ConnectionPool, Request as SQLRequest } from 'mssql';
import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------
// GET: Lấy danh sách lịch sử
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // nhap, xuat, chuyen
    const kho = searchParams.get('kho');
    const sanpham = searchParams.get('sanpham');
    const phieu = searchParams.get('phieu');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sqlQuery = `
      SELECT 
        ls.MaLS,
        ls.MaSP,
        sp.TenSanPham,
        sp.MaCodeSp,
        ls.MaKho,
        k.TenKho,
        ls.MaCH,
        ch.TenCH,
        ls.LoaiGiaoDich,
        ls.SoLuong,
        ls.GiaTien,
        ls.TongTien,
        ls.MaPhieu,
        ls.MaNhanVien,
        nv.HoTen as TenNhanVien,
        ls.GhiChu,
        ls.NgayTao,
        ls.TrangThaiGiaoDich
      FROM lichsukho ls
      LEFT JOIN sanpham sp ON ls.MaSP = sp.MaSP
      LEFT JOIN kho k ON ls.MaKho = k.MaKho
      LEFT JOIN cuahang ch ON ls.MaCH = ch.MaCH
      LEFT JOIN nhanvien nv ON ls.MaNhanVien = nv.MaNV
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    if (type) {
      sqlQuery += ` AND ls.LoaiGiaoDich = @type`;
      params.type = type;
    }

    if (kho) {
      sqlQuery += ` AND ls.MaKho = @kho`;
      params.kho = kho;
    }

    if (sanpham) {
      sqlQuery += ` AND ls.MaSP = @sanpham`;
      params.sanpham = sanpham;
    }

    if (phieu) {
      sqlQuery += ` AND ls.MaPhieu = @phieu`;
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
    console.error('Error getting lichsu kho:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// POST: Tạo lịch sử mới
// ---------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type, // 'nhap', 'xuat', 'chuyen'
      maSP,
      maCH,
      maKho,
      maKhoXuat,
      maKhoNhan,
      soLuong,
      giaTien,
      tongTien,
      maPhieu,
      maNhanVien,
      ghiChu,
    } = body;

    if (!type || !maSP || !soLuong || !maPhieu) {
      return NextResponse.json(
        { ok: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Tạo mã lịch sử tự động
    const lastLS = await dbQuery(
      'SELECT TOP 1 MaLS FROM lichsukho ORDER BY LEN(MaLS) DESC, MaLS DESC'
    );
    let nextStt = 1;
    if (lastLS && lastLS[0]?.MaLS) {
      const lastId = lastLS[0].MaLS.toString().replace('LS', '').trim();
      nextStt = parseInt(lastId) + 1;
    }
    const MaLS = `LS${String(nextStt).padStart(5, '0')}`;

    // Lọc tham số dựa trên loại giao dịch
    const insertParams: Record<string, any> = {
      MaLS,
      MaSP: maSP,
      LoaiGiaoDich: type,
      SoLuong: Number(soLuong),
      GiaTien: giaTien ? Number(giaTien) : null,
      TongTien: tongTien ? Number(tongTien) : null,
      MaPhieu: maPhieu,
      MaNhanVien: maNhanVien || null,
      GhiChu: ghiChu || null,
      NgayTao: new Date(),
      TrangThaiGiaoDich: 1,
      MaKho: null,
      MaCH: null,
    };

    // Tùy theo loại giao dịch
    if (type === 'nhap') {
      insertParams.MaKho = maKho || null;
    } else if (type === 'xuat') {
      insertParams.MaCH = maCH || null;
    } else if (type === 'chuyen') {
      insertParams.MaKho = maKhoXuat || null; // Kho xuất
      insertParams.MaCH = maKhoNhan || null; // Kho nhận
    }

    const insertSQL = `
      INSERT INTO lichsukho (
        MaLS, MaSP, MaKho, MaCH, LoaiGiaoDich, SoLuong, 
        GiaTien, TongTien, MaPhieu, MaNhanVien, GhiChu, 
        NgayTao, TrangThaiGiaoDich
      ) VALUES (
        @MaLS, @MaSP, @MaKho, @MaCH, @LoaiGiaoDich, @SoLuong,
        @GiaTien, @TongTien, @MaPhieu, @MaNhanVien, @GhiChu,
        @NgayTao, @TrangThaiGiaoDich
      )
    `;

    await dbQuery(insertSQL, insertParams);

    return NextResponse.json({
      ok: true,
      maLS: MaLS,
      message: 'Lịch sử kho được tạo thành công',
    });
  } catch (error: any) {
    console.error('Error creating lichsu kho:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PUT: Cập nhật lịch sử
// ---------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { maLS, trangThai, ghiChu } = body;

    if (!maLS) {
      return NextResponse.json(
        { ok: false, error: 'Cần cung cấp MaLS' },
        { status: 400 }
      );
    }

    const updateSQL = `
      UPDATE lichsukho 
      SET TrangThaiGiaoDich = @trangThai, GhiChu = @ghiChu
      WHERE MaLS = @maLS
    `;

    await dbQuery(updateSQL, {
      maLS,
      trangThai: trangThai ?? 1,
      ghiChu: ghiChu || null,
    });

    return NextResponse.json({
      ok: true,
      message: 'Lịch sử kho được cập nhật thành công',
    });
  } catch (error: any) {
    console.error('Error updating lichsu kho:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// DELETE: Xóa lịch sử
// ---------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { maLS } = body;

    if (!maLS) {
      return NextResponse.json(
        { ok: false, error: 'Cần cung cấp MaLS' },
        { status: 400 }
      );
    }

    const deleteSQL = 'DELETE FROM lichsukho WHERE MaLS = @maLS';
    await dbQuery(deleteSQL, { maLS });

    return NextResponse.json({
      ok: true,
      message: 'Lịch sử kho được xóa thành công',
    });
  } catch (error: any) {
    console.error('Error deleting lichsu kho:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
