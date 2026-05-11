import { ICuaHang_NhanVien } from '@/types';

class NhanVienCuaHangService {
  private base = '/api/cua-hang/nhan-vien';

  async getAll(): Promise<ICuaHang_NhanVien[]> {
    const res = await fetch(this.base);
    const json = await res.json();
    return (json.ok && Array.isArray(json.data)) ? json.data : [];
  }

  async getByStore(maCH: string): Promise<ICuaHang_NhanVien[]> {
    const url = `${this.base}?maCH=${encodeURIComponent(maCH)}`;
    const res = await fetch(url);
    const json = await res.json();
    return (json.ok && Array.isArray(json.data)) ? json.data : [];
  }

  async addToStore(payload: { MaCH: string; MaNV: string; ChucVu?: number }) {
    const res = await fetch(this.base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res.json();
  }

  async updateRole(MaCH: string, MaNV: string, ChucVu?: number, TrangThai?: number) {
    const res = await fetch(this.base, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ MaCH, MaNV, ChucVu, TrangThai }) });
    return res.json();
  }

  async removeFromStore(MaCH: string, MaNV: string) {
    const res = await fetch(this.base, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ MaCH, MaNV }) });
    return res.json();
  }
}

export const nhanVienCuaHangService = new NhanVienCuaHangService();
