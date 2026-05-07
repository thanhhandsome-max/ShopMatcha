import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

type RouteContext = {
    params: Promise<{ maSP: string }> | { maSP: string };
};

type ImageRow = Record<string, any>;
type ImageTableInfo = {
    tableSchema: string;
    tableName: string;
    columns: Set<string>;
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

async function resolveParams(context: RouteContext) {
    return await Promise.resolve(context.params);
}

async function resolveImageTable(): Promise<ImageTableInfo | null> {
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

    return {
        tableSchema: matchedTable.TABLE_SCHEMA,
        tableName: matchedTable.TABLE_NAME,
        columns: new Set(columns.map((column) => String(column.COLUMN_NAME).toLowerCase())),
    };
}

function normalizeImageRows(rows: ImageRow[]) {
    return rows.map((row, index) => {
        const duongDanAnh = String(
            row.DuongDanAnh || row.duongdananh || row.Anh || row.anh || row.Path || row.path || ''
        ).trim();

        return {
            MaAnh: String(row.MaAnh || row.maanh || row.Id || row.id || duongDanAnh || `${index + 1}`),
            MaSP: String(row.MaSP || row.masp || row.MaSp || row.masP || ''),
            DuongDanAnh: duongDanAnh,
            ThuTu: Number(row.ThuTu ?? row.thutu ?? index + 1),
            AnhChinh: Number(row.AnhChinh ?? row.anhchinh ?? (index === 0 ? 1 : 0)),
        };
    });
}

async function getFallbackImages(maSP: string) {
    const uploadDir = join(process.cwd(), 'public', 'images', 'product');

    if (!existsSync(uploadDir)) return [];

    const normalizedMaSP = maSP.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const files = await readdir(uploadDir);

    return files
        .filter((file) => file.toLowerCase().startsWith(`product-${normalizedMaSP.toLowerCase()}-`))
        .map((file, index) => ({
            MaAnh: file,
            MaSP: maSP,
            DuongDanAnh: `/images/product/${file}`,
            ThuTu: index + 1,
            AnhChinh: index === 0 ? 1 : 0,
        }));
}

async function loadImagesFromDatabase(maSP: string) {
    const tableInfo = await resolveImageTable();

    if (!tableInfo) {
        console.warn('[GET /api/san-pham/[maSP]/anh] no image table found in database');
        return [];
    }

    console.log('[GET /api/san-pham/[maSP]/anh] resolved table =', `${tableInfo.tableSchema}.${tableInfo.tableName}`);
    console.log('[GET /api/san-pham/[maSP]/anh] resolved columns =', Array.from(tableInfo.columns).sort());

    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
    const maAnhColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maAnh);
    const pathColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.duongDanAnh);
    const orderColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.thuTu);
    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);

    console.log('[GET /api/san-pham/[maSP]/anh] matched columns =', {
        maSPColumn,
        maAnhColumn,
        pathColumn,
        orderColumn,
        mainColumn,
    });

    if (!maSPColumn || !pathColumn) {
        console.warn('[GET /api/san-pham/[maSP]/anh] missing required columns, skipping db query');
        return [];
    }

    const selectColumns = [
        `${quoteIdentifier(maSPColumn)} AS MaSP`,
        `${quoteIdentifier(pathColumn)} AS DuongDanAnh`,
    ];

    if (maAnhColumn) selectColumns.unshift(`${quoteIdentifier(maAnhColumn)} AS MaAnh`);
    if (orderColumn) selectColumns.push(`${quoteIdentifier(orderColumn)} AS ThuTu`);
    else selectColumns.push('9999 AS ThuTu');
    if (mainColumn) selectColumns.push(`${quoteIdentifier(mainColumn)} AS AnhChinh`);
    else selectColumns.push('0 AS AnhChinh');

    const orderByParts = [
        mainColumn ? `ISNULL(${quoteIdentifier(mainColumn)}, 0) DESC` : null,
        orderColumn ? `ISNULL(${quoteIdentifier(orderColumn)}, 9999) ASC` : null,
        maAnhColumn ? `${quoteIdentifier(maAnhColumn)} ASC` : `${quoteIdentifier(pathColumn)} ASC`,
    ].filter(Boolean);

    const sqlText = `
        SELECT ${selectColumns.join(', ')}
        FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
        WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
        ORDER BY ${orderByParts.join(', ')}
    `;

    console.log('[GET /api/san-pham/[maSP]/anh] sql =', sqlText.replace(/\s+/g, ' ').trim());
    const rows = await query(sqlText, { MaSP: maSP });
    console.log('[GET /api/san-pham/[maSP]/anh] raw db rows =', Array.isArray(rows) ? rows.length : 'not-array', rows);
    return rows;
}

