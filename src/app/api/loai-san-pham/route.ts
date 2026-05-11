// src/app/api/loai-san-pham/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLE = 'loaisanpham';

// Detect available columns in the table
async function getAvailableColumns() {
    try {
        const result = await query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`,
            { table: TABLE }
        );
        return result?.map((row: any) => row.COLUMN_NAME) || [];
    } catch (err) {
        console.error('Error detecting columns:', err);
        return ['MaLoai', 'TenLoai'];
    }
}

export async function GET() {
    try {
        const columns = await getAvailableColumns();
        console.log('Available columns in loaisanpham:', columns);
        
        const selectedColumns = ['MaLoai', 'TenLoai'];
        
        // Add MoTa only if it exists
        if (columns.includes('MoTa')) {
            selectedColumns.push('MoTa');
            console.log('MoTa column found, including in SELECT');
        } else {
            console.log('MoTa column NOT found');
        }
        
        const sql = `SELECT ${selectedColumns.join(', ')} FROM ${TABLE}`;
        console.log('SQL Query:', sql);
        
        const data = await query(sql);
        console.log('Data returned:', data);
        
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
        
        const columns = await getAvailableColumns();
        if (columns.includes('MoTa')) {
            await query(
                `INSERT INTO ${TABLE} (MaLoai, TenLoai, MoTa) VALUES (@MaLoai, @TenLoai, @MoTa)`,
                { MaLoai: body.MaLoai, TenLoai: body.TenLoai, MoTa: body.MoTa || null }
            );
        } else {
            await query(
                `INSERT INTO ${TABLE} (MaLoai, TenLoai) VALUES (@MaLoai, @TenLoai)`,
                { MaLoai: body.MaLoai, TenLoai: body.TenLoai }
            );
        }
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
        
        const columns = await getAvailableColumns();
        if (columns.includes('MoTa')) {
            await query(
                `UPDATE ${TABLE} SET TenLoai = @TenLoai, MoTa = @MoTa WHERE MaLoai = @MaLoai`,
                { MaLoai: body.MaLoai, TenLoai: body.TenLoai, MoTa: body.MoTa || null }
            );
        } else {
            await query(
                `UPDATE ${TABLE} SET TenLoai = @TenLoai WHERE MaLoai = @MaLoai`,
                { MaLoai: body.MaLoai, TenLoai: body.TenLoai }
            );
        }
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
    }
}