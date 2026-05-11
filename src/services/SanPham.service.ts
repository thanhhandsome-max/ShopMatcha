import { ISanPham } from '@/types';

const base = '/api/san-pham';

type SanPhamPayload = Partial<ISanPham>;

export const sanPhamService = {
    async getAll() {
        const res = await fetch(base);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Fetch failed');
        return json.data;
    },
    async create(payload: SanPhamPayload) {
        const res = await fetch(base, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Create failed');
        return json.data || json;
    },
    async update(maSP: string, payload: SanPhamPayload) {
        const res = await fetch(base, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MaSP: maSP, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed');
        return json.data || json;
    },
    async delete(maSP: string) {
        const res = await fetch(base, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MaSP: maSP }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Delete failed');
        return json;
    }
};  
