import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const LINK_TABLE_CANDIDATES = ['CuaHang_NhanVien', 'CuaHangNhanVien', 'cuahang_nhanvien'];
const EMP_TABLE_CANDIDATES = ['NhanVien', 'Nhan_Vien', 'nhanvien'];

async function resolveTable(candidates: string[]) {
  for (const t of candidates) {
    const r = await query(`SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @t`, { t });
    if (r && r.length > 0) return t;
  }
  return null;
}

async function getAvailableColumns(table: string) {
  try {
    const result = await query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`, { table });
    return result?.map((r: any) => r.COLUMN_NAME) || [];
  } catch (err) {
    console.error('Error detecting columns for', table, err);
    return [];
  }
}

async function hasStoreManager(linkTable: string, maCH: string, excludeMaNV?: string) {
  const excludeClause = excludeMaNV ? ' AND MaNV <> @ExcludeMaNV' : '';
  const rows = await query(
    `SELECT TOP 1 MaNV FROM ${linkTable} WHERE MaCH = @MaCH AND ChucVu = 1${excludeClause}`,
    excludeMaNV ? { MaCH: maCH, ExcludeMaNV: excludeMaNV } : { MaCH: maCH }
  );
  return Array.isArray(rows) && rows.length > 0;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const maCH = url.searchParams.get('maCH');

    const linkTable = await resolveTable(LINK_TABLE_CANDIDATES as string[]);
    if (!linkTable) return NextResponse.json({ ok: false, error: 'CuaHang_NhanVien table not found' }, { status: 500 });

    const empTable = await resolveTable(EMP_TABLE_CANDIDATES as string[]);
    if (!empTable) return NextResponse.json({ ok: false, error: 'NhanVien table not found' }, { status: 500 });

    const linkCols = await getAvailableColumns(linkTable);
    const select = ['ch_nv.MaCH', 'ch_nv.MaNV', 'nv.HoTen', 'nv.SDT', 'nv.Email'];
    if (linkCols.includes('ChucVu')) select.push('ch_nv.ChucVu');
    if (linkCols.includes('TrangThai')) select.push('ch_nv.TrangThai');
    if (linkCols.includes('NgayNhanChuc')) select.push('ch_nv.NgayNhanChuc');

    const sql = maCH
      ? `SELECT ${select.join(', ')} FROM ${linkTable} ch_nv LEFT JOIN ${empTable} nv ON ch_nv.MaNV = nv.MaNV WHERE ch_nv.MaCH = @MaCH`
      : `SELECT ${select.join(', ')} FROM ${linkTable} ch_nv LEFT JOIN ${empTable} nv ON ch_nv.MaNV = nv.MaNV`;

    const data = await query(sql, maCH ? { MaCH: maCH } : undefined);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('CuaHang_NhanVien GET error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { MaCH, MaNV, ChucVu } = body || {};
    if (!MaCH || !MaNV) return NextResponse.json({ ok: false, error: 'Missing MaCH or MaNV' }, { status: 400 });

    const linkTable = await resolveTable(LINK_TABLE_CANDIDATES as string[]);
    if (!linkTable) return NextResponse.json({ ok: false, error: 'CuaHang_NhanVien table not found' }, { status: 500 });

    const linkCols = await getAvailableColumns(linkTable);
    const finalChucVu = ChucVu !== undefined ? ChucVu : 0;

    if (linkCols.includes('ChucVu') && finalChucVu === 1 && await hasStoreManager(linkTable, MaCH)) {
      return NextResponse.json({ ok: false, error: 'Mỗi cửa hàng chỉ được có 1 trưởng cửa hàng' }, { status: 409 });
    }

    const fields = ['MaCH', 'MaNV'];
    const params: any = { MaCH, MaNV };
    if (linkCols.includes('ChucVu') && ChucVu !== undefined) {
      fields.push('ChucVu');
      params.ChucVu = ChucVu;
    }
    if (linkCols.includes('TrangThai')) {
      fields.push('TrangThai');
      params.TrangThai = 1; // mặc định đang làm
    }

    const placeholders = fields.map(f => `@${f}`).join(', ');
    const sql = `INSERT INTO ${linkTable} (${fields.join(', ')}) VALUES (${placeholders})`;
    await query(sql, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CuaHang_NhanVien POST error', err);
    return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { MaCH, MaNV, ChucVu, TrangThai } = body || {};
    if (!MaCH || !MaNV) return NextResponse.json({ ok: false, error: 'Missing MaCH or MaNV' }, { status: 400 });

    const linkTable = await resolveTable(LINK_TABLE_CANDIDATES as string[]);
    if (!linkTable) return NextResponse.json({ ok: false, error: 'CuaHang_NhanVien table not found' }, { status: 500 });

    const linkCols = await getAvailableColumns(linkTable);
    const sets: string[] = [];
    const params: any = { MaCH, MaNV };

    if (linkCols.includes('ChucVu') && ChucVu !== undefined) {
      sets.push('ChucVu = @ChucVu');
      params.ChucVu = ChucVu;
    }
    if (linkCols.includes('TrangThai') && TrangThai !== undefined) {
      sets.push('TrangThai = @TrangThai');
      params.TrangThai = TrangThai;
    }

    if (sets.length === 0) return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 });

    const sql = `UPDATE ${linkTable} SET ${sets.join(', ')} WHERE MaCH = @MaCH AND MaNV = @MaNV`;
    await query(sql, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CuaHang_NhanVien PUT error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { MaCH, MaNV } = body || {};
    if (!MaCH || !MaNV) return NextResponse.json({ ok: false, error: 'Missing MaCH or MaNV' }, { status: 400 });

    const linkTable = await resolveTable(LINK_TABLE_CANDIDATES as string[]);
    if (!linkTable) return NextResponse.json({ ok: false, error: 'CuaHang_NhanVien table not found' }, { status: 500 });

    await query(`DELETE FROM ${linkTable} WHERE MaCH = @MaCH AND MaNV = @MaNV`, { MaCH, MaNV });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CuaHang_NhanVien DELETE error', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
