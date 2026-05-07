'use client';

import React, { useEffect, useState } from 'react';
import { INhanVien } from '@/types';
import { nhanVienService } from '@/services/NhanVien.service';
import ComponentCard from '@/components/common/ComponentCard';

interface IEmployee extends Record<string, any> {
  MaNV: string;
  HoTen: string;
  SDT?: string;
  Email?: string;
  DiaChi?: string;
  LuongNen?: number;
  TrangThai?: number;
  NgayNhanChuc?: string;
}

const TrangThaiMap = { 0: 'Nghỉ', 1: 'Đang làm' };

export default function NhanVienPage() {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmp, setEditingEmp] = useState<IEmployee | null>(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    MaNV: '',
    HoTen: '',
    SDT: '',
    Email: '',
    DiaChi: '',
    LuongNen: '',
    TrangThai: 1,
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await nhanVienService.getAll();
      setEmployees(data || []);
    } catch (err) {
      console.error('Load employees error', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAddForm = () => {
    setFormData({ MaNV: '', HoTen: '', SDT: '', Email: '', DiaChi: '', LuongNen: '', TrangThai: 1 });
    setEditingEmp(null);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingEmp(null);
    setFormData({ MaNV: '', HoTen: '', SDT: '', Email: '', DiaChi: '', LuongNen: '', TrangThai: 1 });
  };

  const openEditForm = (emp: IEmployee) => {
    setFormData({
      MaNV: emp.MaNV,
      HoTen: emp.HoTen,
      SDT: emp.SDT || '',
      Email: emp.Email || '',
      DiaChi: emp.DiaChi || '',
      LuongNen: emp.LuongNen || '',
      TrangThai: emp.TrangThai || 1,
    });
    setEditingEmp(emp);
    setShowAddForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'LuongNen' ? (value ? parseFloat(value) : '') : (name === 'TrangThai' ? Number(value) : value),
    }));
  };

  const handleAdd = async () => {
    if (!formData.MaNV || !formData.HoTen) {
      alert('Vui lòng nhập Mã NV và Họ tên');
      return;
    }

    setAdding(true);
    try {
      const payload = {
        MaNV: formData.MaNV,
        HoTen: formData.HoTen,
        SDT: formData.SDT || undefined,
        Email: formData.Email || undefined,
        DiaChi: formData.DiaChi || undefined,
        LuongNen: formData.LuongNen ? parseFloat(String(formData.LuongNen)) : undefined,
        TrangThai: formData.TrangThai,
      };
      await nhanVienService.create(payload);
      await loadEmployees();
      closeForm();
      alert('Thêm nhân viên thành công');
    } catch (err) {
      console.error('Add employee error', err);
      alert('Thêm thất bại');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingEmp || !formData.HoTen) {
      alert('Vui lòng nhập Họ tên');
      return;
    }

    setUpdating(true);
    try {
      const payload: any = {
        HoTen: formData.HoTen,
        TrangThai: formData.TrangThai,
      };
      if (formData.SDT) payload.SDT = formData.SDT;
      if (formData.Email) payload.Email = formData.Email;
      if (formData.DiaChi) payload.DiaChi = formData.DiaChi;
      if (formData.LuongNen) payload.LuongNen = parseFloat(String(formData.LuongNen));

      await nhanVienService.update(editingEmp.MaNV, payload);
      await loadEmployees();
      closeForm();
      alert('Cập nhật thành công');
    } catch (err) {
      console.error('Update employee error', err);
      alert('Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (emp: IEmployee) => {
    if (!confirm(`Bạn có chắc muốn xóa ${emp.HoTen}?`)) return;
    try {
      await nhanVienService.delete(emp.MaNV);
      await loadEmployees();
      alert('Xóa thành công');
    } catch (err) {
      console.error('Delete employee error', err);
      alert('Xóa thất bại');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.MaNV.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.SDT && emp.SDT.includes(searchTerm))
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo Mã NV, Họ tên hoặc SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button onClick={openAddForm} className="rounded bg-brand-500 px-4 py-2 text-white">
          Thêm nhân viên
        </button>
      </div>

      <ComponentCard>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-3 text-left">Mã NV</th>
                <th className="p-3 text-left">Họ tên</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    Không có nhân viên
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.MaNV} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{emp.MaNV}</td>
                    <td className="p-3">{emp.HoTen}</td>
                    <td className="p-3 text-sm text-gray-600">{emp.SDT || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{emp.Email || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{emp.DiaChi || '-'}</td>
                    <td className="p-3 text-sm">
                      <span className={`rounded px-2 py-1 ${emp.TrangThai === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {TrangThaiMap[emp.TrangThai as keyof typeof TrangThaiMap] || 'Không xác định'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEditForm(emp)} className="mr-2 rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(emp)} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      {showAddForm && (
        <div className="fixed inset-0 z-9999 flex items-start justify-center pt-20 bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold">{editingEmp ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!editingEmp && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mã NV <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="MaNV"
                    value={formData.MaNV}
                    onChange={handleInputChange}
                    placeholder="NV001"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Họ tên <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  name="HoTen"
                  value={formData.HoTen}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">SĐT</label>
                <input
                  type="text"
                  name="SDT"
                  value={formData.SDT}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Địa chỉ</label>
                <textarea
                  name="DiaChi"
                  value={formData.DiaChi}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ nhân viên"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Lương nền</label>
                <input
                  type="number"
                  name="LuongNen"
                  value={formData.LuongNen}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Trạng thái</label>
                <select name="TrangThai" value={formData.TrangThai} onChange={handleInputChange} className="w-full rounded border border-gray-300 px-3 py-2">
                  <option value={1}>Đang làm</option>
                  <option value={0}>Nghỉ</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button onClick={closeForm} className="rounded border border-gray-300 px-4 py-2">
                  Hủy
                </button>
                <button
                  onClick={editingEmp ? handleUpdate : handleAdd}
                  disabled={adding || updating}
                  className="rounded bg-brand-500 px-4 py-2 text-white disabled:bg-gray-400"
                >
                  {adding || updating ? 'Đang xử lý...' : editingEmp ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