async function insertImageRow(maSP: string, duongDanAnh: string, thuTu: number, anhChinh: number) {
    const tableInfo = await resolveImageTable();
    if (!tableInfo) throw new Error('Không tìm thấy bảng ảnh sản phẩm trong database');

    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
    const maAnhColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maAnh);
    const pathColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.duongDanAnh);
    const orderColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.thuTu);
    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);

    if (!maSPColumn || !pathColumn) throw new Error('Thiếu cột MaSP hoặc đường dẫn ảnh');

    const insertColumns = [quoteIdentifier(maSPColumn), quoteIdentifier(pathColumn)];
    const values = ['@MaSP', '@DuongDanAnh'];
    const params: Record<string, any> = { MaSP: maSP, DuongDanAnh: duongDanAnh };

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

    const outputColumns = [
        maAnhColumn ? `INSERTED.${quoteIdentifier(maAnhColumn)}` : 'NULL AS MaAnh',
        `INSERTED.${quoteIdentifier(maSPColumn)} AS MaSP`,
        `INSERTED.${quoteIdentifier(pathColumn)} AS DuongDanAnh`,
        orderColumn ? `INSERTED.${quoteIdentifier(orderColumn)} AS ThuTu` : '9999 AS ThuTu',
        mainColumn ? `INSERTED.${quoteIdentifier(mainColumn)} AS AnhChinh` : '0 AS AnhChinh',
    ];

    const sqlText = `
        INSERT INTO ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)} (${insertColumns.join(', ')})
        OUTPUT ${outputColumns.join(', ')}
        VALUES (${values.join(', ')})
    `;

    const inserted = await query(sqlText, params);
    return inserted?.[0] || null;
}

async function updateImageRow(maSP: string, maAnh: string, payload: { thuTu?: number; anhChinh?: number }) {
    const tableInfo = await resolveImageTable();
    if (!tableInfo) throw new Error('Không tìm thấy bảng ảnh sản phẩm trong database');

    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
    const maAnhColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maAnh);
    const orderColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.thuTu);
    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);

    if (!maSPColumn || !maAnhColumn) throw new Error('Thiếu cột khóa ảnh sản phẩm');

    const updates: string[] = [];
    const params: Record<string, any> = { MaAnh: maAnh, MaSP: maSP };

    if (payload.thuTu !== undefined && orderColumn && !Number.isNaN(payload.thuTu)) {
        updates.push(`${quoteIdentifier(orderColumn)} = @ThuTu`);
        params.ThuTu = payload.thuTu;
    }

    if (payload.anhChinh !== undefined && mainColumn && !Number.isNaN(payload.anhChinh)) {
        updates.push(`${quoteIdentifier(mainColumn)} = @AnhChinh`);
        params.AnhChinh = payload.anhChinh ? 1 : 0;
    }

    if (!updates.length) throw new Error('Không có dữ liệu cập nhật');

    const sqlText = `
        UPDATE ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
        SET ${updates.join(', ')}
        WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
          AND LTRIM(RTRIM(CAST(${quoteIdentifier(maAnhColumn)} AS NVARCHAR(200)))) = LTRIM(RTRIM(@MaAnh))
    `;

    await query(sqlText, params);
}

