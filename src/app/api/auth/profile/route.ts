import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const maTK = searchParams.get('maTK');

        if (!maTK) {
            return NextResponse.json({ ok: false, error: 'Missing maTK' }, { status: 400 });
        }

        // Try to find in NhanVien first
        let result = await query<any>(`
      SELECT TOP 1 MaNV as id, HoTen as name, Email as email, SDT as phone, DiaChi as address, NgayNhanChuc as startDate, 'NhanVien' as type
      FROM NhanVien
      WHERE MaTK = @maTK
    `, { maTK });

        if (result && result.length > 0) {
            return NextResponse.json({ ok: true, data: result[0] });
        }

        // Then try KhachHang
        result = await query<any>(`
      SELECT TOP 1 MaKH as id, TenKH as name, Email as email, SDT as phone, DiaChi as address, NULL as startDate, 'KhachHang' as type
      FROM KhachHang
      WHERE MaTK = @maTK
    `, { maTK });

        if (result && result.length > 0) {
            return NextResponse.json({ ok: true, data: result[0] });
        }

        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    } catch (error) {
        console.error('GET /api/auth/profile error', error);
        return NextResponse.json({ ok: false, error: 'Failed to fetch profile' }, { status: 500 });
    }
}
