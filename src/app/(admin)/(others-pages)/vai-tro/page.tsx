'use client';

import React, { useEffect, useState } from 'react';
import { RolePermissionItem, taiKhoanService } from '@/services/TaiKhoan.service';

const roleLabelMap: Record<string, string> = {
  Admin: 'Admin',
  MGR: 'Quản lý kho',
  STAFF: 'Nhân viên',
  CASHIER: 'Thu ngân',
  ThuNgan: 'Thu ngân',
};

export default function VaiTroPage() {
  const [roles, setRoles] = useState<RolePermissionItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [activeRoleId, setActiveRoleId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const roleDisplay = (maVaiTro?: string, tenVaiTro?: string) => {
    if (tenVaiTro && tenVaiTro.trim()) return tenVaiTro;
    if (!maVaiTro) return 'Chưa gán';
    return roleLabelMap[maVaiTro] || maVaiTro;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const roleData = await taiKhoanService.getRolePermissions();
      const roleList = roleData.roles || [];
      setRoles(roleList);
      setAllPermissions(roleData.allPermissions || []);

      const firstRole = roleList[0]?.MaVaiTro || '';
      const roleToUse = activeRoleId || firstRole;
      setActiveRoleId(roleToUse);
      const roleMatch = roleList.find((role) => role.MaVaiTro === roleToUse);
      setSelectedPermissions(roleMatch?.Permissions || []);
    } catch (err) {
      console.error('Load role data error', err);
      alert('Lỗi tải dữ liệu vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.MaVaiTro === activeRoleId);
    setSelectedPermissions(role?.Permissions || []);
  }, [activeRoleId, roles]);

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((x) => x !== permission) : [...prev, permission],
    );
  };

  const saveRolePermissions = async () => {
    if (!activeRoleId) {
      alert('Vui lòng chọn vai trò');
      return;
    }

    setSaving(true);
    try {
      await taiKhoanService.updateRolePermissions(activeRoleId, selectedPermissions);
      await loadData();
      alert('Cập nhật quyền theo vai trò thành công');
    } catch (err) {
      alert('Lỗi cập nhật quyền: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý vai trò</h1>
          <p className="mt-1 text-sm text-gray-500">Gán và thu hồi quyền theo vai trò (Admin, Quản lý kho, Thu ngân, Nhân viên...)</p>
        </div>
        <button
          onClick={saveRolePermissions}
          disabled={saving || !activeRoleId || loading}
          className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu quyền'}
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-theme-sm">
        <label className="mb-1 block text-sm font-medium text-gray-700">Vai trò</label>
        <select
          value={activeRoleId}
          onChange={(e) => setActiveRoleId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm md:max-w-md"
          disabled={loading}
        >
          <option value="">-- Chọn vai trò --</option>
          {roles.map((role) => (
            <option key={role.MaVaiTro} value={role.MaVaiTro}>
              {roleDisplay(role.MaVaiTro, role.TenVaiTro)}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-theme-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Danh sách quyền</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : allPermissions.length === 0 ? (
          <p className="text-sm text-gray-500">Không có dữ liệu quyền</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {allPermissions.map((permission) => (
              <label key={permission} className="flex items-center gap-2 rounded border border-gray-200 p-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  disabled={!activeRoleId}
                />
                <span>{permission}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
