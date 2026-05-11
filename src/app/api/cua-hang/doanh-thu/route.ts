import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const INVOICE_TABLE_CANDIDATES = ['HoaDon', 'hoadon', 'hoa_don'];
const INVOICE_DETAIL_CANDIDATES = ['ChiTietHoaDon', 'chitiethoadon', 'chi_tiet_hoa_don'];
const PRODUCT_TABLE_CANDIDATES = ['SanPham', 'sanpham', 'san_pham'];
const STORE_TABLE_CANDIDATES = ['CuaHang', 'Cua_Hang', 'cuahang'];

async function resolveTable(candidates: string[]) {
  for (const t of candidates) {
    const r = await query(`SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @t`, { t });
    if (r && r.length > 0) return t;
  }
  return null;
}

async function getAvailableColumns(table: string) {
  try {
    const result = await query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`, { table });
    return result?.map((r: any) => r.COLUMN_NAME) || [];
  } catch (err) {
    console.error('Error detecting columns for', table, err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const maCH = url.searchParams.get('maCH');
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const minRevenue = url.searchParams.get('minRevenue');
    const maxRevenue = url.searchParams.get('maxRevenue');

    const invoiceTable = await resolveTable(INVOICE_TABLE_CANDIDATES as string[]);
    if (!invoiceTable) return NextResponse.json({ ok: false, error: 'HoaDon table not found' }, { status: 500 });

    const invoiceDetailTable = await resolveTable(INVOICE_DETAIL_CANDIDATES as string[]);
    const productTable = await resolveTable(PRODUCT_TABLE_CANDIDATES as string[]);
    const storeTable = await resolveTable(STORE_TABLE_CANDIDATES as string[]);
    const invoiceCols = await getAvailableColumns(invoiceTable);
    const storeColumn = invoiceCols.includes('MaCuahang')
      ? 'MaCuahang'
      : invoiceCols.includes('MaCH')
      ? 'MaCH'
      : invoiceCols.includes('Ma_Cuahang')
      ? 'Ma_Cuahang'
      : invoiceCols[0] || 'MaCuahang';

    // Get revenue summary from HoaDon (by store)
    let revenueSql = `SELECT ${storeColumn} as MaCH, COUNT(*) as SoPhieu, SUM(TongTien) as DoanhThu FROM ${invoiceTable} WHERE 1=1`;
    let revenueParams: any = {};

    if (maCH) {
      revenueSql += ` AND ${storeColumn} = @MaCH`;
      revenueParams.MaCH = maCH;
    }

    if (fromDate) {
      revenueSql += ` AND CAST(NgayTao AS DATE) >= @FromDate`;
      revenueParams.FromDate = fromDate;
    }

    if (toDate) {
      revenueSql += ` AND CAST(NgayTao AS DATE) <= @ToDate`;
      revenueParams.ToDate = toDate;
    }

    revenueSql += ` GROUP BY ${storeColumn}`;

    // Apply revenue range filters at group level (HAVING)
    const havingClauses: string[] = [];
    if (minRevenue) {
      havingClauses.push(`SUM(TongTien) >= @MinRevenue`);
      revenueParams.MinRevenue = minRevenue;
    }
    if (maxRevenue) {
      havingClauses.push(`SUM(TongTien) <= @MaxRevenue`);
      revenueParams.MaxRevenue = maxRevenue;
    }
    if (havingClauses.length) {
      revenueSql += ` HAVING ` + havingClauses.join(' AND ');
    }

    const revenueData = await query(revenueSql, revenueParams);

    let dailyRevenueSql = `
      SELECT
        CONVERT(varchar(10), CAST(NgayTao AS date), 23) as Ngay,
        COUNT(*) as SoDon,
        SUM(TongTien) as DoanhThu
      FROM ${invoiceTable}
      WHERE 1=1
    `;
    const dailyRevenueParams: any = {};

    if (maCH) {
      dailyRevenueSql += ` AND ${storeColumn} = @MaCH`;
      dailyRevenueParams.MaCH = maCH;
    }

    if (fromDate) {
      dailyRevenueSql += ` AND CAST(NgayTao AS DATE) >= @FromDate`;
      dailyRevenueParams.FromDate = fromDate;
    }

    if (toDate) {
      dailyRevenueSql += ` AND CAST(NgayTao AS DATE) <= @ToDate`;
      dailyRevenueParams.ToDate = toDate;
    }

    dailyRevenueSql += ` GROUP BY CONVERT(varchar(10), CAST(NgayTao AS date), 23) ORDER BY Ngay`;

    const dailyRevenue = await query(dailyRevenueSql, dailyRevenueParams);

    // Get top products from ChiTietHoaDon (using ThanhTien for actual revenue)
    let topProductsSql = `
      SELECT TOP 10
        sp.MaSP,
        sp.TenSanPham,
        SUM(cthd.SoLuong) as TongSoLuong,
        SUM(cthd.ThanhTien) as DoanhThu
      FROM ${invoiceDetailTable} cthd
      LEFT JOIN ${productTable} sp ON cthd.MaSP = sp.MaSP
      LEFT JOIN ${invoiceTable} hd ON cthd.MaHD = hd.MaHD
      WHERE 1=1
    `;
    let topProductsParams: any = {};

    if (maCH) {
      topProductsSql += ` AND hd.${storeColumn} = @MaCH`;
      topProductsParams.MaCH = maCH;
    }

    if (fromDate) {
      topProductsSql += ` AND CAST(hd.NgayTao AS DATE) >= @FromDate`;
      topProductsParams.FromDate = fromDate;
    }

    if (toDate) {
      topProductsSql += ` AND CAST(hd.NgayTao AS DATE) <= @ToDate`;
      topProductsParams.ToDate = toDate;
    }

    topProductsSql += ` GROUP BY sp.MaSP, sp.TenSanPham ORDER BY TongSoLuong DESC`;

    const topProducts = await query(topProductsSql, topProductsParams);

    // Get store list for display and filter labels
    let stores: any[] = [];
    if (storeTable) {
      stores = await query(`SELECT MaCH, TenCH FROM ${storeTable}`);
    }

    return NextResponse.json({ ok: true, data: { revenue: revenueData, dailyRevenue, topProducts, stores } });
  } catch (err) {
    console.error('Revenue GET error', err);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
