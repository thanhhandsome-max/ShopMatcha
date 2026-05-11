import { ICuaHang } from '@/types';

class CuaHangService {
  private base = '/api/cua-hang';

  async getAll(): Promise<ICuaHang[]> {
    const res = await fetch(this.base);
    const json = await res.json();
    return (json.ok && Array.isArray(json.data)) ? json.data : [];
  }

  async create(payload: Partial<ICuaHang>) {
    const res = await fetch(this.base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res.json();
  }

  async update(maCH: string, payload: Partial<ICuaHang>) {
    const body = { MaCH: maCH, ...payload };
    const res = await fetch(this.base, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  }

  async delete(maCH: string) {
    const res = await fetch(this.base, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ MaCH: maCH }) });
    return res.json();
  }
}

export const cuaHangService = new CuaHangService();
