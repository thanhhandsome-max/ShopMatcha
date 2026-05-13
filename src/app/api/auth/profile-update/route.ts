import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { maTK, name, email, phone, address } = body;

        if (!maTK) {
            return NextResponse.json({ ok: false, error: 'Missing maTK' }, { status: 400 });
        }

        // First, check if user exists in NhanVien
        let result = await query<any>(`
      SELECT TOP 1 MaNV FROM NhanVien WHERE MaTK = @maTK
    `, { maTK });

        if (result && result.length > 0) {
            // Update NhanVien
            await query(`
        UPDATE NhanVien 
        SET HoTen = @name, Email = @email, SDT = @phone, DiaChi = @address
        WHERE MaTK = @maTK
      `, { maTK, name, email, phone, address });

            return NextResponse.json({ ok: true, message: 'Profile updated successfully' });
        }

        // Check if user exists in KhachHang
        result = await query<any>(`
      SELECT TOP 1 MaKH FROM KhachHang WHERE MaTK = @maTK
    `, { maTK });

        if (result && result.length > 0) {
            // Update KhachHang
            await query(`
        UPDATE KhachHang 
        SET TenKH = @name, Email = @email, SDT = @phone, DiaChi = @address
        WHERE MaTK = @maTK
      `, { maTK, name, email, phone, address });

            return NextResponse.json({ ok: true, message: 'Profile updated successfully' });
        }

        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    } catch (error) {
        console.error('PUT /api/auth/profile-update error', error);
        return NextResponse.json({ ok: false, error: 'Failed to update profile' }, { status: 500 });
    }
}
