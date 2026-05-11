import { INhaPhanPhoi } from '@/types';

const base = '/api/nha-phan-phoi';

export const nhaPhanPhoiService = {
  async getAll(): Promise<INhaPhanPhoi[]> {
    const res = await fetch(base);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fetch failed');
    return json.data || [];
  },

  async create(payload: Partial<INhaPhanPhoi>) {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Create failed');
    return json;
  },

  async update(maNPP: string, payload: Partial<INhaPhanPhoi>) {
    const res = await fetch(base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaNPP: maNPP, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return json;
  },

  async delete(maNPP: string) {
    const res = await fetch(base, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaNPP: maNPP }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Delete failed');
    return json;
  },
};

export default nhaPhanPhoiService;
