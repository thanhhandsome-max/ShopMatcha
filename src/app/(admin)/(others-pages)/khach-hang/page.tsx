'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { IKhachHang } from '@/types';
import { khachHangService } from '@/services/KhachHang.service';

export default function KhachHangPage() {
  const [items, setItems] = useState<IKhachHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IKhachHang | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<IKhachHang>>({
    MaKH: '',
    TenKH: '',
    SDT: '',
    NgaySinh: '',
    GioiTinh: '',
    DiaChi: '',
    Email: '',
    TrangThai: 1,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await khachHangService.getAll();
      setItems(data || []);
    } catch (err) {
      console.error('Load customers error', err);
      alert('Lỗi tải dữ liệu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const id = String(item.MaKH || '').toLowerCase();
      const name = String(item.TenKH || '').toLowerCase();
      const phone = String(item.SDT || '').toLowerCase();
      const email = String(item.Email || '').toLowerCase();
      const address = String(item.DiaChi || '').toLowerCase();
      return id.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q) || address.includes(q);
    });
  }, [items, search]);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({
      MaKH: '',
      TenKH: '',
      SDT: '',
      NgaySinh: '',
      GioiTinh: '',
      DiaChi: '',
      Email: '',
      TrangThai: 1,
    });
    setShowForm(true);
  };

  const openEdit = (item: IKhachHang) => {
    setEditingItem(item);
    setFormData({
      MaKH: item.MaKH,
      TenKH: item.TenKH,
      SDT: item.SDT || '',
      NgaySinh: item.NgaySinh ? String(item.NgaySinh).slice(0, 10) : '',
      GioiTinh: item.GioiTinh || '',
      DiaChi: item.DiaChi || '',
      Email: item.Email || '',
      TrangThai: Number(item.TrangThai ?? 1),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ MaKH: '', TenKH: '', SDT: '', NgaySinh: '', GioiTinh: '', DiaChi: '', Email: '', TrangThai: 1 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!String(formData.MaKH || '').trim() || !String(formData.TenKH || '').trim()) {
      alert('Mã khách hàng và tên khách hàng là bắt buộc');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await khachHangService.update(editingItem.MaKH, formData);
      } else {
        await khachHangService.create(formData);
      }
      await loadData();
      closeForm();
    } catch (err) {
      alert('Lưu thất bại: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: IKhachHang) => {
    if (!confirm(`Bạn có chắc muốn xóa khách hàng ${item.TenKH} (${item.MaKH})?`)) return;
    try {
      await khachHangService.delete(item.MaKH);
      await loadData();
    } catch (err) {
      alert('Xóa thất bại: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border p-2"
            placeholder="Tìm mã/tên/sđt/email..."
          />
          <button onClick={openCreate} className="rounded bg-brand-500 px-4 py-2 text-white">
            Thêm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded bg-white shadow">
        <div className="max-h-[65vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-3 text-left">Mã KH</th>
                <th className="p-3 text-left">Tên khách hàng</th>
                <th className="p-3 text-left">SDT</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.MaKH} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.MaKH}</td>
                    <td className="p-3">{item.TenKH}</td>
                    <td className="p-3">{item.SDT || '-'}</td>
                    <td className="p-3">{item.Email || '-'}</td>
                    <td className="p-3">{item.DiaChi || '-'}</td>
                    <td className="p-3">
                      {Number(item.TrangThai ?? 1) === 1 ? (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Kích hoạt</span>
                      ) : (
                        <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700">Ngừng kích hoạt</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEdit(item)} className="mr-2 rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(item)} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">{editingItem ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Mã khách hàng</label>
                <input
                  value={String(formData.MaKH || '')}
                  onChange={(e) => setFormData((prev) => ({ ...prev, MaKH: e.target.value }))}
                  disabled={!!editingItem}
                  className="w-full rounded border p-2.5 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tên khách hàng</label>
                <input
                  value={String(formData.TenKH || '')}
                  onChange={(e) => setFormData((prev) => ({ ...prev, TenKH: e.target.value }))}
                  className="w-full rounded border p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">SDT</label>
                  <input
                    value={String(formData.SDT || '')}
                    onChange={(e) => setFormData((prev) => ({ ...prev, SDT: e.target.value }))}
                    className="w-full rounded border p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    value={String(formData.Email || '')}
                    onChange={(e) => setFormData((prev) => ({ ...prev, Email: e.target.value }))}
                    className="w-full rounded border p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Ngày sinh</label>
                  <input
                    type="date"
                    value={String(formData.NgaySinh || '')}
                    onChange={(e) => setFormData((prev) => ({ ...prev, NgaySinh: e.target.value }))}
                    className="w-full rounded border p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Giới tính</label>
                  <select
                    value={String(formData.GioiTinh || '')}
                    onChange={(e) => setFormData((prev) => ({ ...prev, GioiTinh: e.target.value }))}
                    className="w-full rounded border p-2.5"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Địa chỉ</label>
                <input
                  value={String(formData.DiaChi || '')}
                  onChange={(e) => setFormData((prev) => ({ ...prev, DiaChi: e.target.value }))}
                  className="w-full rounded border p-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Trạng thái</label>
                <select
                  value={Number(formData.TrangThai ?? 1)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, TrangThai: Number(e.target.value) }))}
                  className="w-full rounded border p-2.5"
                >
                  <option value={1}>Kích hoạt</option>
                  <option value={0}>Ngừng kích hoạt</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="rounded border px-4 py-2">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="rounded bg-brand-500 px-4 py-2 text-white disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
