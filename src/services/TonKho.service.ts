// src/services/TonKho.service.ts
import { ITonKho } from '@/types';

const base = '/api/tonkho';

export const tonKhoService = {
	async getAll(): Promise<ITonKho[]> {
		const res = await fetch(base);
		const json = await res.json();
		if (!res.ok) throw new Error(json.error || 'Fetch failed');
		return json.data || json;
	},

	async create(payload: { MaKho: string; MaSP: string; SoLuong: number; GhiChu?: string; NgayCapNhat?: string }) {
		const res = await fetch(base, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		const json = await res.json();
		if (!res.ok) throw new Error(json.error || 'Create failed');
		return json;
	},

	async update(MaKho: string, MaSP: string, payload: { SoLuong: number; GhiChu?: string; NgayCapNhat?: string }) {
		const res = await fetch(base, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ MaKho, MaSP, ...payload }),
		});
		const json = await res.json();
		if (!res.ok) throw new Error(json.error || 'Update failed');
		return json;
	},

	async delete(MaKho: string, MaSP: string) {
		const res = await fetch(base, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ MaKho, MaSP }),
		});
		const json = await res.json();
		if (!res.ok) throw new Error(json.error || 'Delete failed');
		return json;
	},
};

export default tonKhoService;
