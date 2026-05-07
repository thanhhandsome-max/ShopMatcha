import { IKhachHang } from '@/types';

class KhachHangService {
  private base = '/api/khach-hang';

  async getAll(): Promise<IKhachHang[]> {
    const res = await fetch(this.base);
    const json = await res.json();
    return json.ok ? (json.data || []) : [];
  }

  async create(payload: Partial<IKhachHang>) {
    const res = await fetch(this.base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Create customer failed');
  }

  async update(maKH: string, payload: Partial<IKhachHang>) {
    const res = await fetch(this.base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaKH: maKH, ...payload }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Update customer failed');
  }

  async delete(maKH: string) {
    const res = await fetch(this.base, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaKH: maKH }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Delete customer failed');
  }
}

export const khachHangService = new KhachHangService();
