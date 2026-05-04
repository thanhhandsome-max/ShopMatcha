// src/app/api/loai-san-pham/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE = 'loaisanpham'; // sửa nếu tên bảng khác

export async function GET() {
    try {
        const data = await query(`SELECT MaLoai, TenLoai FROM ${TABLE}`);
        return NextResponse.json({ ok: true, data });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body?.MaLoai || !body?.TenLoai) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }
        await query(
            `INSERT INTO ${TABLE} (MaLoai, TenLoai) VALUES (@MaLoai, @TenLoai)`,
            { MaLoai: body.MaLoai, TenLoai: body.TenLoai }
        );
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        if (!body?.MaLoai) return NextResponse.json({ ok: false, error: 'Missing MaLoai' }, { status: 400 });
        await query(`DELETE FROM ${TABLE} WHERE MaLoai = @MaLoai`, { MaLoai: body.MaLoai });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        if (!body?.MaLoai || !body?.TenLoai) {
            return NextResponse.json({ ok: false, error: 'Missing MaLoai or TenLoai' }, { status: 400 });
        }
        await query(
            `UPDATE ${TABLE} SET TenLoai = @TenLoai WHERE MaLoai = @MaLoai`,
            { MaLoai: body.MaLoai, TenLoai: body.TenLoai }
        );
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
    }
}