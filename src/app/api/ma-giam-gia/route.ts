import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const TABLE = 'MaGiamGia';

// ---------------------------------------------------------
// GET: Lấy danh sách mã giảm giá
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'NgayTao'; // Sắp xếp theo cột nào

    let sqlQuery = `
      SELECT 
        MaGG,
        TenKhuyenMai,
        Ma,
        GiaTriGG,
        LoaiGiaTriGG,
        ThoiHanSuDung,
        SoLuongToiDa,
        SoLanSuDung,
        UuTien,
        DieuKienApDung,
        MoTa,
        TrangThai,
        NgayTao,
        NgayCapNhat
      FROM ${TABLE}
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    if (isActive !== null && isActive !== undefined) {
      sqlQuery += ` AND TrangThai = @isActive`;
      params.isActive = isActive === 'true' ? 1 : 0;
    }

    if (search) {
      sqlQuery += ` AND (Ma LIKE @search OR TenKhuyenMai LIKE @search OR MoTa LIKE @search)`;
      params.search = `%${search}%`;
    }

    sqlQuery += ` ORDER BY ${sort} DESC`;

    const result = await dbQuery(sqlQuery, params);
    const data = (result as any)?.recordset || (Array.isArray(result) ? result : []);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/ma-giam-gia] GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lấy danh sách mã giảm giá' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// POST: Tạo mã giảm giá mới
// ---------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      MaGG,
      TenKhuyenMai,
      Ma,
      GiaTriGG,
      LoaiGiaTriGG,
      ThoiHanSuDung,
      SoLuongToiDa,
      UuTien,
      DieuKienApDung,
      MoTa,
    } = body;

    if (!MaGG || !Ma || GiaTriGG === undefined) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc (MaGG, Ma, GiaTriGG)' },
        { status: 400 }
      );
    }

    const sqlQuery = `
      INSERT INTO ${TABLE} (
        MaGG, TenKhuyenMai, Ma, GiaTriGG, LoaiGiaTriGG, ThoiHanSuDung, 
        SoLuongToiDa, SoLanSuDung, UuTien, DieuKienApDung, MoTa, TrangThai, NgayTao
      )
      VALUES (
        @MaGG, @TenKhuyenMai, @Ma, @GiaTriGG, @LoaiGiaTriGG, @ThoiHanSuDung, 
        @SoLuongToiDa, 0, @UuTien, @DieuKienApDung, @MoTa, 1, GETDATE()
      )
    `;

    const params = {
      MaGG,
      TenKhuyenMai: TenKhuyenMai || '',
      Ma,
      GiaTriGG: Number(GiaTriGG),
      LoaiGiaTriGG: LoaiGiaTriGG || 'amount', // 'amount' hoặc 'percent'
      ThoiHanSuDung: ThoiHanSuDung || null,
      SoLuongToiDa: SoLuongToiDa ? Number(SoLuongToiDa) : null,
      UuTien: UuTien ? Number(UuTien) : 1,
      DieuKienApDung: DieuKienApDung || '',
      MoTa: MoTa || '',
    };

    await dbQuery(sqlQuery, params);
    return NextResponse.json(
      { success: true, message: 'Tạo mã giảm giá thành công', data: body },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API/ma-giam-gia] POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tạo mã giảm giá' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PUT: Cập nhật mã giảm giá
// ---------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      MaGG,
      TenKhuyenMai,
      Ma,
      GiaTriGG,
      LoaiGiaTriGG,
      ThoiHanSuDung,
      SoLuongToiDa,
      UuTien,
      DieuKienApDung,
      MoTa,
      TrangThai,
    } = body;

    if (!MaGG) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã giảm giá' },
        { status: 400 }
      );
    }

    const sqlQuery = `
      UPDATE ${TABLE}
      SET 
        TenKhuyenMai = @TenKhuyenMai,
        Ma = @Ma,
        GiaTriGG = @GiaTriGG,
        LoaiGiaTriGG = @LoaiGiaTriGG,
        ThoiHanSuDung = @ThoiHanSuDung,
        SoLuongToiDa = @SoLuongToiDa,
        UuTien = @UuTien,
        DieuKienApDung = @DieuKienApDung,
        MoTa = @MoTa,
        TrangThai = @TrangThai,
        NgayCapNhat = GETDATE()
      WHERE MaGG = @MaGG
    `;

    const params = {
      MaGG,
      TenKhuyenMai: TenKhuyenMai || '',
      Ma: Ma || '',
      GiaTriGG: GiaTriGG !== undefined ? Number(GiaTriGG) : null,
      LoaiGiaTriGG: LoaiGiaTriGG || 'amount',
      ThoiHanSuDung: ThoiHanSuDung || null,
      SoLuongToiDa: SoLuongToiDa ? Number(SoLuongToiDa) : null,
      UuTien: UuTien ? Number(UuTien) : 1,
      DieuKienApDung: DieuKienApDung || '',
      MoTa: MoTa || '',
      TrangThai: TrangThai !== undefined ? TrangThai : 1,
    };

    await dbQuery(sqlQuery, params);
    return NextResponse.json({ success: true, message: 'Cập nhật mã giảm giá thành công' });
  } catch (error: any) {
    console.error('[API/ma-giam-gia] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật mã giảm giá' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// DELETE: Xóa mã giảm giá
// ---------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const MaGG = searchParams.get('id');

    if (!MaGG) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã giảm giá' },
        { status: 400 }
      );
    }

    const sqlQuery = `DELETE FROM ${TABLE} WHERE MaGG = @MaGG`;
    await dbQuery(sqlQuery, { MaGG });

    return NextResponse.json({ success: true, message: 'Xóa mã giảm giá thành công' });
  } catch (error: any) {
    console.error('[API/ma-giam-gia] DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xóa mã giảm giá' },
      { status: 500 }
    );
  }
}
