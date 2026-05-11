import { INhanVien } from '@/types';

class NhanVienService {
  private base = '/api/nhan-vien';

  async getAll(): Promise<INhanVien[]> {
    const res = await fetch(this.base);
    const json = await res.json();
    return (json.ok && Array.isArray(json.data)) ? json.data : [];
  }

  async create(payload: Omit<INhanVien, 'MaNV'> & { MaNV: string }): Promise<any> {
    const res = await fetch(this.base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async update(MaNV: string, payload: Partial<INhanVien>): Promise<any> {
    const res = await fetch(this.base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaNV, ...payload }),
    });
    return res.json();
  }

  async delete(MaNV: string): Promise<any> {
    const res = await fetch(this.base, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaNV }),
    });
    return res.json();
  }
}

export const nhanVienService = new NhanVienService();
