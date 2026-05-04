import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const maSP = String(formData.get('maSP') || '').trim();

        if (!file) {
            return NextResponse.json(
                { ok: false, error: 'Không có file được gửi' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { ok: false, error: 'Chỉ chấp nhận file ảnh' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { ok: false, error: 'File quá lớn (tối đa 5MB)' },
                { status: 400 }
            );
        }

        const extension = file.name.split('.').pop() || 'jpg';
        const normalizedMaSP = maSP ? maSP.replace(/^SP/i, '').replace(/\D/g, '') : '';
        const suffixNumber = normalizedMaSP ? String(parseInt(normalizedMaSP, 10) || 0) : '';
        const suffix = suffixNumber ? suffixNumber.padStart(2, '0') : Date.now().toString();
        const filename = `product-${suffix}.${extension}`;

        // Create upload directory path
        const uploadDir = join(process.cwd(), 'public', 'images', 'product');

        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Write file to public/images/product
        const filepath = join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // If a MaSP was provided, try to persist metadata into SanPhamAnh
        if (maSP) {
            try {
                await query(
                    `INSERT INTO SanPhamAnh (MaSP, DuongDanAnh, ThuTu, AnhChinh) VALUES (@MaSP, @DuongDanAnh, @ThuTu, @AnhChinh)`,
                    {
                        MaSP: maSP,
                        DuongDanAnh: `/images/product/${filename}`,
                        ThuTu: 9999,
                        AnhChinh: 0,
                    }
                );
            } catch (dbErr) {
                console.warn('Could not insert SanPhamAnh record:', String(dbErr));
            }
        }

        return NextResponse.json({
            ok: true,
            data: {
                filename: filename,
                url: `/images/product/${filename}`,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { ok: false, error: 'Lỗi upload file' },
            { status: 500 }
        );
    }
}
