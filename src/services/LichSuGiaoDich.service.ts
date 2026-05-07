import { IPhieuNhap, IChiTietPhieuNhap } from '@/types';

export interface ILichSuGiaoDichDisplay
  extends IPhieuNhap,
    Omit<IChiTietPhieuNhap, 'MaPN'> {
  TenSanPham?: string;
  HoTen?: string;
  TenNPP?: string;
  MaKho?: string;
  TenKho?: string;
  GiaNhap?: number;
  ThanhTien?: number;
}

export interface ILichSuGiaoDichResponse {
  ok: boolean;
  data: ILichSuGiaoDichDisplay[];
}

class LichSuGiaoDichService {
  private base = '/api/lich-su-giao-dich';

  async getAll(filters?: {
    maSP?: string;
    maNPP?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ILichSuGiaoDichDisplay[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.maSP) params.append('maSP', filters.maSP);
      if (filters?.maNPP) params.append('maNPP', filters.maNPP);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const queryString = params.toString();
      const url = queryString ? `${this.base}?${queryString}` : this.base;

      const response = await fetch(url);
      const result = (await response.json()) as ILichSuGiaoDichResponse;

      if (result.ok && Array.isArray(result.data)) {
        return result.data;
      }

      console.error('Invalid response format:', result);
      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  async update(payload: { MaPN: string; MaSP: string; SoLuong: number; TongTien: number }) {
    const response = await fetch(this.base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  async delete(payload: { MaPN: string; MaSP: string }) {
    const response = await fetch(this.base, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
}

export const lichSuGiaoDichService = new LichSuGiaoDichService();
