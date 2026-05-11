import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const buildFilter = (searchParams: URLSearchParams) => {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  const status = searchParams.get('status');
  const store = searchParams.get('store');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');

  if (status) {
    conditions.push('TrangThai = @status');
    params.status = parseInt(status);
  }

  if (store) {
    conditions.push('MaCuahang = @store');
    params.store = store;
  }

  if (startDate) {
    conditions.push('NgayTao >= @startDate');
    params.startDate = new Date(startDate);
  }

  if (endDate) {
    conditions.push('NgayTao <= @endDate');
    params.endDate = new Date(endDate);
  }

  if (search) {
    conditions.push('(MaHD LIKE @search OR Makh LIKE @search OR EXISTS (SELECT 1 FROM khachhang kh WHERE kh.MaKH = hoadon.Makh AND (kh.TenKH LIKE @search OR kh.SDT LIKE @search)))');
    params.search = `%${search}%`;
  }

  return { whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { whereClause, params } = buildFilter(searchParams);

    const sql = `
      SELECT TrangThai, COUNT(*) AS total
      FROM hoadon
      ${whereClause}
      GROUP BY TrangThai
    `;

    const rows = await dbQuery(sql, params);

    return NextResponse.json({ ok: true, stats: rows || [] });
  } catch (error: any) {
    console.error('Error fetching status breakdown stats:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
