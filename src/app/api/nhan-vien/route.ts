import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE_CANDIDATES = ['NhanVien', 'Nhan_Vien', 'nhanvien'];

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

export async function GET(req: Request) {
  try {
    const table = await resolveTable(TABLE_CANDIDATES as string[]);
    if (!table) return NextResponse.json({ ok: false, error: 'NhanVien table not found' }, { status: 500 });

    const cols = await getAvailableColumns(table);
    const select = ['MaNV', 'HoTen'];
    if (cols.includes('SDT')) select.push('SDT');
    if (cols.includes('Email')) select.push('Email');
    if (cols.includes('DiaChi')) select.push('DiaChi');
    if (cols.includes('LuongNen')) select.push('LuongNen');
    if (cols.includes('TrangThai')) select.push('TrangThai');
    if (cols.includes('NgayNhanChuc')) select.push('NgayNhanChuc');

    const sql = `SELECT ${select.join(', ')} FROM ${table}`;
    const data = await query(sql);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('NhanVien GET error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { MaNV, HoTen, SDT, Email, DiaChi, LuongNen, TrangThai } = body || {};
    if (!MaNV || !HoTen) return NextResponse.json({ ok: false, error: 'Missing MaNV or HoTen' }, { status: 400 });

    const table = await resolveTable(TABLE_CANDIDATES as string[]);
    if (!table) return NextResponse.json({ ok: false, error: 'NhanVien table not found' }, { status: 500 });

    const cols = await getAvailableColumns(table);
    const fields = ['MaNV', 'HoTen'];
    const params: any = { MaNV, HoTen };

    if (cols.includes('SDT') && SDT) { fields.push('SDT'); params.SDT = SDT; }
    if (cols.includes('Email') && Email) { fields.push('Email'); params.Email = Email; }
    if (cols.includes('DiaChi') && DiaChi) { fields.push('DiaChi'); params.DiaChi = DiaChi; }
    if (cols.includes('LuongNen') && LuongNen !== undefined) { fields.push('LuongNen'); params.LuongNen = LuongNen; }
    if (cols.includes('TrangThai') && TrangThai !== undefined) { fields.push('TrangThai'); params.TrangThai = TrangThai; }

    const placeholders = fields.map(f => `@${f}`).join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
    await query(sql, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('NhanVien POST error', err);
    return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { MaNV, HoTen, SDT, Email, DiaChi, LuongNen, TrangThai } = body || {};
    if (!MaNV || !HoTen) return NextResponse.json({ ok: false, error: 'Missing MaNV or HoTen' }, { status: 400 });

    const table = await resolveTable(TABLE_CANDIDATES as string[]);
    if (!table) return NextResponse.json({ ok: false, error: 'NhanVien table not found' }, { status: 500 });

    const cols = await getAvailableColumns(table);
    const sets: string[] = ['HoTen = @HoTen'];
    const params: any = { MaNV, HoTen };

    if (cols.includes('SDT') && SDT !== undefined) { sets.push('SDT = @SDT'); params.SDT = SDT; }
    if (cols.includes('Email') && Email !== undefined) { sets.push('Email = @Email'); params.Email = Email; }
    if (cols.includes('DiaChi') && DiaChi !== undefined) { sets.push('DiaChi = @DiaChi'); params.DiaChi = DiaChi; }
    if (cols.includes('LuongNen') && LuongNen !== undefined) { sets.push('LuongNen = @LuongNen'); params.LuongNen = LuongNen; }
    if (cols.includes('TrangThai') && TrangThai !== undefined) { sets.push('TrangThai = @TrangThai'); params.TrangThai = TrangThai; }

    const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE MaNV = @MaNV`;
    await query(sql, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('NhanVien PUT error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { MaNV } = body || {};
    if (!MaNV) return NextResponse.json({ ok: false, error: 'Missing MaNV' }, { status: 400 });

    const table = await resolveTable(TABLE_CANDIDATES as string[]);
    if (!table) return NextResponse.json({ ok: false, error: 'NhanVien table not found' }, { status: 500 });

    await query(`DELETE FROM ${table} WHERE MaNV = @MaNV`, { MaNV });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('NhanVien DELETE error', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