async function deleteImageRow(maSP: string, maAnh: string) {
    const tableInfo = await resolveImageTable();
    if (!tableInfo) throw new Error('Không tìm thấy bảng ảnh sản phẩm trong database');

    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
    const maAnhColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maAnh);
    const pathColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.duongDanAnh);
    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);
    const orderColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.thuTu);

    if (!maSPColumn || !maAnhColumn) throw new Error('Thiếu cột khóa ảnh sản phẩm');

    const selectColumns = [mainColumn ? quoteIdentifier(mainColumn) : '0 AS AnhChinh'];
    if (pathColumn) selectColumns.push(quoteIdentifier(pathColumn) + ' AS DuongDanAnh');

    const current = await query<{ AnhChinh?: number; DuongDanAnh?: string }>(`
        SELECT ${selectColumns.join(', ')}
        FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
        WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
          AND LTRIM(RTRIM(CAST(${quoteIdentifier(maAnhColumn)} AS NVARCHAR(200)))) = LTRIM(RTRIM(@MaAnh))
    `, {
        MaSP: maSP,
        MaAnh: maAnh,
    });

    if (!current.length) {
        return { deleted: false, wasMain: false };
    }

    const wasMain = Number(current[0].AnhChinh) === 1;
    const duongDanAnh = String(current[0].DuongDanAnh || '').trim();

    // Delete physical file if path is stored
    if (duongDanAnh) {
        try {
            let filePath = duongDanAnh;
            if (!filePath.startsWith('/')) filePath = `/images/product/${filePath}`;
            const fullPath = join(process.cwd(), 'public', filePath);
            if (existsSync(fullPath)) {
                await unlink(fullPath);
                console.log('[deleteImageRow] deleted file:', fullPath);
            }
        } catch (err) {
            console.warn('[deleteImageRow] could not delete file:', err);
        }
    }

    await query(`
        DELETE FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
        WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
          AND LTRIM(RTRIM(CAST(${quoteIdentifier(maAnhColumn)} AS NVARCHAR(200)))) = LTRIM(RTRIM(@MaAnh))
    `, {
        MaSP: maSP,
        MaAnh: maAnh,
    });

    if (wasMain && mainColumn && orderColumn) {
        const nextMain = await query<{ MaAnh: string }>(`
            SELECT TOP 1 ${quoteIdentifier(maAnhColumn)} AS MaAnh
            FROM ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
            WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
            ORDER BY ISNULL(${quoteIdentifier(orderColumn)}, 9999) ASC, ${quoteIdentifier(maAnhColumn)} ASC
        `, { MaSP: maSP });

        if (nextMain.length) {
            await query(`
                UPDATE ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)}
                SET ${quoteIdentifier(mainColumn)} = 1
                WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))
                  AND LTRIM(RTRIM(CAST(${quoteIdentifier(maAnhColumn)} AS NVARCHAR(200)))) = LTRIM(RTRIM(@MaAnh))
            `, {
                MaSP: maSP,
                MaAnh: nextMain[0].MaAnh,
            });
        }
    }

    return { deleted: true, wasMain };
}

export async function GET(_req: Request, context: RouteContext) {
    try {
        const { maSP } = await resolveParams(context);
        console.log('[GET /api/san-pham/[maSP]/anh] requested maSP =', JSON.stringify(maSP));

        let images: any[] = [];

        try {
            images = await loadImagesFromDatabase(maSP);
            console.log('[GET /api/san-pham/[maSP]/anh] raw db rows =', Array.isArray(images) ? images.length : 'not-array', images);
        } catch (dbErr) {
            console.warn('GET /api/san-pham/[maSP]/anh DB fallback', dbErr);
            images = await getFallbackImages(maSP);
            console.log('[GET /api/san-pham/[maSP]/anh] fallback rows =', images.length, images);
        }

        if (!images.length) {
            images = await getFallbackImages(maSP);
            console.log('[GET /api/san-pham/[maSP]/anh] fallback after empty db =', images.length, images);
        }

        images = normalizeImageRows(images);
        console.log('[GET /api/san-pham/[maSP]/anh] normalized response =', images.length, images);

        return NextResponse.json({ ok: true, data: images });
    } catch (err) {
        console.error('GET /api/san-pham/[maSP]/anh error', err);
        try {
            const { maSP } = await resolveParams(context);
            const images = normalizeImageRows(await getFallbackImages(maSP));
            console.log('[GET /api/san-pham/[maSP]/anh] hard fallback =', images.length, images);
            return NextResponse.json({ ok: true, data: images });
        } catch {
            return NextResponse.json({ ok: false, error: 'Không thể tải ảnh sản phẩm' }, { status: 500 });
        }
    }
}

