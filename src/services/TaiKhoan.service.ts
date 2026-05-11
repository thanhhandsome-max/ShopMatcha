interface AccountItem {
  MaTK: string;
  TenDangNhap: string;
  MatKhau?: string;
  TrangThai?: number;
  NgayTao?: string;
  MaVaiTro?: string;
  TenVaiTro?: string;
}

interface RolePermissionItem {
  MaVaiTro: string;
  TenVaiTro: string;
  Permissions: string[];
}

class TaiKhoanService {
  private accountBase = '/api/tai-khoan';
  private roleBase = '/api/tai-khoan/vai-tro';

  async getAccounts(): Promise<AccountItem[]> {
    const res = await fetch(this.accountBase);
    const json = await res.json();
    return json.ok ? (json.data || []) : [];
  }

  async createAccount(payload: {
    MaTK: string;
    TenDangNhap: string;
    MatKhau: string;
    TrangThai?: number;
    MaVaiTro?: string;
  }) {
    const res = await fetch(this.accountBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Create account failed');
  }

  async updateAccount(payload: {
    MaTK: string;
    TenDangNhap?: string;
    MatKhau?: string;
    TrangThai?: number;
    MaVaiTro?: string;
  }) {
    const res = await fetch(this.accountBase, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Update account failed');
  }

  async deleteAccount(MaTK: string) {
    const res = await fetch(this.accountBase, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaTK }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Delete account failed');
  }

  async getRolePermissions(): Promise<{ roles: RolePermissionItem[]; allPermissions: string[] }> {
    const res = await fetch(this.roleBase);
    const json = await res.json();
    if (!json.ok) return { roles: [], allPermissions: [] };
    return { roles: json.data || [], allPermissions: json.allPermissions || [] };
  }

  async updateRolePermissions(MaVaiTro: string, Permissions: string[]) {
    const res = await fetch(this.roleBase, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaVaiTro, Permissions }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Update role permissions failed');
  }
}

export const taiKhoanService = new TaiKhoanService();
export type { AccountItem, RolePermissionItem };
