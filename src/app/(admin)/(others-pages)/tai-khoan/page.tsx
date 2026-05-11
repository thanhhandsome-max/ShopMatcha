'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AccountItem, RolePermissionItem, taiKhoanService } from '@/services/TaiKhoan.service';

const roleLabelMap: Record<string, string> = {
  Admin: 'Admin',
  MGR: 'Quản lý kho',
  STAFF: 'Nhân viên',
  CASHIER: 'Thu ngân',
  ThuNgan: 'Thu ngân',
};

export default function TaiKhoanPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [roles, setRoles] = useState<RolePermissionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AccountItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    MaTK: string;
    TenDangNhap: string;
    MatKhau: string;
    TrangThai: number;
    MaVaiTro: string;
  }>({
    MaTK: '',
    TenDangNhap: '',
    MatKhau: '',
    TrangThai: 1,
    MaVaiTro: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountData, roleData] = await Promise.all([taiKhoanService.getAccounts(), taiKhoanService.getRolePermissions()]);

      setAccounts(accountData || []);
      setRoles(roleData.roles || []);
    } catch (err) {
      console.error('Load account management data error', err);
      alert('Lỗi tải dữ liệu quản lý tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter((acc) => {
      const id = String(acc.MaTK || '').toLowerCase();
      const user = String(acc.TenDangNhap || '').toLowerCase();
      const roleName = String(acc.TenVaiTro || '').toLowerCase();
      return id.includes(q) || user.includes(q) || roleName.includes(q);
    });
  }, [accounts, search]);

  const openCreate = () => {
    setEditing(null);
    setFormData({
      MaTK: '',
      TenDangNhap: '',
      MatKhau: '',
      TrangThai: 1,
      MaVaiTro: roles[0]?.MaVaiTro || '',
    });
    setShowForm(true);
  };

  const openEdit = (item: AccountItem) => {
    setEditing(item);
    setFormData({
      MaTK: item.MaTK,
      TenDangNhap: item.TenDangNhap || '',
      MatKhau: '',
      TrangThai: Number(item.TrangThai ?? 1),
      MaVaiTro: item.MaVaiTro || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ MaTK: '', TenDangNhap: '', MatKhau: '', TrangThai: 1, MaVaiTro: '' });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.MaTK.trim() || !formData.TenDangNhap.trim()) {
      alert('Vui lòng nhập mã tài khoản và tên đăng nhập');
      return;
    }

    if (!editing && !formData.MatKhau.trim()) {
      alert('Vui lòng nhập mật khẩu khi tạo mới');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await taiKhoanService.updateAccount({
          MaTK: formData.MaTK,
          TenDangNhap: formData.TenDangNhap,
          MatKhau: formData.MatKhau || undefined,
          TrangThai: formData.TrangThai,
          MaVaiTro: formData.MaVaiTro || undefined,
        });
      } else {
        await taiKhoanService.createAccount({
          MaTK: formData.MaTK,
          TenDangNhap: formData.TenDangNhap,
          MatKhau: formData.MatKhau,
          TrangThai: formData.TrangThai,
          MaVaiTro: formData.MaVaiTro || undefined,
        });
      }
      await loadData();
      closeForm();
    } catch (err) {
      alert('Lỗi lưu tài khoản: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const removeAccount = async (item: AccountItem) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${item.TenDangNhap}?`)) return;
    try {
      await taiKhoanService.deleteAccount(item.MaTK);
      await loadData();
    } catch (err) {
      alert('Lỗi xóa tài khoản: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const toggleStatus = async (item: AccountItem) => {
    try {
      const nextStatus = Number(item.TrangThai ?? 1) === 1 ? 0 : 1;
      await taiKhoanService.updateAccount({ MaTK: item.MaTK, TrangThai: nextStatus });
      await loadData();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const changeRoleQuick = async (item: AccountItem, maVaiTro: string) => {
    try {
      await taiKhoanService.updateAccount({ MaTK: item.MaTK, MaVaiTro: maVaiTro });
      await loadData();
    } catch (err) {
      alert('Lỗi đổi vai trò: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const roleDisplay = (maVaiTro?: string, tenVaiTro?: string) => {
    if (tenVaiTro && tenVaiTro.trim()) return tenVaiTro;
    if (!maVaiTro) return 'Chưa gán';
    return roleLabelMap[maVaiTro] || maVaiTro;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">Tạo/sửa/xóa tài khoản, đổi trạng thái kích hoạt và thay đổi vai trò nhanh.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-500 px-5 py-2 text-white">
          + Thêm tài khoản
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-theme-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo mã tài khoản, tên đăng nhập, vai trò..."
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-theme-sm">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3">Mã tài khoản</th>
              <th className="p-3">Tên đăng nhập</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              filteredAccounts.map((item) => (
                <tr key={item.MaTK} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.MaTK}</td>
                  <td className="p-3">{item.TenDangNhap}</td>
                  <td className="p-3">
                    <select
                      value={item.MaVaiTro || ''}
                      onChange={(e) => changeRoleQuick(item, e.target.value)}
                      className="w-full rounded border border-gray-300 p-1.5 text-sm"
                    >
                      <option value="">-- Chưa gán --</option>
                      {roles.map((role) => (
                        <option key={role.MaVaiTro} value={role.MaVaiTro}>
                          {roleDisplay(role.MaVaiTro, role.TenVaiTro)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`rounded px-3 py-1 text-sm ${Number(item.TrangThai ?? 1) === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {Number(item.TrangThai ?? 1) === 1 ? 'Kích hoạt' : 'Ngừng kích hoạt'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(item)} className="mr-2 rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">
                      Sửa
                    </button>
                    <button onClick={() => removeAccount(item)} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-800">{editing ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h2>
            <form onSubmit={submitForm} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Mã tài khoản</label>
                <input
                  value={formData.MaTK}
                  onChange={(e) => setFormData((p) => ({ ...p, MaTK: e.target.value }))}
                  disabled={!!editing}
                  className="w-full rounded-lg border border-gray-300 p-2.5 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tên đăng nhập</label>
                <input
                  value={formData.TenDangNhap}
                  onChange={(e) => setFormData((p) => ({ ...p, TenDangNhap: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Mật khẩu {editing ? '(để trống nếu giữ nguyên)' : ''}</label>
                <input
                  type="password"
                  value={formData.MatKhau}
                  onChange={(e) => setFormData((p) => ({ ...p, MatKhau: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Vai trò</label>
                <select
                  value={formData.MaVaiTro}
                  onChange={(e) => setFormData((p) => ({ ...p, MaVaiTro: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map((role) => (
                    <option key={role.MaVaiTro} value={role.MaVaiTro}>
                      {roleDisplay(role.MaVaiTro, role.TenVaiTro)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Trạng thái tài khoản</label>
                <select
                  value={formData.TrangThai}
                  onChange={(e) => setFormData((p) => ({ ...p, TrangThai: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                >
                  <option value={1}>Kích hoạt</option>
                  <option value={0}>Ngừng kích hoạt</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
