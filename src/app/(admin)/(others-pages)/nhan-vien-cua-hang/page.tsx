'use client';

import React, { useEffect, useState } from 'react';
import { ICuaHang, INhanVien } from '@/types';
import { nhanVienCuaHangService } from '@/services/NhanVienCuaHang.service';
import { cuaHangService } from '@/services/CuaHang.service';

interface IEmployee extends Record<string, any> {
  MaCH: string;
  MaNV: string;
  HoTen?: string;
  SDT?: string;
  Email?: string;
  ChucVu?: number;
  TrangThai?: number;
  NgayNhanChuc?: string;
}

const ChucVuMap = { 0: 'Nhân viên', 1: 'Trưởng cửa hàng', 2: 'Quản lý' };
const TrangThaiMap = { 0: 'Nghỉ', 1: 'Đang làm' };

export default function NhanVienCuaHangPage() {
  const [stores, setStores] = useState<ICuaHang[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allEmployees, setAllEmployees] = useState<INhanVien[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [adding, setAdding] = useState(false);
  const [editingEmp, setEditingEmp] = useState<IEmployee | null>(null);
  const [editingRole, setEditingRole] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState<number>(1);
  const [updating, setUpdating] = useState(false);

  const hasStoreManager = employees.some((emp) => Number(emp.ChucVu) === 1);

  const loadStores = async () => {
    try {
      const s = await cuaHangService.getAll();
      setStores(s || []);
      if (s && s.length && !selectedStore) setSelectedStore(String(s[0].MaCH || ''));
    } catch (err) {
      console.error('Load stores error', err);
    }
  };

  const loadEmployees = async (maCH: string) => {
    setLoading(true);
    try {
      const data = await nhanVienCuaHangService.getByStore(maCH);
      setEmployees(data || []);
    } catch (err) {
      console.error('Load employees error', err);
      setEmployees([]);
    } finally { setLoading(false); }
  };

  const loadAllEmployees = async () => {
    try {
      const data = await nhanVienCuaHangService.getAll();
      setAllEmployees(data || []);
    } catch (err) {
      console.error('Load all employees error', err);
    }
  };

  useEffect(() => { loadStores(); loadAllEmployees(); }, []);
  useEffect(() => { if (selectedStore) loadEmployees(selectedStore); }, [selectedStore]);

  const openAddForm = () => { setSelectedEmp(''); setSelectedRole(0); setShowAddForm(true); };
  const closeAddForm = () => { setShowAddForm(false); setSelectedEmp(''); setSelectedRole(0); };

  const handleAdd = async () => {
    if (!selectedEmp || !selectedStore) return;
    setAdding(true);
    try {
      await nhanVienCuaHangService.addToStore({ MaCH: selectedStore, MaNV: selectedEmp, ChucVu: selectedRole });
      await loadEmployees(selectedStore);
      closeAddForm();
      alert('Thêm nhân viên thành công');
    } catch (err) {
      console.error('Add employee error', err);
      alert('Thêm thất bại');
    } finally { setAdding(false); }
  };

  const openEditRole = (emp: IEmployee) => {
    setEditingEmp(emp);
    setEditingRole(emp.ChucVu ?? 0);
    setEditingStatus(emp.TrangThai ?? 1);
  };
  const closeEditRole = () => { setEditingEmp(null); };

  const handleUpdateRole = async () => {
    if (!editingEmp || !selectedStore) return;
    setUpdating(true);
    try {
      await nhanVienCuaHangService.updateRole(selectedStore, editingEmp.MaNV, editingRole, editingStatus);
      await loadEmployees(selectedStore);
      closeEditRole();
      alert('Cập nhật vai trò thành công');
    } catch (err) {
      console.error('Update role error', err);
      alert('Cập nhật thất bại');
    } finally { setUpdating(false); }
  };

  const handleRemove = async (emp: IEmployee) => {
    if (!confirm(`Bạn có chắc muốn xóa ${emp.HoTen} khỏi cửa hàng?`)) return;
    try {
      await nhanVienCuaHangService.removeFromStore(selectedStore, emp.MaNV);
      await loadEmployees(selectedStore);
      alert('Xóa nhân viên thành công');
    } catch (err) {
      console.error('Remove employee error', err);
      alert('Xóa thất bại');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý nhân viên cửa hàng</h1>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Chọn cửa hàng:</label>
        <select value={selectedStore} onChange={(e)=>setSelectedStore(e.target.value)} className="p-2 border rounded">
          {stores.map(s => (
            <option key={String(s.MaCH)} value={String(s.MaCH)}>{s.TenCH || s.MaCH}</option>
          ))}
        </select>
        <button onClick={openAddForm} className="ml-auto px-4 py-2 bg-brand-500 text-white rounded">Thêm nhân viên</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-3 text-left">Mã NV</th>
                <th className="p-3 text-left">Họ tên</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Chức vụ</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center">Đang tải...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center">Không có nhân viên</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.MaNV} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{emp.MaNV}</td>
                    <td className="p-3">{emp.HoTen || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{emp.SDT || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{emp.Email || '-'}</td>
                    <td className="p-3 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{ChucVuMap[emp.ChucVu as keyof typeof ChucVuMap] || 'Không xác định'}</span></td>
                    <td className="p-3 text-sm"><span className="px-2 py-1 bg-green-100 text-green-700 rounded">{TrangThaiMap[emp.TrangThai as keyof typeof TrangThaiMap] || 'Không xác định'}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => openEditRole(emp)} className="px-3 py-1 mr-2 text-sm bg-blue-100 text-blue-700 rounded">Sửa</button>
                      <button onClick={() => handleRemove(emp)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-9999 flex items-start justify-center pt-20 bg-black/30">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Thêm nhân viên vào cửa hàng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Chọn nhân viên</label>
                <select value={selectedEmp} onChange={(e)=>setSelectedEmp(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">-- Chọn --</option>
                  {allEmployees.filter(e => !employees.some(emp => emp.MaNV === e.MaNV)).map(e => (
                    <option key={e.MaNV} value={e.MaNV}>{e.HoTen} ({e.MaNV})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chức vụ</label>
                <select value={selectedRole} onChange={(e)=>setSelectedRole(Number(e.target.value))} className="w-full p-2 border rounded">
                  <option value={0}>Nhân viên</option>
                  <option value={1} disabled={hasStoreManager}>Trưởng cửa hàng{hasStoreManager ? ' (đã có)' : ''}</option>
                  <option value={2}>Quản lý</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button onClick={closeAddForm} className="px-4 py-2 border rounded">Hủy</button>
                <button onClick={handleAdd} disabled={adding || !selectedEmp} className="px-4 py-2 bg-brand-500 text-white rounded">{adding ? 'Đang thêm...' : 'Thêm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingEmp && (
        <div className="fixed inset-0 z-9999 flex items-start justify-center pt-20 bg-black/30">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Cập nhật vai trò</h2>
            <p className="mb-4 text-sm text-gray-600">{editingEmp.HoTen} ({editingEmp.MaNV})</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chức vụ</label>
                <select value={editingRole} onChange={(e)=>setEditingRole(Number(e.target.value))} className="w-full p-2 border rounded">
                  <option value={0}>Nhân viên</option>
                  <option value={1} disabled={employees.some((emp) => Number(emp.ChucVu) === 1 && emp.MaNV !== editingEmp.MaNV)}>Trưởng cửa hàng</option>
                  <option value={2}>Quản lý</option>
                </select>

              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select value={editingStatus} onChange={(e)=>setEditingStatus(Number(e.target.value))} className="w-full p-2 border rounded">
                  <option value={1}>Đang làm</option>
                  <option value={0}>Nghỉ</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeEditRole} className="px-4 py-2 border rounded">Hủy</button>
                <button onClick={handleUpdateRole} disabled={updating} className="px-4 py-2 bg-brand-500 text-white rounded">{updating ? 'Đang cập nhật...' : 'Cập nhật'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
