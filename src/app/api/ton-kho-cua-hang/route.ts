import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const INVENTORY_TABLE_CANDIDATES = ['TonKhoCuaHang', 'TonKho_CuaHang', 'tonkho_cuahang', 'ton_kho_cua_hang'];
const STORE_TABLE_CANDIDATES = ['CuaHang'];
const PRODUCT_TABLE_CANDIDATES = ['SanPham'];

async function tableExists(tableName: string) {
	const rows = await query<{ TABLE_NAME: string }>(
		`SELECT TOP 1 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tableName`,
		{ tableName }
	);
	return rows.length > 0;
}

async function resolveTable(candidates: string[]) {
	for (const tableName of candidates) {
		if (await tableExists(tableName)) return tableName;
	}
	return null;
}

async function getAvailableColumns(tableName: string) {
	try {
		const result = await query<{ COLUMN_NAME: string }>(
			`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName`,
			{ tableName }
		);
		return result?.map((row) => row.COLUMN_NAME) || [];
	} catch (err) {
		console.error(`Error detecting columns for ${tableName}:`, err);
		return [];
	}
}

function buildSelectColumns(columns: string[], requiredColumns: string[], optionalColumns: string[] = []) {
	const selected = requiredColumns.filter((column) => columns.includes(column));
	for (const column of optionalColumns) {
		if (columns.includes(column) && !selected.includes(column)) {
			selected.push(column);
		}
	}
	return selected;
}

async function fetchTableRows(tableName: string | null, requiredColumns: string[], optionalColumns: string[] = []) {
	if (!tableName) return [] as any[];

	const columns = await getAvailableColumns(tableName);
	const selected = buildSelectColumns(columns, requiredColumns, optionalColumns);

	if (selected.length === 0) return [] as any[];

	const sqlText = `SELECT ${selected.join(', ')} FROM ${tableName}`;
	console.log(`[GET /api/ton-kho-cua-hang] SQL for ${tableName}:`, sqlText);
	return query(sqlText);
}

