import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE = 'NhaPhanPhoi';

async function getAvailableColumns() {
  try {
    const result = await query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`,
      { table: TABLE }
    );
    return result?.map((row: any) => row.COLUMN_NAME) || [];
  } catch (err) {
    console.error('Error detecting columns for NhaPhanPhoi:', err);
    return ['MaNPP', 'TenNPP'];
  }
}

export async function GET() {
  try {
    const columns = await getAvailableColumns();
    const selectedColumns = ['MaNPP', 'TenNPP'];

    if (columns.includes('DiaChi')) selectedColumns.push('DiaChi');
    if (columns.includes('SDT')) selectedColumns.push('SDT');

    const sql = `SELECT ${selectedColumns.join(', ')} FROM ${TABLE}`;
    console.log('[GET /api/nha-phan-phoi] SQL:', sql);

    const data = await query(sql);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('GET /api/nha-phan-phoi error:', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.MaNPP || !body?.TenNPP) {
      return NextResponse.json({ ok: false, error: 'Missing MaNPP or TenNPP' }, { status: 400 });
    }

    const columns = await getAvailableColumns();
    const hasDiaChi = columns.includes('DiaChi');
    const hasSDT = columns.includes('SDT');

    if (hasDiaChi && hasSDT) {
      await query(
        `INSERT INTO ${TABLE} (MaNPP, TenNPP, DiaChi, SDT) VALUES (@MaNPP, @TenNPP, @DiaChi, @SDT)`,
        {
          MaNPP: body.MaNPP,
          TenNPP: body.TenNPP,
          DiaChi: body.DiaChi || null,
          SDT: body.SDT || null,
        }
      );
    } else if (hasDiaChi) {
      await query(
        `INSERT INTO ${TABLE} (MaNPP, TenNPP, DiaChi) VALUES (@MaNPP, @TenNPP, @DiaChi)`,
        {
          MaNPP: body.MaNPP,
          TenNPP: body.TenNPP,
          DiaChi: body.DiaChi || null,
        }
      );
    } else if (hasSDT) {
      await query(
        `INSERT INTO ${TABLE} (MaNPP, TenNPP, SDT) VALUES (@MaNPP, @TenNPP, @SDT)`,
        {
          MaNPP: body.MaNPP,
          TenNPP: body.TenNPP,
          SDT: body.SDT || null,
        }
      );
    } else {
      await query(`INSERT INTO ${TABLE} (MaNPP, TenNPP) VALUES (@MaNPP, @TenNPP)`, {
        MaNPP: body.MaNPP,
        TenNPP: body.TenNPP,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/nha-phan-phoi error:', err);
    return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body?.MaNPP || !body?.TenNPP) {
      return NextResponse.json({ ok: false, error: 'Missing MaNPP or TenNPP' }, { status: 400 });
    }

    const columns = await getAvailableColumns();
    const hasDiaChi = columns.includes('DiaChi');
    const hasSDT = columns.includes('SDT');

    if (hasDiaChi && hasSDT) {
      await query(
        `UPDATE ${TABLE} SET TenNPP = @TenNPP, DiaChi = @DiaChi, SDT = @SDT WHERE MaNPP = @MaNPP`,
        {
          MaNPP: body.MaNPP,
          TenNPP: body.TenNPP,
          DiaChi: body.DiaChi || null,
          SDT: body.SDT || null,
        }
      );
    } else if (hasDiaChi) {
      await query(
        `UPDATE ${TABLE} SET TenNPP = @TenNPP, DiaChi = @DiaChi WHERE MaNPP = @MaNPP`,
        {
          MaNPP: body.MaNPP,
          TenNPP: body.TenNPP,
          DiaChi: body.DiaChi || null,
        }
      );
    } else if (hasSDT) {
      await query(
        `UPDATE ${TABLE} SET TenNPP = @TenNPP, SDT = @SDT WHERE MaNPP = @MaNPP`,
        {
          MaNPP: body.MaNPP,
          TenNPP: body.TenNPP,
          SDT: body.SDT || null,
        }
      );
    } else {
      await query(`UPDATE ${TABLE} SET TenNPP = @TenNPP WHERE MaNPP = @MaNPP`, {
        MaNPP: body.MaNPP,
        TenNPP: body.TenNPP,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/nha-phan-phoi error:', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!body?.MaNPP) {
      return NextResponse.json({ ok: false, error: 'Missing MaNPP' }, { status: 400 });
    }

    await query(`DELETE FROM ${TABLE} WHERE MaNPP = @MaNPP`, { MaNPP: body.MaNPP });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/nha-phan-phoi error:', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}
