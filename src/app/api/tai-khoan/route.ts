import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const ACCOUNT_TABLE_CANDIDATES = ['TaiKhoan', 'Tai_Khoan', 'taikhoan'];
const ROLE_TABLE_CANDIDATES = ['VaiTro', 'Vai_Tro', 'vaitro'];
const ACCOUNT_ROLE_TABLE_CANDIDATES = ['PhanQuyen', 'Phan_Quyen', 'phanquyen'];

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
    const accountTable = await resolveTable(ACCOUNT_TABLE_CANDIDATES);
    const roleTable = await resolveTable(ROLE_TABLE_CANDIDATES);
    const accountRoleTable = await resolveTable(ACCOUNT_ROLE_TABLE_CANDIDATES);

    if (!accountTable) {
      return NextResponse.json({ ok: false, error: 'TaiKhoan table not found' }, { status: 500 });
    }

    const accountCols = await getColumns(accountTable);
    const roleCols = roleTable ? await getColumns(roleTable) : [];
    const accountRoleCols = accountRoleTable ? await getColumns(accountRoleTable) : [];

    const accountIdCol = firstExisting(accountCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
    const usernameCol = firstExisting(accountCols, ['TenDangNhap', 'Username', 'TaiKhoan']);
    const passwordCol = firstExisting(accountCols, ['MatKhau', 'Password', 'Matkhau']);
    const statusCol = firstExisting(accountCols, ['TrangThai', 'Status', 'KichHoat']);
    const createdAtCol = firstExisting(accountCols, ['NgayTao', 'CreatedAt', 'NgayCapNhat']);

    if (!accountIdCol || !usernameCol) {
      return NextResponse.json({ ok: false, error: 'Required account columns not found' }, { status: 500 });
    }

    const accountRoleAccountCol = firstExisting(accountRoleCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
    const accountRoleRoleCol = firstExisting(accountRoleCols, ['MaVaiTro', 'RoleId', 'VaiTro']);

    const roleIdCol = firstExisting(roleCols, ['MaVaiTro', 'RoleId']);
    const roleNameCol = firstExisting(roleCols, ['TenVaiTro', 'RoleName']);

    const selectCols: string[] = [
      `a.${accountIdCol} as MaTK`,
      `a.${usernameCol} as TenDangNhap`,
      statusCol ? `a.${statusCol} as TrangThai` : 'CAST(1 as int) as TrangThai',
      createdAtCol ? `a.${createdAtCol} as NgayTao` : 'NULL as NgayTao',
      passwordCol ? `a.${passwordCol} as MatKhau` : 'NULL as MatKhau',
    ];

    if (roleTable && accountRoleTable && accountRoleAccountCol && accountRoleRoleCol && roleIdCol) {
      selectCols.push(`ar.${accountRoleRoleCol} as MaVaiTro`);
      if (roleNameCol) {
        selectCols.push(`r.${roleNameCol} as TenVaiTro`);
      } else {
        selectCols.push(`ar.${accountRoleRoleCol} as TenVaiTro`);
      }
    } else {
      selectCols.push(`NULL as MaVaiTro`, `NULL as TenVaiTro`);
    }

    let sql = `SELECT ${selectCols.join(', ')} FROM ${accountTable} a`;
    if (roleTable && accountRoleTable && accountRoleAccountCol && accountRoleRoleCol && roleIdCol) {
      sql += ` LEFT JOIN ${accountRoleTable} ar ON a.${accountIdCol} = ar.${accountRoleAccountCol}`;
      sql += ` LEFT JOIN ${roleTable} r ON ar.${accountRoleRoleCol} = r.${roleIdCol}`;
    }
    sql += ` ORDER BY a.${accountIdCol} DESC`;

    const data = await query(sql);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('GET /api/tai-khoan error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { MaTK, TenDangNhap, MatKhau, TrangThai, MaVaiTro } = body || {};

    if (!MaTK || !TenDangNhap || !MatKhau) {
      return NextResponse.json({ ok: false, error: 'Missing MaTK, TenDangNhap or MatKhau' }, { status: 400 });
    }

    const accountTable = await resolveTable(ACCOUNT_TABLE_CANDIDATES);
    const accountRoleTable = await resolveTable(ACCOUNT_ROLE_TABLE_CANDIDATES);

    if (!accountTable) {
      return NextResponse.json({ ok: false, error: 'TaiKhoan table not found' }, { status: 500 });
    }

    const accountCols = await getColumns(accountTable);
    const accountIdCol = firstExisting(accountCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
    const usernameCol = firstExisting(accountCols, ['TenDangNhap', 'Username', 'TaiKhoan']);
    const passwordCol = firstExisting(accountCols, ['MatKhau', 'Password', 'Matkhau']);
    const statusCol = firstExisting(accountCols, ['TrangThai', 'Status', 'KichHoat']);

    if (!accountIdCol || !usernameCol || !passwordCol) {
      return NextResponse.json({ ok: false, error: 'Required account columns not found' }, { status: 500 });
    }

    const fields = [accountIdCol, usernameCol, passwordCol];
    const values = ['@MaTK', '@TenDangNhap', '@MatKhau'];
    const params: any = { MaTK, TenDangNhap, MatKhau };

    if (statusCol) {
      fields.push(statusCol);
      values.push('@TrangThai');
      params.TrangThai = Number(TrangThai ?? 1);
    }

    await query(`INSERT INTO ${accountTable} (${fields.join(', ')}) VALUES (${values.join(', ')})`, params);

    if (accountRoleTable && MaVaiTro) {
      const accountRoleCols = await getColumns(accountRoleTable);
      const accountRoleAccountCol = firstExisting(accountRoleCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
      const accountRoleRoleCol = firstExisting(accountRoleCols, ['MaVaiTro', 'RoleId', 'VaiTro']);
      if (accountRoleAccountCol && accountRoleRoleCol) {
        await query(
          `INSERT INTO ${accountRoleTable} (${accountRoleAccountCol}, ${accountRoleRoleCol}) VALUES (@MaTK, @MaVaiTro)`,
          { MaTK, MaVaiTro },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/tai-khoan error', err);
    return NextResponse.json({ ok: false, error: 'Create failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { MaTK, TenDangNhap, MatKhau, TrangThai, MaVaiTro } = body || {};

    if (!MaTK) {
      return NextResponse.json({ ok: false, error: 'Missing MaTK' }, { status: 400 });
    }

    const accountTable = await resolveTable(ACCOUNT_TABLE_CANDIDATES);
    const accountRoleTable = await resolveTable(ACCOUNT_ROLE_TABLE_CANDIDATES);

    if (!accountTable) {
      return NextResponse.json({ ok: false, error: 'TaiKhoan table not found' }, { status: 500 });
    }

    const accountCols = await getColumns(accountTable);
    const accountIdCol = firstExisting(accountCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
    const usernameCol = firstExisting(accountCols, ['TenDangNhap', 'Username', 'TaiKhoan']);
    const passwordCol = firstExisting(accountCols, ['MatKhau', 'Password', 'Matkhau']);
    const statusCol = firstExisting(accountCols, ['TrangThai', 'Status', 'KichHoat']);

    if (!accountIdCol) {
      return NextResponse.json({ ok: false, error: 'Account id column not found' }, { status: 500 });
    }

    const sets: string[] = [];
    const params: any = { MaTK };

    if (usernameCol && TenDangNhap !== undefined) {
      sets.push(`${usernameCol} = @TenDangNhap`);
      params.TenDangNhap = TenDangNhap;
    }
    if (passwordCol && MatKhau !== undefined && String(MatKhau).trim()) {
      sets.push(`${passwordCol} = @MatKhau`);
      params.MatKhau = MatKhau;
    }
    if (statusCol && TrangThai !== undefined) {
      sets.push(`${statusCol} = @TrangThai`);
      params.TrangThai = Number(TrangThai);
    }

    if (sets.length > 0) {
      await query(`UPDATE ${accountTable} SET ${sets.join(', ')} WHERE ${accountIdCol} = @MaTK`, params);
    }

    if (accountRoleTable && MaVaiTro !== undefined) {
      const accountRoleCols = await getColumns(accountRoleTable);
      const accountRoleAccountCol = firstExisting(accountRoleCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
      const accountRoleRoleCol = firstExisting(accountRoleCols, ['MaVaiTro', 'RoleId', 'VaiTro']);

      if (accountRoleAccountCol && accountRoleRoleCol) {
        await query(`DELETE FROM ${accountRoleTable} WHERE ${accountRoleAccountCol} = @MaTK`, { MaTK });
        if (String(MaVaiTro).trim()) {
          await query(
            `INSERT INTO ${accountRoleTable} (${accountRoleAccountCol}, ${accountRoleRoleCol}) VALUES (@MaTK, @MaVaiTro)`,
            { MaTK, MaVaiTro },
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/tai-khoan error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { MaTK } = body || {};

    if (!MaTK) {
      return NextResponse.json({ ok: false, error: 'Missing MaTK' }, { status: 400 });
    }

    const accountTable = await resolveTable(ACCOUNT_TABLE_CANDIDATES);
    const accountRoleTable = await resolveTable(ACCOUNT_ROLE_TABLE_CANDIDATES);

    if (!accountTable) {
      return NextResponse.json({ ok: false, error: 'TaiKhoan table not found' }, { status: 500 });
    }

    const accountCols = await getColumns(accountTable);
    const accountIdCol = firstExisting(accountCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
    if (!accountIdCol) {
      return NextResponse.json({ ok: false, error: 'Account id column not found' }, { status: 500 });
    }

    if (accountRoleTable) {
      const accountRoleCols = await getColumns(accountRoleTable);
      const accountRoleAccountCol = firstExisting(accountRoleCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
      if (accountRoleAccountCol) {
        await query(`DELETE FROM ${accountRoleTable} WHERE ${accountRoleAccountCol} = @MaTK`, { MaTK });
      }
    }

    await query(`DELETE FROM ${accountTable} WHERE ${accountIdCol} = @MaTK`, { MaTK });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/tai-khoan error', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
