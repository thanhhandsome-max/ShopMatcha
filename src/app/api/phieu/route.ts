import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Lấy danh sách phiếu nhập/xuất hoặc chi tiết 1 phiếu
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'nhap' | 'xuat'
    const maphieu = searchParams.get('maphieu'); // MaPN hoặc MaPX
    const chitiet = searchParams.get('chitiet') === 'true'; // Lấy chi tiết hay không

    console.log(`[PHIEU API] GET request: type=${type}, maphieu=${maphieu}, chitiet=${chitiet}`);

    if (!type || !['nhap', 'xuat'].includes(type)) {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid type parameter. Use type=nhap or type=xuat' },
        { status: 400 }
      );
    }

    if (type === 'nhap') {
      let phieu;
      if (maphieu) {
        phieu = await query(
          `SELECT MaPN, MaNPP, MaNV, TongTien, NgayTao, TrangThai FROM PhieuNhap WHERE MaPN = @MaPN`,
          { MaPN: maphieu }
        );
      } else {
        phieu = await query(`SELECT MaPN, MaNPP, MaNV, TongTien, NgayTao, TrangThai FROM PhieuNhap`);
      }

      if (chitiet && maphieu) {
        const ct = await query(
          `SELECT MaPN, MaSP, SoLuong, TongTien FROM CT_PhieuNhap WHERE MaPN = @MaPN`,
          { MaPN: maphieu }
        );
        return NextResponse.json({ ok: true, phieu, chitiet: ct });
      }
      return NextResponse.json({ ok: true, phieu });
    }

    if (type === 'xuat') {
      let phieu;
      if (maphieu) {
        phieu = await query(
          `SELECT MaPX, NgayTao, TongTien, TrangThai, MaNV, MaCH FROM PhieuXuat WHERE MaPX = @MaPX`,
          { MaPX: maphieu }
        );
      } else {
        phieu = await query(`SELECT MaPX, NgayTao, TongTien, TrangThai, MaNV, MaCH FROM PhieuXuat`);
      }

      if (chitiet && maphieu) {
        const ct = await query(
          `SELECT MaPX, MaSP, SoLuong FROM CT_PhieuXuat WHERE MaPX = @MaPX`,
          { MaPX: maphieu }
        );
        return NextResponse.json({ ok: true, phieu, chitiet: ct });
      }
      return NextResponse.json({ ok: true, phieu });
    }
  } catch (err: any) {
    console.error('[PHIEU API] GET Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Database error' },
      { status: 500 }
    );
  }
}

// POST: Tạo phiếu nhập/xuất mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, phieu, chitiet } = body;

    console.log(`[PHIEU API] POST request: type=${type}`);

    if (type === 'nhap') {
      const MaPN = 'PN' + Date.now();
      const { MaNPP, MaNV, TongTien, NgayTao, TrangThai } = phieu;

      await query(
        `INSERT INTO PhieuNhap (MaPN, MaNPP, MaNV, TongTien, NgayTao, TrangThai)
         VALUES (@MaPN, @MaNPP, @MaNV, @TongTien, @NgayTao, @TrangThai)`,
        { MaPN, MaNPP, MaNV, TongTien, NgayTao, TrangThai }
      );

      for (const ct of chitiet || []) {
        await query(
          `INSERT INTO CT_PhieuNhap (MaPN, MaSP, SoLuong, TongTien)
           VALUES (@MaPN, @MaSP, @SoLuong, @TongTien)`,
          { MaPN, MaSP: ct.MaSP, SoLuong: ct.SoLuong, TongTien: ct.TongTien }
        );
      }

      return NextResponse.json({ ok: true, success: true, MaPN });
    }

    if (type === 'xuat') {
      const MaPX = 'PX' + Date.now();
      const { NgayTao, TongTien, TrangThai, MaNV, MaCH } = phieu;

      await query(
        `INSERT INTO PhieuXuat (MaPX, NgayTao, TongTien, TrangThai, MaNV, MaCH)
         VALUES (@MaPX, @NgayTao, @TongTien, @TrangThai, @MaNV, @MaCH)`,
        { MaPX, NgayTao, TongTien, TrangThai, MaNV, MaCH }
      );

      for (const ct of chitiet || []) {
        await query(
          `INSERT INTO CT_PhieuXuat (MaPX, MaSP, SoLuong)
           VALUES (@MaPX, @MaSP, @SoLuong)`,
          { MaPX, MaSP: ct.MaSP, SoLuong: ct.SoLuong }
        );
      }

      return NextResponse.json({ ok: true, success: true, MaPX });
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid type - must be nhap or xuat' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[PHIEU API] POST Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to create phieu' },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật phiếu nhập/xuất
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, maphieu, phieu } = body;

    console.log(`[PHIEU API] PUT request: type=${type}, maphieu=${maphieu}`);

    if (type === 'nhap') {
      if (!maphieu) return NextResponse.json({ ok: false, error: 'Missing MaPN' }, { status: 400 });

      const updates: string[] = [];
      const params: any = { MaPN: maphieu };

      if (phieu.TongTien !== undefined) {
        updates.push('TongTien = @TongTien');
        params.TongTien = phieu.TongTien;
      }
      if (phieu.TrangThai !== undefined) {
        updates.push('TrangThai = @TrangThai');
        params.TrangThai = phieu.TrangThai;
      }

      if (updates.length > 0) {
        await query(
          `UPDATE PhieuNhap SET ${updates.join(', ')} WHERE MaPN = @MaPN`,
          params
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (type === 'xuat') {
      if (!maphieu) return NextResponse.json({ ok: false, error: 'Missing MaPX' }, { status: 400 });

      const updates: string[] = [];
      const params: any = { MaPX: maphieu };

      if (phieu.TongTien !== undefined) {
        updates.push('TongTien = @TongTien');
        params.TongTien = phieu.TongTien;
      }
      if (phieu.TrangThai !== undefined) {
        updates.push('TrangThai = @TrangThai');
        params.TrangThai = phieu.TrangThai;
      }

      if (updates.length > 0) {
        await query(
          `UPDATE PhieuXuat SET ${updates.join(', ')} WHERE MaPX = @MaPX`,
          params
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    console.error('[PHIEU API] PUT Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to update phieu' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa phiếu nhập/xuất
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, maphieu } = body;

    console.log(`[PHIEU API] DELETE request: type=${type}, maphieu=${maphieu}`);

    if (type === 'nhap') {
      if (!maphieu) return NextResponse.json({ ok: false, error: 'Missing MaPN' }, { status: 400 });
      
      await query(`DELETE FROM CT_PhieuNhap WHERE MaPN = @MaPN`, { MaPN: maphieu });
      await query(`DELETE FROM PhieuNhap WHERE MaPN = @MaPN`, { MaPN: maphieu });
      
      return NextResponse.json({ ok: true });
    }

    if (type === 'xuat') {
      if (!maphieu) return NextResponse.json({ ok: false, error: 'Missing MaPX' }, { status: 400 });
      
      await query(`DELETE FROM CT_PhieuXuat WHERE MaPX = @MaPX`, { MaPX: maphieu });
      await query(`DELETE FROM PhieuXuat WHERE MaPX = @MaPX`, { MaPX: maphieu });
      
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    console.error('[PHIEU API] DELETE Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to delete phieu' },
      { status: 500 }
    );
  }
}