export async function POST(req: Request, context: RouteContext) {
    try {
        const { maSP } = await resolveParams(context);
        const body = await req.json();
        const duongDanAnh = String(body?.DuongDanAnh || '').trim();

        if (!duongDanAnh) {
            return NextResponse.json({ ok: false, error: 'Thiếu đường dẫn ảnh' }, { status: 400 });
        }

        const thuTu = Number(body?.ThuTu ?? 9999);
        const anhChinh = Number(body?.AnhChinh ?? 0) ? 1 : 0;

        if (anhChinh === 1) {
            try {
                const tableInfo = await resolveImageTable();
                if (tableInfo) {
                    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
                    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);
                    if (maSPColumn && mainColumn) {
                        await query(
                            `UPDATE ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)} SET ${quoteIdentifier(mainColumn)} = 0 WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))`,
                            { MaSP: maSP }
                        );
                    }
                }
            } catch (e) {
                console.warn('Could not reset main image flag before insert:', e);
            }
        }

        const inserted = await insertImageRow(maSP, duongDanAnh, thuTu, anhChinh);
        return NextResponse.json({ ok: true, data: inserted });
    } catch (err) {
        console.error('POST /api/san-pham/[maSP]/anh error', err);
        return NextResponse.json({ ok: false, error: 'Không thể thêm ảnh sản phẩm' }, { status: 500 });
    }
}

export async function PUT(req: Request, context: RouteContext) {
    try {
        const { maSP } = await resolveParams(context);
        const body = await req.json();
        const maAnh = String(body?.MaAnh || '').trim();

        if (!maAnh) {
            return NextResponse.json({ ok: false, error: 'Thiếu MaAnh' }, { status: 400 });
        }

        const thuTu = body?.ThuTu !== undefined ? Number(body.ThuTu) : undefined;
        const anhChinh = body?.AnhChinh !== undefined ? Number(body.AnhChinh) : undefined;

        if (anhChinh === 1) {
            try {
                const tableInfo = await resolveImageTable();
                if (tableInfo) {
                    const maSPColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.maSP);
                    const mainColumn = firstMatchingColumn(tableInfo.columns, COLUMN_ALIASES.anhChinh);
                    if (maSPColumn && mainColumn) {
                        await query(
                            `UPDATE ${quoteIdentifier(tableInfo.tableSchema)}.${quoteIdentifier(tableInfo.tableName)} SET ${quoteIdentifier(mainColumn)} = 0 WHERE LTRIM(RTRIM(CAST(${quoteIdentifier(maSPColumn)} AS NVARCHAR(100)))) = LTRIM(RTRIM(@MaSP))`,
                            { MaSP: maSP }
                        );
                    }
                }
            } catch (e) {
                console.warn('Could not reset main image flag before update:', e);
            }
        }

        await updateImageRow(maSP, maAnh, { thuTu, anhChinh });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('PUT /api/san-pham/[maSP]/anh error', err);
        return NextResponse.json({ ok: false, error: 'Không thể cập nhật ảnh sản phẩm' }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: RouteContext) {
    try {
        const { maSP } = await resolveParams(context);
        const body = await req.json();
        const maAnh = String(body?.MaAnh || '').trim();

        if (!maAnh) {
            return NextResponse.json({ ok: false, error: 'Thiếu MaAnh' }, { status: 400 });
        }

        const result = await deleteImageRow(maSP, maAnh);

        if (!result.deleted) {
            return NextResponse.json({ ok: false, error: 'Không tìm thấy ảnh' }, { status: 404 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('DELETE /api/san-pham/[maSP]/anh error', err);
        return NextResponse.json({ ok: false, error: 'Không thể xóa ảnh sản phẩm' }, { status: 500 });
    }
}