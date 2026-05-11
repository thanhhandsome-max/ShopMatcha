import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function tableExists(tableName: string) {
  const rs = await query<{ name: string }>(
    `SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tableName`,
    { tableName }
  );
  return rs.length > 0;
}

async function resolveTable(candidates: string[]) {
  for (const name of candidates) {
    if (await tableExists(name)) return name;
  }
  return null;
}

async function resolveTransactionTables() {
  const phieuNhapTable = await resolveTable(['PhieuNhap', 'Phieu_Nhap']);
  const ctPhieuNhapTable = await resolveTable([
    'ChiTietPhieuNhap',
    'CT_PhieuNhap',
    'ChiTiet_PhieuNhap',
  ]);

  return { phieuNhapTable, ctPhieuNhapTable };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const maSP = searchParams.get('maSP');
    const maNPP = searchParams.get('maNPP');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const { phieuNhapTable, ctPhieuNhapTable } = await resolveTransactionTables();

    if (!phieuNhapTable || !ctPhieuNhapTable) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Không tìm thấy bảng phiếu nhập hoặc chi tiết phiếu nhập trong database.',
        },
        { status: 500 }
      );
    }

    let sql = `
      SELECT 
        PN.MaPN,
        PN.MaNPP,
        PN.MaNV,
        PN.TongTien as TongTienPN,
        PN.NgayTao,
        PN.TrangThai,
        CTPN.MaSP,
        CTPN.SoLuong,
        CTPN.TongTien as ThanhTien,
        SP.TenSanPham,
        NV.HoTen,
        NPP.TenNPP,
        TK.MaKho,
        K.TenKho,
        CASE
          WHEN ISNULL(CTPN.SoLuong, 0) = 0 THEN 0
          ELSE CAST(CAST(CTPN.TongTien AS FLOAT) / CAST(CTPN.SoLuong AS FLOAT) AS DECIMAL(18, 2))
        END as GiaNhap
      FROM ${phieuNhapTable} PN
      LEFT JOIN ${ctPhieuNhapTable} CTPN ON PN.MaPN = CTPN.MaPN
      LEFT JOIN SanPham SP ON CTPN.MaSP = SP.MaSP
      LEFT JOIN NhanVien NV ON PN.MaNV = NV.MaNV
      LEFT JOIN NhaPhanPhoi NPP ON PN.MaNPP = NPP.MaNPP
      LEFT JOIN TonKho TK ON CTPN.MaSP = TK.MaSP
      LEFT JOIN Kho K ON TK.MaKho = K.MaKho
      WHERE 1=1
    `;

    const params: Record<string, string> = {};

    if (maSP && maSP.trim()) {
      sql += ` AND (SP.MaSP LIKE @maSP OR SP.TenSanPham LIKE @maSP)`;
      params.maSP = `%${maSP}%`;
    }

    if (maNPP && maNPP.trim()) {
      sql += ` AND PN.MaNPP = @maNPP`;
      params.maNPP = maNPP;
    }

    if (fromDate) {
      sql += ` AND CAST(PN.NgayTao AS DATE) >= @fromDate`;
      params.fromDate = fromDate;
    }

    if (toDate) {
      sql += ` AND CAST(PN.NgayTao AS DATE) <= @toDate`;
      params.toDate = toDate;
    }

    sql += ` ORDER BY PN.NgayTao DESC, PN.MaPN DESC, CTPN.MaSP ASC`;

    console.log('Transaction history query:', sql);
    console.log('Params:', params);

    const results = await query(sql, params);

    console.log('Transaction history results:', results);

    return NextResponse.json({
      ok: true,
      data: results || [],
    });
  } catch (error) {
    console.error('Transaction history API error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const maPN = body?.MaPN;
    const maSP = body?.MaSP;
    const soLuong = Number(body?.SoLuong);
    const tongTien = Number(body?.TongTien);

    if (!maPN || !maSP || Number.isNaN(soLuong) || Number.isNaN(tongTien)) {
      return NextResponse.json(
        { ok: false, error: 'Missing MaPN, MaSP, SoLuong or TongTien' },
        { status: 400 }
      );
    }

    const { ctPhieuNhapTable } = await resolveTransactionTables();
    if (!ctPhieuNhapTable) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy bảng chi tiết phiếu nhập trong database.' },
        { status: 500 }
      );
    }

    await query(
      `UPDATE ${ctPhieuNhapTable} SET SoLuong = @SoLuong, TongTien = @TongTien WHERE MaPN = @MaPN AND MaSP = @MaSP`,
      { MaPN: maPN, MaSP: maSP, SoLuong: soLuong, TongTien: tongTien }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Transaction history update error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const maPN = body?.MaPN;
    const maSP = body?.MaSP;

    if (!maPN || !maSP) {
      return NextResponse.json({ ok: false, error: 'Missing MaPN or MaSP' }, { status: 400 });
    }

    const { ctPhieuNhapTable } = await resolveTransactionTables();
    if (!ctPhieuNhapTable) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy bảng chi tiết phiếu nhập trong database.' },
        { status: 500 }
      );
    }

    await query(`DELETE FROM ${ctPhieuNhapTable} WHERE MaPN = @MaPN AND MaSP = @MaSP`, {
      MaPN: maPN,
      MaSP: maSP,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Transaction history delete error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
