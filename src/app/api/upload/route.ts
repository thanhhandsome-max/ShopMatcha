import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { query } from '@/lib/db';

type ImageTableInfo = {
    tableSchema: string;
    tableName: string;
    columns: Set<string>;
    identityColumn?: string;
};

const TABLE_CANDIDATES = ['SanPhamAnh', 'sanpham_anh', 'san_pham_anh', 'SanPham_Anh', 'sanphamanh'];

const COLUMN_ALIASES = {
    maSP: ['MaSP', 'Masp', 'ma_sp', 'product_id', 'sanpham_id'],
    maAnh: ['MaAnh', 'Maanh', 'id', 'Id', 'image_id'],
    duongDanAnh: ['DuongDanAnh', 'duongdananh', 'Anh', 'anh', 'Path', 'path', 'Url', 'url', 'image_url'],
    thuTu: ['ThuTu', 'thutu', 'sort_order', 'SortOrder', 'position'],
    anhChinh: ['AnhChinh', 'anhchinh', 'is_main', 'isMain', 'MainImage'],
} as const;

function quoteIdentifier(name: string) {
    return `[${String(name).replace(/]/g, ']]')}]`;
}

function firstMatchingColumn(columns: Set<string>, aliases: readonly string[]) {
    for (const alias of aliases) {
        if (columns.has(alias.toLowerCase())) return alias;
    }
    return null;
}

