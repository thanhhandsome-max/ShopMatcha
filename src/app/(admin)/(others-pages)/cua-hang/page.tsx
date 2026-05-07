'use client';

import React, { useEffect, useState } from 'react';
import { ICuaHang } from '@/types';
import { cuaHangService } from '@/services/CuaHang.service';

export default function CuaHangPage() {
  const [items, setItems] = useState<ICuaHang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ICuaHang | null>(null);
  const [formData, setFormData] = useState<Partial<ICuaHang>>({ MaCH: '', TenCH: '', DiaChi: '', SDT: '' });
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await cuaHangService.getAll();
      setItems(data || []);
    } catch (err) {
      console.error('Load cua hang error', err);
      alert('Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = items.filter(i => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (i.MaCH || '').toLowerCase().includes(q) || (i.TenCH || '').toLowerCase().includes(q) || (i.DiaChi || '').toLowerCase().includes(q) || (i.SDT || '').toLowerCase().includes(q);
  });

  const openCreate = () => { setEditingItem(null); setFormData({ MaCH: '', TenCH: '', DiaChi: '', SDT: '' }); setShowForm(true); };
  const openEdit = (item: ICuaHang) => { setEditingItem(item); setFormData(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); setFormData({ MaCH: '', TenCH: '', DiaChi: '', SDT: '' }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.MaCH || !formData.TenCH) { alert('Mã và tên cửa hàng là bắt buộc'); return; }
    setIsSaving(true);
    try {
      if (editingItem) {
        await cuaHangService.update(editingItem.MaCH, formData);
      } else {
        await cuaHangService.create(formData);
      }
      await loadData();
      closeForm();
    } catch (err) {
      console.error('Save cua hang error', err);
      alert('Lưu thất bại');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (item: ICuaHang) => {
    if (!confirm(`Bạn có chắc muốn xóa cửa hàng ${item.TenCH} (${item.MaCH})?`)) return;
    try {
      await cuaHangService.delete(item.MaCH);
      await loadData();
    } catch (err) {
      console.error('Delete cua hang error', err);
      alert('Xóa thất bại');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý cửa hàng</h1>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded" placeholder="Tìm mã/tên/địa chỉ..." />
          <button onClick={openCreate} className="px-4 py-2 bg-brand-500 text-white rounded">Thêm mới</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-3 text-left">Mã</th>
                <th className="p-3 text-left">Tên</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">Không có dữ liệu</td></tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it.MaCH} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{it.MaCH}</td>
                    <td className="p-3">{it.TenCH}</td>
                    <td className="p-3 text-sm text-gray-600">{it.DiaChi || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{it.SDT || '-'}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEdit(it)} className="px-3 py-1 mr-2 text-sm bg-blue-100 text-blue-700 rounded">Sửa</button>
                      <button onClick={() => handleDelete(it)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Xóa</button>
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
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Sửa cửa hàng' : 'Thêm cửa hàng'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã cửa hàng</label>
                <input value={formData.MaCH || ''} onChange={(e)=>setFormData({...formData, MaCH: e.target.value})} disabled={!!editingItem} className="w-full p-2.5 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên cửa hàng</label>
                <input value={formData.TenCH || ''} onChange={(e)=>setFormData({...formData, TenCH: e.target.value})} className="w-full p-2.5 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input value={formData.DiaChi || ''} onChange={(e)=>setFormData({...formData, DiaChi: e.target.value})} className="w-full p-2.5 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input value={formData.SDT || ''} onChange={(e)=>setFormData({...formData, SDT: e.target.value})} className="w-full p-2.5 border rounded" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 border rounded">Hủy</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-brand-500 text-white rounded">{isSaving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
