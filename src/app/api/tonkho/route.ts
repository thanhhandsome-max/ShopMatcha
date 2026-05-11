// src/app/api/tonkho/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE = 'tonkho';

async function getAvailableColumns() {
  try {
    const result = await query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`, { table: TABLE });
    return result?.map((r: any) => r.COLUMN_NAME) || [];
  } catch (err) {
    console.error('Error detecting columns for tonkho:', err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const columns = await getAvailableColumns();
    // Default columns expected
    const defaultCols = ['MaKho', 'MaSP', 'SoLuong', 'NgayCapNhat'];
    const selected = defaultCols.filter((c) => columns.includes(c));
    // if table has additional useful columns, include them
    if (columns.includes('GhiChu')) selected.push('GhiChu');

    const sql = `SELECT ${selected.join(', ')} FROM ${TABLE}`;
    console.log('tonkho GET SQL:', sql);
    const data = await query(sql);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // minimal validation
    if (!body?.MaKho || !body?.MaSP || typeof body?.SoLuong === 'undefined') {
      return NextResponse.json({ ok: false, error: 'Missing MaKho, MaSP or SoLuong' }, { status: 400 });
    }

    const columns = await getAvailableColumns();
    const hasGhiChu = columns.includes('GhiChu');
    const hasNgay = columns.includes('NgayCapNhat');

    if (hasGhiChu && hasNgay) {
      await query(`INSERT INTO ${TABLE} (MaKho, MaSP, SoLuong, GhiChu, NgayCapNhat) VALUES (@MaKho, @MaSP, @SoLuong, @GhiChu, @NgayCapNhat)`, {
        MaKho: body.MaKho,
        MaSP: body.MaSP,
        SoLuong: body.SoLuong,
        GhiChu: body.GhiChu || null,
        NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
      });
    } else if (hasGhiChu) {
      await query(`INSERT INTO ${TABLE} (MaKho, MaSP, SoLuong, GhiChu) VALUES (@MaKho, @MaSP, @SoLuong, @GhiChu)`, {
        MaKho: body.MaKho,
        MaSP: body.MaSP,
        SoLuong: body.SoLuong,
        GhiChu: body.GhiChu || null,
      });
    } else if (hasNgay) {
      await query(`INSERT INTO ${TABLE} (MaKho, MaSP, SoLuong, NgayCapNhat) VALUES (@MaKho, @MaSP, @SoLuong, @NgayCapNhat)`, {
        MaKho: body.MaKho,
        MaSP: body.MaSP,
        SoLuong: body.SoLuong,
        NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
      });
    } else {
      await query(`INSERT INTO ${TABLE} (MaKho, MaSP, SoLuong) VALUES (@MaKho, @MaSP, @SoLuong)`, {
        MaKho: body.MaKho,
        MaSP: body.MaSP,
        SoLuong: body.SoLuong,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body?.MaKho || !body?.MaSP) {
      return NextResponse.json({ ok: false, error: 'Missing MaKho or MaSP' }, { status: 400 });
    }

    const columns = await getAvailableColumns();
    const hasGhiChu = columns.includes('GhiChu');
    const hasNgay = columns.includes('NgayCapNhat');

    // update SoLuong and optional fields
    if (typeof body.SoLuong === 'undefined') {
      return NextResponse.json({ ok: false, error: 'Missing SoLuong' }, { status: 400 });
    }

    if (hasGhiChu && hasNgay) {
      await query(`UPDATE ${TABLE} SET SoLuong = @SoLuong, GhiChu = @GhiChu, NgayCapNhat = @NgayCapNhat WHERE MaKho = @MaKho AND MaSP = @MaSP`, {
        SoLuong: body.SoLuong,
        GhiChu: body.GhiChu || null,
        NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
        MaKho: body.MaKho,
        MaSP: body.MaSP,
      });
    } else if (hasGhiChu) {
      await query(`UPDATE ${TABLE} SET SoLuong = @SoLuong, GhiChu = @GhiChu WHERE MaKho = @MaKho AND MaSP = @MaSP`, {
        SoLuong: body.SoLuong,
        GhiChu: body.GhiChu || null,
        MaKho: body.MaKho,
        MaSP: body.MaSP,
      });
    } else if (hasNgay) {
      await query(`UPDATE ${TABLE} SET SoLuong = @SoLuong, NgayCapNhat = @NgayCapNhat WHERE MaKho = @MaKho AND MaSP = @MaSP`, {
        SoLuong: body.SoLuong,
        NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
        MaKho: body.MaKho,
        MaSP: body.MaSP,
      });
    } else {
      await query(`UPDATE ${TABLE} SET SoLuong = @SoLuong WHERE MaKho = @MaKho AND MaSP = @MaSP`, {
        SoLuong: body.SoLuong,
        MaKho: body.MaKho,
        MaSP: body.MaSP,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body?.MaKho || !body?.MaSP) {
      return NextResponse.json({ ok: false, error: 'Missing MaKho or MaSP' }, { status: 400 });
    }

    await query(`DELETE FROM ${TABLE} WHERE MaKho = @MaKho AND MaSP = @MaSP`, { MaKho: body.MaKho, MaSP: body.MaSP });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