async function resolveImageTable(): Promise<ImageTableInfo | null> {
    try {
        const tables = await query<{ TABLE_SCHEMA: string; TABLE_NAME: string }>(`
            SELECT TABLE_SCHEMA, TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE LOWER(TABLE_NAME) IN ('sanphamanh', 'sanpham_anh', 'san_pham_anh')
        `);

        const matchedTable = TABLE_CANDIDATES
            .map((candidate) => tables.find((table) => table.TABLE_NAME.toLowerCase() === candidate.toLowerCase()))
            .find(Boolean);

        if (!matchedTable) return null;

        const columns = await query<{ COLUMN_NAME: string }>(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @TABLE_SCHEMA AND TABLE_NAME = @TABLE_NAME
        `, {
            TABLE_SCHEMA: matchedTable.TABLE_SCHEMA,
            TABLE_NAME: matchedTable.TABLE_NAME,
        });

        // Check for IDENTITY column
        let identityColumn: string | undefined;
        try {
            const identityResult = await query<{ COLUMN_NAME: string }>(`
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = @TABLE_SCHEMA 
                AND TABLE_NAME = @TABLE_NAME 
                AND COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1
            `, {
                TABLE_SCHEMA: matchedTable.TABLE_SCHEMA,
                TABLE_NAME: matchedTable.TABLE_NAME,
            });
            
            if (Array.isArray(identityResult) && identityResult.length > 0) {
                identityColumn = String(identityResult[0].COLUMN_NAME);
                console.log('[resolveImageTable] found IDENTITY column:', identityColumn);
            }
        } catch (e) {
            console.warn('[resolveImageTable] could not detect IDENTITY column:', String(e));
        }

        return {
            tableSchema: matchedTable.TABLE_SCHEMA,
            tableName: matchedTable.TABLE_NAME,
            columns: new Set(columns.map((column) => String(column.COLUMN_NAME).toLowerCase())),
            identityColumn,
        };
    } catch (err) {
        console.warn('[POST /api/upload] error resolving image table:', String(err));
        return null;
    }
}

async function insertImageToDatabase(maSP: string, duongDanAnh: string) {
    const tableInfo = await resolveImageTable();
    if (!tableInfo) throw new Error('Không tìm thấy bảng ảnh sản phẩm trong database');

    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
    const maAnhColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maAnh);
    const pathColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.duongDanAnh);
    const orderColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.thuTu);
    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);

    if (!maSPColumn || !pathColumn) throw new Error('Thiếu cột MaSP hoặc đường dẫn ảnh trong bảng ảnh sản phẩm');

    console.log('[POST /api/upload] resolved image table:', `${tableInfo.tableSchema}.${tableInfo.tableName}`);
    console.log('[POST /api/upload] resolved columns:', { maSPColumn, pathColumn, orderColumn, mainColumn });

    // Get current max order and check if main image exists
    let thuTu = 1;
    let anhChinh = 1;

    if (orderColumn) {
        try {
            const orderResult = await query<{ MaxOrder: number | null }>(`
                SELECT MAX(CAST(${quoteIdentifier(orderColumn)} AS INT)) AS MaxOrder
                FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
                WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
            `, { MaSP: maSP });

            thuTu = ((orderResult?.[0]?.MaxOrder) || 0) + 1;
            console.log('[POST /api/upload] next order for MaSP:', maSP, '=', thuTu);
        } catch (e) {
            console.warn('[POST /api/upload] could not determine next order, defaulting to 1');
        }
    }

    if (mainColumn) {
        try {
            const mainResult = await query<{ Total: number }>(`
                SELECT COUNT(*) AS Total
                FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
                WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
                AND ISNULL(${quoteIdentifier(mainColumn)}, 0) = 1
            `, { MaSP: maSP });

            anhChinh = ((mainResult?.[0]?.Total) || 0) > 0 ? 0 : 1;
            console.log('[POST /api/upload] anhChinh for MaSP:', maSP, '=', anhChinh, '(has main:', anhChinh === 0, ')');
        } catch (e) {
            console.warn('[POST /api/upload] could not check for existing main image, defaulting to 1');
            anhChinh = 1;
        }
    }

    // Build INSERT statement with available columns
    const insertColumns = [quoteIdentifier(maSPColumn), quoteIdentifier(pathColumn)];
    const values = ['@MaSP', '@DuongDanAnh'];
    const params: Record<string, any> = { MaSP: maSP, DuongDanAnh: duongDanAnh };

    // Generate MaAnh (image ID) if the column exists and is NOT an IDENTITY column
    if (maAnhColumn && maAnhColumn.toLowerCase() !== tableInfo.identityColumn?.toLowerCase()) {
        try {
            // Query for the highest IMG number across ALL products (to ensure global uniqueness)
            // Use TRY_CAST to safely convert non-numeric values
            const maAnhResult = await query<{ MaxNum: number }>(`
                SELECT MAX(
                    CAST(
                        COALESCE(
                            TRY_CAST(SUBSTRING(${quoteIdentifier(maAnhColumn)}, 4, LEN(${quoteIdentifier(maAnhColumn)})) AS INT),
                            0
                        ) AS INT
                    )
                ) AS MaxNum
                FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
                WHERE ${quoteIdentifier(maAnhColumn)} LIKE 'IMG%'
            `);

            let maxNumber = maAnhResult?.[0]?.MaxNum || 0;
            const nextNumber = maxNumber + 1;
            const generatedMaAnh = `IMG${String(nextNumber).padStart(3, '0')}`;

            insertColumns.push(quoteIdentifier(maAnhColumn));
            values.push('@MaAnh');
            params.MaAnh = generatedMaAnh;
            console.log('[POST /api/upload] generated MaAnh:', generatedMaAnh, '(next number:', nextNumber, ', max existing:', maxNumber, ')');
        } catch (e) {
            console.warn('[POST /api/upload] could not generate sequential MaAnh:', String(e));
            throw new Error(`Lỗi sinh mã ảnh tự động: ${String(e)}`);
        }
    } else if (maAnhColumn && maAnhColumn.toLowerCase() === tableInfo.identityColumn?.toLowerCase()) {
        console.log('[POST /api/upload] MaAnh is IDENTITY column, skipping insert (will auto-generate)');
    }

    if (orderColumn) {
        insertColumns.push(quoteIdentifier(orderColumn));
        values.push('@ThuTu');
        params.ThuTu = thuTu;
    }

    if (mainColumn) {
        insertColumns.push(quoteIdentifier(mainColumn));
        values.push('@AnhChinh');
        params.AnhChinh = anhChinh;
    }

    const sqlText = `
        INSERT INTO ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
        (${insertColumns.join(', ')})
        VALUES (${values.join(', ')})
    `;

    console.log('[POST /api/upload] executing insert sql:', sqlText.replace(/\s+/g, ' ').trim());
    console.log('[POST /api/upload] insert params:', params);

    await query(sqlText, params);

    console.log('[POST /api/upload] successfully inserted image record for MaSP:', maSP);
}

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
        const normalizedMaSP = maSP ? maSP.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'GENERAL';
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).slice(2, 8);
        const filename = `product-${normalizedMaSP}-${timestamp}-${randomPart}.${extension}`;
        const imageUrl = `/images/product/${filename}`;

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
        console.log('[POST /api/upload] file saved to:', filepath);

        // If a MaSP was provided, persist metadata into SanPhamAnh
        if (maSP) {
            let retryCount = 0;
            let lastError: Error | null = null;

            while (retryCount < 3) {
                try {
                    await insertImageToDatabase(maSP, filename);
                    console.log('[POST /api/upload] image upload completed successfully');
                    lastError = null;
                    break;
                } catch (dbErr) {
                    lastError = dbErr as Error;
                    const errorStr = String(dbErr);
                    console.error('[POST /api/upload] database insertion error (attempt', retryCount + 1, '):', errorStr);

                    // Check if it's a duplicate key error (possible race condition)
                    if (errorStr.includes('PRIMARY KEY') || errorStr.includes('duplicate')) {
                        retryCount++;
                        if (retryCount < 3) {
                            console.log('[POST /api/upload] retrying after duplicate key error...');
                            // Wait a bit before retrying
                            await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
                            continue;
                        }
                    }

                    // Non-retry error or max retries exceeded
                    break;
                }
            }

            if (lastError) {
                console.error('[POST /api/upload] final database error:', String(lastError));
                // Delete the file if database insert fails
                try {
                    await unlink(filepath);
                    console.log('[POST /api/upload] rolled back file after db error');
                } catch (unlinkErr) {
                    console.warn('[POST /api/upload] could not delete file after db error');
                }
                throw new Error(`Lỗi lưu ảnh vào cơ sở dữ liệu: ${String(lastError)}`);
            }
        }

        return NextResponse.json({
            ok: true,
            data: {
                filename: filename,
                url: imageUrl,
            },
        });
    } catch (error) {
        console.error('[POST /api/upload] error:', error);
        return NextResponse.json(
            { ok: false, error: String(error) || 'Lỗi upload file' },
            { status: 500 }
        );
    }
}
