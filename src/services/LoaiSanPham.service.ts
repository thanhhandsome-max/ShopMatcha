// src/services/LoaiSanPham.service.ts
const base = '/api/loai-san-pham';

export const loaiSanPhamService = {
    async getAll() {
        const res = await fetch(base);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Fetch failed');
        return json.data;
    },
    async create(payload: { MaLoai: string; TenLoai: string; MoTa?: string }) {
        const res = await fetch(base, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Create failed');
        return json;
    },
    async update(MaLoai: string, TenLoai: string, MoTa?: string) {
        const res = await fetch(base, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MaLoai: MaLoai, TenLoai: TenLoai, MoTa: MoTa }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed');
        return json;
    },
    async delete(MaLoai: string) {
        const res = await fetch(base, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MaLoai: MaLoai }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Delete failed');
        return json;
    }
};