export async function GET() {
	try {
		const inventoryTable = await resolveTable(INVENTORY_TABLE_CANDIDATES);
		const storeTable = await resolveTable(STORE_TABLE_CANDIDATES);
		const productTable = await resolveTable(PRODUCT_TABLE_CANDIDATES);

		const inventoryRows = await fetchTableRows(
			inventoryTable,
			['MaCH', 'MaSP', 'SoLuong'],
			['NgayCapNhat', 'GhiChu']
		);
		const stores = await fetchTableRows(storeTable, ['MaCH', 'TenCH'], ['DiaChi', 'SDT']);
		const products = await fetchTableRows(productTable, ['MaSP', 'TenSanPham'], ['GiaVon', 'GiaBan', 'TrangThai', 'MaLoai']);

		const storeMap = new Map<string, any>();
		for (const store of stores) {
			if (store?.MaCH) storeMap.set(String(store.MaCH), store);
		}

		const productMap = new Map<string, any>();
		for (const product of products) {
			if (product?.MaSP) productMap.set(String(product.MaSP), product);
		}

		const data = inventoryRows.map((row: any) => {
			const store = storeMap.get(String(row.MaCH || ''));
			const product = productMap.get(String(row.MaSP || ''));

			return {
				...row,
				TenCH: store?.TenCH || '',
				TenSanPham: product?.TenSanPham || '',
				GiaVon: product?.GiaVon ?? 0,
				GiaBan: product?.GiaBan ?? 0,
			};
		});

		return NextResponse.json({
			ok: true,
			data,
			stores,
			products,
			meta: {
				inventoryTable,
				storeTable,
				productTable,
			},
		});
	} catch (err) {
		console.error('GET /api/ton-kho-cua-hang error', err);
		return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		if (!body?.MaCH || !body?.MaSP || typeof body?.SoLuong === 'undefined') {
			return NextResponse.json({ ok: false, error: 'Missing MaCH, MaSP or SoLuong' }, { status: 400 });
		}

		const inventoryTable = await resolveTable(INVENTORY_TABLE_CANDIDATES);
		if (!inventoryTable) {
			return NextResponse.json({ ok: false, error: 'Inventory table not found' }, { status: 500 });
		}

		const columns = await getAvailableColumns(inventoryTable);
		const hasGhiChu = columns.includes('GhiChu');
		const hasNgay = columns.includes('NgayCapNhat');

		if (hasGhiChu && hasNgay) {
			await query(
				`INSERT INTO ${inventoryTable} (MaCH, MaSP, SoLuong, GhiChu, NgayCapNhat) VALUES (@MaCH, @MaSP, @SoLuong, @GhiChu, @NgayCapNhat)`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
					GhiChu: body.GhiChu || null,
					NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
				}
			);
		} else if (hasGhiChu) {
			await query(
				`INSERT INTO ${inventoryTable} (MaCH, MaSP, SoLuong, GhiChu) VALUES (@MaCH, @MaSP, @SoLuong, @GhiChu)`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
					GhiChu: body.GhiChu || null,
				}
			);
		} else if (hasNgay) {
			await query(
				`INSERT INTO ${inventoryTable} (MaCH, MaSP, SoLuong, NgayCapNhat) VALUES (@MaCH, @MaSP, @SoLuong, @NgayCapNhat)`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
					NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
				}
			);
		} else {
			await query(`INSERT INTO ${inventoryTable} (MaCH, MaSP, SoLuong) VALUES (@MaCH, @MaSP, @SoLuong)`, {
				MaCH: body.MaCH,
				MaSP: body.MaSP,
				SoLuong: body.SoLuong,
			});
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error('POST /api/ton-kho-cua-hang error', err);
		return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const body = await req.json();
		if (!body?.MaCH || !body?.MaSP || typeof body?.SoLuong === 'undefined') {
			return NextResponse.json({ ok: false, error: 'Missing MaCH, MaSP or SoLuong' }, { status: 400 });
		}

		const inventoryTable = await resolveTable(INVENTORY_TABLE_CANDIDATES);
		if (!inventoryTable) {
			return NextResponse.json({ ok: false, error: 'Inventory table not found' }, { status: 500 });
		}

		const columns = await getAvailableColumns(inventoryTable);
		const hasGhiChu = columns.includes('GhiChu');
		const hasNgay = columns.includes('NgayCapNhat');

		if (hasGhiChu && hasNgay) {
			await query(
				`UPDATE ${inventoryTable}
				 SET SoLuong = @SoLuong,
						 GhiChu = @GhiChu,
						 NgayCapNhat = @NgayCapNhat
				 WHERE MaCH = @MaCH AND MaSP = @MaSP`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
					GhiChu: body.GhiChu || null,
					NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
				}
			);
		} else if (hasGhiChu) {
			await query(
				`UPDATE ${inventoryTable}
				 SET SoLuong = @SoLuong,
						 GhiChu = @GhiChu
				 WHERE MaCH = @MaCH AND MaSP = @MaSP`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
					GhiChu: body.GhiChu || null,
				}
			);
		} else if (hasNgay) {
			await query(
				`UPDATE ${inventoryTable}
				 SET SoLuong = @SoLuong,
						 NgayCapNhat = @NgayCapNhat
				 WHERE MaCH = @MaCH AND MaSP = @MaSP`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
					NgayCapNhat: body.NgayCapNhat || new Date().toISOString(),
				}
			);
		} else {
			await query(
				`UPDATE ${inventoryTable}
				 SET SoLuong = @SoLuong
				 WHERE MaCH = @MaCH AND MaSP = @MaSP`,
				{
					MaCH: body.MaCH,
					MaSP: body.MaSP,
					SoLuong: body.SoLuong,
				}
			);
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error('PUT /api/ton-kho-cua-hang error', err);
		return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		if (!body?.MaCH || !body?.MaSP) {
			return NextResponse.json({ ok: false, error: 'Missing MaCH or MaSP' }, { status: 400 });
		}

		const inventoryTable = await resolveTable(INVENTORY_TABLE_CANDIDATES);
		if (!inventoryTable) {
			return NextResponse.json({ ok: false, error: 'Inventory table not found' }, { status: 500 });
		}

		await query(`DELETE FROM ${inventoryTable} WHERE MaCH = @MaCH AND MaSP = @MaSP`, {
			MaCH: body.MaCH,
			MaSP: body.MaSP,
		});

		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error('DELETE /api/ton-kho-cua-hang error', err);
		return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
	}
}
