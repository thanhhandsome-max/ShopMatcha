import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const CUSTOMER_TABLE_CANDIDATES = ['KhachHang', 'Khach_Hang', 'khachhang'];

async function resolveTable(candidates: string[]) {
  for (const table of candidates) {
    const rs = await query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @table`, { table });
    if (rs && rs.length > 0) return table;
  }
  return null;
}

async function getColumns(table: string) {
  const rs = await query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`, { table });
  return (rs || []).map((r: any) => r.COLUMN_NAME as string);
}

function firstExisting(columns: string[], candidates: string[]) {
  return candidates.find((c) => columns.includes(c)) || null;
}

export async function GET() {
  try {
    const table = await resolveTable(CUSTOMER_TABLE_CANDIDATES);
    if (!table) return NextResponse.json({ ok: false, error: 'KhachHang table not found' }, { status: 500 });

    const cols = await getColumns(table);

    const idCol = firstExisting(cols, ['MaKH', 'Makh', 'CustomerId']);
    const nameCol = firstExisting(cols, ['TenKH', 'HoTen', 'TenKhachHang', 'Name']);
    const phoneCol = firstExisting(cols, ['SDT', 'SoDienThoai', 'Phone']);
    const birthCol = firstExisting(cols, ['NgaySinh', 'BirthDate']);
    const genderCol = firstExisting(cols, ['GioiTinh', 'Gender']);
    const addressCol = firstExisting(cols, ['DiaChi', 'Address']);
    const emailCol = firstExisting(cols, ['Email']);
    const createdCol = firstExisting(cols, ['NgayTao', 'CreatedAt']);
    const statusCol = firstExisting(cols, ['TrangThai', 'Status']);

    if (!idCol || !nameCol) {
      return NextResponse.json({ ok: false, error: 'Required customer columns not found' }, { status: 500 });
    }

    const selectCols = [
      `${idCol} as MaKH`,
      `${nameCol} as TenKH`,
      phoneCol ? `${phoneCol} as SDT` : `NULL as SDT`,
      birthCol ? `${birthCol} as NgaySinh` : `NULL as NgaySinh`,
      genderCol ? `${genderCol} as GioiTinh` : `NULL as GioiTinh`,
      addressCol ? `${addressCol} as DiaChi` : `NULL as DiaChi`,
      emailCol ? `${emailCol} as Email` : `NULL as Email`,
      createdCol ? `${createdCol} as NgayTao` : `NULL as NgayTao`,
      statusCol ? `${statusCol} as TrangThai` : `CAST(1 as int) as TrangThai`,
    ];

    const sql = `SELECT ${selectCols.join(', ')} FROM ${table} ORDER BY ${idCol} DESC`;
    const data = await query(sql);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('GET /api/khach-hang error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { MaKH, TenKH, SDT, NgaySinh, GioiTinh, DiaChi, Email, TrangThai } = body || {};

    if (!MaKH || !TenKH) {
      return NextResponse.json({ ok: false, error: 'Missing MaKH or TenKH' }, { status: 400 });
    }

    const table = await resolveTable(CUSTOMER_TABLE_CANDIDATES);
    if (!table) return NextResponse.json({ ok: false, error: 'KhachHang table not found' }, { status: 500 });

    const cols = await getColumns(table);
    const idCol = firstExisting(cols, ['MaKH', 'Makh', 'CustomerId']);
    const nameCol = firstExisting(cols, ['TenKH', 'HoTen', 'TenKhachHang', 'Name']);
    const phoneCol = firstExisting(cols, ['SDT', 'SoDienThoai', 'Phone']);
    const birthCol = firstExisting(cols, ['NgaySinh', 'BirthDate']);
    const genderCol = firstExisting(cols, ['GioiTinh', 'Gender']);
    const addressCol = firstExisting(cols, ['DiaChi', 'Address']);
    const emailCol = firstExisting(cols, ['Email']);
    const createdCol = firstExisting(cols, ['NgayTao', 'CreatedAt']);
    const statusCol = firstExisting(cols, ['TrangThai', 'Status']);

    if (!idCol || !nameCol) {
      return NextResponse.json({ ok: false, error: 'Required customer columns not found' }, { status: 500 });
    }

    const fields = [idCol, nameCol];
    const values = ['@MaKH', '@TenKH'];
    const params: any = { MaKH, TenKH };

    if (phoneCol) {
      fields.push(phoneCol);
      values.push('@SDT');
      params.SDT = SDT ?? null;
    }
    if (birthCol) {
      fields.push(birthCol);
      values.push('@NgaySinh');
      params.NgaySinh = NgaySinh || null;
    }
    if (genderCol) {
      fields.push(genderCol);
      values.push('@GioiTinh');
      params.GioiTinh = GioiTinh ?? null;
    }
    if (addressCol) {
      fields.push(addressCol);
      values.push('@DiaChi');
      params.DiaChi = DiaChi ?? null;
    }
    if (emailCol) {
      fields.push(emailCol);
      values.push('@Email');
      params.Email = Email ?? null;
    }
    if (createdCol) {
      fields.push(createdCol);
      values.push('@NgayTao');
      params.NgayTao = new Date();
    }
    if (statusCol) {
      fields.push(statusCol);
      values.push('@TrangThai');
      params.TrangThai = Number(TrangThai ?? 1);
    }

    await query(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/khach-hang error', err);
    return NextResponse.json({ ok: false, error: 'Create failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { MaKH, TenKH, SDT, NgaySinh, GioiTinh, DiaChi, Email, TrangThai } = body || {};

    if (!MaKH) {
      return NextResponse.json({ ok: false, error: 'Missing MaKH' }, { status: 400 });
    }

    const table = await resolveTable(CUSTOMER_TABLE_CANDIDATES);
    if (!table) return NextResponse.json({ ok: false, error: 'KhachHang table not found' }, { status: 500 });

    const cols = await getColumns(table);
    const idCol = firstExisting(cols, ['MaKH', 'Makh', 'CustomerId']);
    const nameCol = firstExisting(cols, ['TenKH', 'HoTen', 'TenKhachHang', 'Name']);
    const phoneCol = firstExisting(cols, ['SDT', 'SoDienThoai', 'Phone']);
    const birthCol = firstExisting(cols, ['NgaySinh', 'BirthDate']);
    const genderCol = firstExisting(cols, ['GioiTinh', 'Gender']);
    const addressCol = firstExisting(cols, ['DiaChi', 'Address']);
    const emailCol = firstExisting(cols, ['Email']);
    const statusCol = firstExisting(cols, ['TrangThai', 'Status']);

    if (!idCol) {
      return NextResponse.json({ ok: false, error: 'Customer id column not found' }, { status: 500 });
    }

    const sets: string[] = [];
    const params: any = { MaKH };

    if (nameCol && TenKH !== undefined) {
      sets.push(`${nameCol} = @TenKH`);
      params.TenKH = TenKH;
    }
    if (phoneCol && SDT !== undefined) {
      sets.push(`${phoneCol} = @SDT`);
      params.SDT = SDT;
    }
    if (birthCol && NgaySinh !== undefined) {
      sets.push(`${birthCol} = @NgaySinh`);
      params.NgaySinh = NgaySinh || null;
    }
    if (genderCol && GioiTinh !== undefined) {
      sets.push(`${genderCol} = @GioiTinh`);
      params.GioiTinh = GioiTinh;
    }
    if (addressCol && DiaChi !== undefined) {
      sets.push(`${addressCol} = @DiaChi`);
      params.DiaChi = DiaChi;
    }
    if (emailCol && Email !== undefined) {
      sets.push(`${emailCol} = @Email`);
      params.Email = Email;
    }
    if (statusCol && TrangThai !== undefined) {
      sets.push(`${statusCol} = @TrangThai`);
      params.TrangThai = Number(TrangThai);
    }

    if (sets.length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 });
    }

    await query(`UPDATE ${table} SET ${sets.join(', ')} WHERE ${idCol} = @MaKH`, params);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/khach-hang error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { MaKH } = body || {};

    if (!MaKH) {
      return NextResponse.json({ ok: false, error: 'Missing MaKH' }, { status: 400 });
    }

    const table = await resolveTable(CUSTOMER_TABLE_CANDIDATES);
    if (!table) return NextResponse.json({ ok: false, error: 'KhachHang table not found' }, { status: 500 });

    const cols = await getColumns(table);
    const idCol = firstExisting(cols, ['MaKH', 'Makh', 'CustomerId']);
    if (!idCol) {
      return NextResponse.json({ ok: false, error: 'Customer id column not found' }, { status: 500 });
    }

    await query(`DELETE FROM ${table} WHERE ${idCol} = @MaKH`, { MaKH });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/khach-hang error', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
