import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE = 'SanPham';

function generateNextMaSP(lastMaSP?: string) {
    if (!lastMaSP) return 'SP001';
    const match = String(lastMaSP).match(/(\d+)$/);
    const nextNumber = match ? Number(match[1]) + 1 : 1;
    return `SP${String(nextNumber).padStart(3, '0')}`;
}

export async function GET() {
    try {
        const products = await query(
            `SELECT MaSP, TenSanPham, MaCodeSp, GiaVon, GiaBan, MoTa, TrangThai, MaLoai, NgayTao FROM ${TABLE} ORDER BY NgayTao DESC, MaSP DESC`
        );

        return NextResponse.json({ ok: true, data: products });
    } catch (err) {
        console.error('GET /api/san-pham error', err);
        return NextResponse.json(
            { ok: false, error: err instanceof Error ? err.message : 'DB error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body?.TenSanPham || !body?.MaLoai) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        const lastResult = await query(`SELECT TOP 1 MaSP FROM ${TABLE} ORDER BY MaSP DESC`);
        const newMaSP = body.MaSP ? String(body.MaSP) : generateNextMaSP(lastResult?.[0]?.MaSP);

        await query(
            `INSERT INTO ${TABLE} (MaSP, TenSanPham, MaCodeSp, GiaVon, GiaBan, MoTa, TrangThai, MaLoai, NgayTao)
             VALUES (@MaSP, @TenSanPham, @MaCodeSp, @GiaVon, @GiaBan, @MoTa, @TrangThai, @MaLoai, COALESCE(@NgayTao, GETDATE()))`,
            {
                MaSP: newMaSP,
                TenSanPham: String(body.TenSanPham),
                MaCodeSp: String(body.MaCodeSp || ''),
                GiaVon: Number(body.GiaVon) || 0,
                GiaBan: Number(body.GiaBan) || 0,
                MoTa: String(body.MoTa || ''),
                TrangThai: Number(body.TrangThai ?? 1),
                MaLoai: String(body.MaLoai),
                NgayTao: body.NgayTao ? new Date(body.NgayTao) : null,
            }
        );

        return NextResponse.json({ ok: true, data: { MaSP: newMaSP } });
    } catch (err) {
        console.error('POST error:', err);
        return NextResponse.json(
            { ok: false, error: err instanceof Error ? err.message : 'Insert failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        if (!body?.MaSP) return NextResponse.json({ ok: false, error: 'Missing MaSP' }, { status: 400 });

        await query(`DELETE FROM ${TABLE} WHERE MaSP = @MaSP`, { MaSP: body.MaSP });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        if (!body?.MaSP || !body?.TenSanPham || !body?.MaLoai) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        await query(
            `UPDATE ${TABLE}
             SET TenSanPham = @TenSanPham,
                 MaCodeSp = @MaCodeSp,
                 GiaVon = @GiaVon,
                 GiaBan = @GiaBan,
                 MoTa = @MoTa,
                 TrangThai = @TrangThai,
                 MaLoai = @MaLoai
             WHERE MaSP = @MaSP`,
            {
                MaSP: body.MaSP,
                TenSanPham: String(body.TenSanPham),
                MaCodeSp: String(body.MaCodeSp || ''),
                GiaVon: Number(body.GiaVon) || 0,
                GiaBan: Number(body.GiaBan) || 0,
                MoTa: String(body.MoTa || ''),
                TrangThai: Number(body.TrangThai ?? 1),
                MaLoai: String(body.MaLoai),
            }
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
    }
}
