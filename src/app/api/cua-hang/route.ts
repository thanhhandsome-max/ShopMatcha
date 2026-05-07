import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE_CANDIDATES = ['CuaHang', 'Cua_Hang', 'cuahang'];

async function resolveTable() {
  for (const t of TABLE_CANDIDATES) {
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

export async function GET() {
  try {
    const table = await resolveTable();
    if (!table) return NextResponse.json({ ok: false, error: 'Table CuaHang not found' }, { status: 500 });

    const cols = await getAvailableColumns(table);
    const select = ['MaCH', 'TenCH'];
    if (cols.includes('DiaChi')) select.push('DiaChi');
    if (cols.includes('SDT')) select.push('SDT');
    if (cols.includes('TruongCH')) select.push('TruongCH');

    const sql = `SELECT ${select.join(', ')} FROM ${table}`;
    const data = await query(sql);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('CuaHang GET error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.MaCH || !body?.TenCH) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });

    const table = await resolveTable();
    if (!table) return NextResponse.json({ ok: false, error: 'Table CuaHang not found' }, { status: 500 });

    const cols = await getAvailableColumns(table);
    const hasDiaChi = cols.includes('DiaChi');
    const hasSDT = cols.includes('SDT');
    const fields: string[] = ['MaCH', 'TenCH'];
    const params: any = { MaCH: body.MaCH, TenCH: body.TenCH };
    if (hasDiaChi) { fields.push('DiaChi'); params.DiaChi = body.DiaChi || null; }
    if (hasSDT) { fields.push('SDT'); params.SDT = body.SDT || null; }

    const placeholders = fields.map((f) => `@${f}`).join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
    await query(sql, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CuaHang POST error', err);
    return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body?.MaCH || !body?.TenCH) return NextResponse.json({ ok: false, error: 'Missing MaCH or TenCH' }, { status: 400 });

    const table = await resolveTable();
    if (!table) return NextResponse.json({ ok: false, error: 'Table CuaHang not found' }, { status: 500 });

    const cols = await getAvailableColumns(table);
    const sets = ['TenCH = @TenCH'];
    const params: any = { MaCH: body.MaCH, TenCH: body.TenCH };
    if (cols.includes('DiaChi')) { sets.push('DiaChi = @DiaChi'); params.DiaChi = body.DiaChi || null; }
    if (cols.includes('SDT')) { sets.push('SDT = @SDT'); params.SDT = body.SDT || null; }

    const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE MaCH = @MaCH`;
    await query(sql, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CuaHang PUT error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body?.MaCH) return NextResponse.json({ ok: false, error: 'Missing MaCH' }, { status: 400 });

    const table = await resolveTable();
    if (!table) return NextResponse.json({ ok: false, error: 'Table CuaHang not found' }, { status: 500 });

    await query(`DELETE FROM ${table} WHERE MaCH = @MaCH`, { MaCH: body.MaCH });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CuaHang DELETE error', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
