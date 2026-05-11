import { ICuaHang } from '@/types';

interface RevenueItem {
  MaCH: string;
  SoPhieu: number;
  DoanhThu: number;
}

interface TopProduct {
  MaSP: string;
  TenSanPham: string;
  TongSoLuong: number;
  DoanhThu: number;
}

interface DailyRevenueItem {
  Ngay: string;
  SoDon: number;
  DoanhThu: number;
}

class DoanhthuCuaHangService {
  private base = '/api/cua-hang/doanh-thu';

  async getRevenue(filters?: { maCH?: string; fromDate?: string; toDate?: string }): Promise<{
    revenue: RevenueItem[];
    dailyRevenue: DailyRevenueItem[];
    topProducts: TopProduct[];
    stores: ICuaHang[];
  }> {
    const url = new URL(this.base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (filters?.maCH) url.searchParams.append('maCH', filters.maCH);
    if (filters?.fromDate) url.searchParams.append('fromDate', filters.fromDate);
    if (filters?.toDate) url.searchParams.append('toDate', filters.toDate);

    const res = await fetch(url.toString());
    const json = await res.json();
    return json.ok ? json.data : { revenue: [], dailyRevenue: [], topProducts: [], stores: [] };
  }
}

export const doanhthuCuaHangService = new DoanhthuCuaHangService();
