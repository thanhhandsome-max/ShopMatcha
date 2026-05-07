import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/permissions';

const ROLE_TABLE_CANDIDATES = ['VaiTro', 'Vai_Tro', 'vaitro'];
const ROLE_PERMISSION_TABLE_CANDIDATES = [
  'VaiTro_Quyen',
  'VaiTroQuyen',
  'VaiTro_PhanQuyen',
  'RolePermission',
  'PhanQuyenVaiTro',
];

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

function roleKeyCandidates(role: any) {
  return [String(role.MaVaiTro || ''), String(role.TenVaiTro || ''), String(role.MaVaiTro || '').toUpperCase()];
}

export async function GET() {
  try {
    const roleTable = await resolveTable(ROLE_TABLE_CANDIDATES);
    if (!roleTable) {
      return NextResponse.json({ ok: false, error: 'VaiTro table not found' }, { status: 500 });
    }

    const roleCols = await getColumns(roleTable);
    const roleIdCol = firstExisting(roleCols, ['MaVaiTro', 'RoleId']);
    const roleNameCol = firstExisting(roleCols, ['TenVaiTro', 'RoleName']);
    const rolePermissionTextCol = firstExisting(roleCols, ['DanhSachQuyen', 'Permissions', 'Quyen']);

    if (!roleIdCol || !roleNameCol) {
      return NextResponse.json({ ok: false, error: 'Role columns not found' }, { status: 500 });
    }

    const selectCols = [
      `${roleIdCol} as MaVaiTro`,
      `${roleNameCol} as TenVaiTro`,
      rolePermissionTextCol ? `${rolePermissionTextCol} as PermissionText` : `NULL as PermissionText`,
    ];

    const roles = await query(`SELECT ${selectCols.join(', ')} FROM ${roleTable} ORDER BY ${roleIdCol}`);

    const rolePermissionTable = await resolveTable(ROLE_PERMISSION_TABLE_CANDIDATES);
    let rolePermissionRows: any[] = [];
    let rolePermRoleCol: string | null = null;
    let rolePermPermissionCol: string | null = null;

    if (rolePermissionTable) {
      const rolePermissionCols = await getColumns(rolePermissionTable);
      rolePermRoleCol = firstExisting(rolePermissionCols, ['MaVaiTro', 'RoleId']);
      rolePermPermissionCol = firstExisting(rolePermissionCols, ['MaQuyen', 'Permission', 'PermissionName', 'Quyen']);

      if (rolePermRoleCol && rolePermPermissionCol) {
        rolePermissionRows = await query(
          `SELECT ${rolePermRoleCol} as MaVaiTro, ${rolePermPermissionCol} as MaQuyen FROM ${rolePermissionTable}`,
        );
      }
    }

    const permissionValues = Object.values(PERMISSIONS);

    const data = (roles || []).map((role: any) => {
      let assignedPermissions: string[] = [];

      if (rolePermissionRows.length > 0) {
        assignedPermissions = rolePermissionRows
          .filter((rp) => String(rp.MaVaiTro) === String(role.MaVaiTro))
          .map((rp) => String(rp.MaQuyen));
      } else if (role.PermissionText) {
        const raw = String(role.PermissionText);
        if (raw.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) assignedPermissions = parsed.map((p) => String(p));
          } catch {
            assignedPermissions = raw
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean);
          }
        } else {
          assignedPermissions = raw
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        }
      } else {
        const key = roleKeyCandidates(role).find((k) => (ROLE_PERMISSIONS as any)[k]);
        assignedPermissions = key ? ((ROLE_PERMISSIONS as any)[key] || []) : [];
      }

      assignedPermissions = assignedPermissions.filter((p) => permissionValues.includes(p as any));

      return {
        MaVaiTro: String(role.MaVaiTro),
        TenVaiTro: String(role.TenVaiTro),
        Permissions: assignedPermissions,
      };
    });

    return NextResponse.json({ ok: true, data, allPermissions: permissionValues });
  } catch (err) {
    console.error('GET /api/tai-khoan/vai-tro error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { MaVaiTro, Permissions } = body || {};

    if (!MaVaiTro || !Array.isArray(Permissions)) {
      return NextResponse.json({ ok: false, error: 'Missing MaVaiTro or Permissions' }, { status: 400 });
    }

    const roleTable = await resolveTable(ROLE_TABLE_CANDIDATES);
    if (!roleTable) {
      return NextResponse.json({ ok: false, error: 'VaiTro table not found' }, { status: 500 });
    }

    const rolePermissionTable = await resolveTable(ROLE_PERMISSION_TABLE_CANDIDATES);

    if (rolePermissionTable) {
      const rolePermissionCols = await getColumns(rolePermissionTable);
      const rolePermRoleCol = firstExisting(rolePermissionCols, ['MaVaiTro', 'RoleId']);
      const rolePermPermissionCol = firstExisting(rolePermissionCols, ['MaQuyen', 'Permission', 'PermissionName', 'Quyen']);

      if (rolePermRoleCol && rolePermPermissionCol) {
        await query(`DELETE FROM ${rolePermissionTable} WHERE ${rolePermRoleCol} = @MaVaiTro`, { MaVaiTro });
        for (const permission of Permissions) {
          await query(
            `INSERT INTO ${rolePermissionTable} (${rolePermRoleCol}, ${rolePermPermissionCol}) VALUES (@MaVaiTro, @Permission)`,
            { MaVaiTro, Permission: String(permission) },
          );
        }
        return NextResponse.json({ ok: true });
      }
    }

    const roleCols = await getColumns(roleTable);
    const roleIdCol = firstExisting(roleCols, ['MaVaiTro', 'RoleId']);
    const rolePermissionTextCol = firstExisting(roleCols, ['DanhSachQuyen', 'Permissions', 'Quyen']);

    if (roleIdCol && rolePermissionTextCol) {
      await query(
        `UPDATE ${roleTable} SET ${rolePermissionTextCol} = @Permissions WHERE ${roleIdCol} = @MaVaiTro`,
        { MaVaiTro, Permissions: JSON.stringify(Permissions) },
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Cannot persist role permissions. Need VaiTro_Quyen table or permission column in VaiTro.',
      },
      { status: 400 },
    );
  } catch (err) {
    console.error('PUT /api/tai-khoan/vai-tro error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}
