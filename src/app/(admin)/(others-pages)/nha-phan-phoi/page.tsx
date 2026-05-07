'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { INhaPhanPhoi } from '@/types';
import { nhaPhanPhoiService } from '@/services/NhaPhanPhoi.service';

export default function NhaPhanPhoiPage() {
  const [items, setItems] = useState<INhaPhanPhoi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<INhaPhanPhoi | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<INhaPhanPhoi>>({
    MaNPP: '',
    TenNPP: '',
    DiaChi: '',
    SDT: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await nhaPhanPhoiService.getAll();
      setItems(data || []);
    } catch (err) {
      console.error('Load nha phan phoi error:', err);
      alert('Lỗi tải dữ liệu: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const maNPP = String(item.MaNPP || '').toLowerCase();
      const tenNPP = String(item.TenNPP || '').toLowerCase();
      const diaChi = String(item.DiaChi || '').toLowerCase();
      const SDT = String(item.SDT || '').toLowerCase();
      return maNPP.includes(q) || tenNPP.includes(q) || diaChi.includes(q) || SDT.includes(q);
    });
  }, [items, search]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({ MaNPP: '', TenNPP: '', DiaChi: '', SDT: '' });
    setShowForm(true);
  };

  const openEditForm = (item: INhaPhanPhoi) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ MaNPP: '', TenNPP: '', DiaChi: '', SDT: '' });
    setIsSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.MaNPP?.trim() || !formData.TenNPP?.trim()) {
      alert('Vui lòng nhập mã và tên nhà phân phối');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem?.MaNPP) {
        await nhaPhanPhoiService.update(editingItem.MaNPP, formData);
        alert('Cập nhật thành công');
      } else {
        await nhaPhanPhoiService.create(formData);
        alert('Thêm mới thành công');
      }
      await loadData();
      closeForm();
    } catch (err) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: INhaPhanPhoi) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhà phân phối "${item.TenNPP}"?`)) return;

    try {
      await nhaPhanPhoiService.delete(item.MaNPP);
      alert('Xóa thành công');
      await loadData();
    } catch (err) {
      alert('Lỗi xóa: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Nhà Phân Phối</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin nhà cung cấp / nhà phân phối</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-brand-500 text-white px-5 py-2 rounded-lg hover:bg-brand-600 transition font-medium"
        >
          + Thêm Mới
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-theme-sm border border-gray-200">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã, tên, địa chỉ hoặc SĐT..."
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-theme-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
            <tr>
              <th className="p-3">Mã Nhà Phân Phối</th>
              <th className="p-3">Tên Nhà Phân Phối</th>
              <th className="p-3">Địa Chỉ</th>
              <th className="p-3">Số Điện Thoại</th>
              <th className="p-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.MaNPP} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.MaNPP}</td>
                  <td className="p-3">{item.TenNPP}</td>
                  <td className="p-3 text-sm text-gray-600">{item.DiaChi || '-'}</td>
                  <td className="p-3 text-sm text-gray-600">{item.SDT || '-'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEditForm(item)}
                      className="px-3 py-1 mr-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingItem ? 'Cập Nhật Nhà Phân Phối' : 'Thêm Mới Nhà Phân Phối'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã Nhà Phân Phối <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.MaNPP || ''}
                  onChange={(e) => setFormData({ ...formData, MaNPP: e.target.value })}
                  disabled={!!editingItem}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500 disabled:bg-gray-100"
                  placeholder="Ví dụ: NPP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Nhà Phân Phối <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.TenNPP || ''}
                  onChange={(e) => setFormData({ ...formData, TenNPP: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                  placeholder="Nhập tên nhà phân phối"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  value={formData.DiaChi || ''}
                  onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={formData.SDT || ''}
                  onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {isSaving ? 'Đang xử lý...' : editingItem ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
