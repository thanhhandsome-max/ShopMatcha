import { ICuaHang, ISanPham, ITonKhoCuaHang } from '@/types';

const base = '/api/ton-kho-cua-hang';

export interface ITonKhoCuaHangDisplay extends ITonKhoCuaHang {
  TenCH?: string;
  TenSanPham?: string;
  GiaVon?: number;
  GiaBan?: number;
}

export interface ITonKhoCuaHangResponse {
  data: ITonKhoCuaHangDisplay[];
  stores?: ICuaHang[];
  products?: ISanPham[];
  meta?: {
    inventoryTable?: string | null;
    storeTable?: string | null;
    productTable?: string | null;
  };
}

export const tonKhoCuaHangService = {
  async getAll(): Promise<ITonKhoCuaHangResponse> {
    const res = await fetch(base);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fetch failed');
    return json;
  },

  async create(payload: { MaCH: string; MaSP: string; SoLuong: number; GhiChu?: string; NgayCapNhat?: string }) {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Create failed');
    return json;
  },

  async update(MaCH: string, MaSP: string, payload: { SoLuong: number; GhiChu?: string; NgayCapNhat?: string }) {
    const res = await fetch(base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaCH, MaSP, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return json;
  },

  async delete(MaCH: string, MaSP: string) {
    const res = await fetch(base, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaCH, MaSP }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Delete failed');
    return json;
  },
};

export default tonKhoCuaHangService;