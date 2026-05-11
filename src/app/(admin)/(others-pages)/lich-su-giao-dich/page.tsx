'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ILichSuGiaoDichDisplay } from '@/services/LichSuGiaoDich.service';
import { lichSuGiaoDichService } from '@/services/LichSuGiaoDich.service';
import { nhaPhanPhoiService } from '@/services/NhaPhanPhoi.service';
import { INhaPhanPhoi } from '@/types';

export default function LichSuGiaoDichPage() {
  const [items, setItems] = useState<ILichSuGiaoDichDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maNPPFilter, setMaNPPFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [suppliers, setSuppliers] = useState<INhaPhanPhoi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ILichSuGiaoDichDisplay | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<{ MaPN: string; MaSP: string; SoLuong: string; GiaNhap: string }>({
    MaPN: '',
    MaSP: '',
    SoLuong: '',
    GiaNhap: '',
  });

  const loadSuppliers = async () => {
    try {
      const data = await nhaPhanPhoiService.getAll();
      setSuppliers(data || []);
    } catch (err) {
      console.error('Load suppliers error:', err);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await lichSuGiaoDichService.getAll({
        maSP: search,
        maNPP: maNPPFilter,
        fromDate: fromDate,
        toDate: toDate,
      });
      setItems(data || []);
    } catch (err) {
      console.error('Load transaction history error:', err);
      alert('Lỗi tải dữ liệu: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    loadData();
  }, [search, maNPPFilter, fromDate, toDate]);

  const handleImportWarehouse = () => {
    alert('Chức năng nhập kho sẽ được phát triển');
    // TODO: Implement import warehouse functionality
  };

  const openEditForm = (item: ILichSuGiaoDichDisplay) => {
    setEditingItem(item);
    setFormData({
      MaPN: item.MaPN || '',
      MaSP: item.MaSP || '',
      SoLuong: String(item.SoLuong ?? 0),
      GiaNhap: String(item.GiaNhap ?? 0),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ MaPN: '', MaSP: '', SoLuong: '', GiaNhap: '' });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingItem) return;

    const soLuong = Number(formData.SoLuong);
    const giaNhap = Number(formData.GiaNhap);

    if (!formData.MaPN || !formData.MaSP || Number.isNaN(soLuong) || Number.isNaN(giaNhap)) {
      alert('Vui lòng nhập đầy đủ dữ liệu hợp lệ.');
      return;
    }

    setIsSaving(true);
    try {
      await lichSuGiaoDichService.update({
        MaPN: formData.MaPN,
        MaSP: formData.MaSP,
        SoLuong: soLuong,
        TongTien: soLuong * giaNhap,
      });
      await loadData();
      closeForm();
    } catch (err) {
      console.error('Update transaction error:', err);
      alert('Cập nhật giao dịch thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: ILichSuGiaoDichDisplay) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa giao dịch ${item.MaPN} - ${item.MaSP} không?`
    );
    if (!confirmed) return;

    try {
      await lichSuGiaoDichService.delete({ MaPN: item.MaPN, MaSP: item.MaSP });
      await loadData();
    } catch (err) {
      console.error('Delete transaction error:', err);
      alert('Xóa giao dịch thất bại.');
    }
  };

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.SoLuong || 0), 0),
    [items]
  );
  const totalCost = useMemo(
    () => items.reduce((sum, item) => sum +  (item.GiaNhap || 0), 0),
    [items]
  );
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.ThanhTien || 0), 0),
    [items]
  );

  return (
    <div className="p-4 sm:p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Lịch Sử Giao Dịch</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search by product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm sản phẩm
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                placeholder="Mã hoặc tên sản phẩm..."
              />
            </div>

            {/* Filter by supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhà Phân Phối
              </label>
              <select
                value={maNPPFilter}
                onChange={(e) => setMaNPPFilter(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
              >
                <option value="">Tất cả nhà phân phối</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.MaNPP} value={supplier.MaNPP}>
                    {supplier.TenNPP}
                  </option>
                ))}
              </select>
            </div>

            {/* From date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* To date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 min-w-12">
                  STT
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 min-w-24">
                  Ngày Nhập
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 min-w-32">
                  Người Nhập
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 min-w-20">
                  Mã SP
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 min-w-32">
                  Nhà Phân Phối
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 min-w-20">
                  Kho
                </th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700 min-w-16">
                  Số Lượng
                </th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700 min-w-24">
                  Giá Nhập
                </th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700 min-w-24">
                  Thành Tiền
                </th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700 min-w-28">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={`${item.MaPN}-${item.MaSP}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-800">{index + 1}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.NgayTao
                        ? new Date(item.NgayTao).toLocaleDateString('vi-VN')
                        : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-700">{item.HoTen || '-'}</td>
                    <td className="p-3 text-sm font-medium text-gray-800">{item.MaSP || '-'}</td>
                    <td className="p-3 text-sm text-gray-700">{item.TenNPP || '-'}</td>
                    <td className="p-3 text-sm text-gray-700">{item.TenKho || item.MaKho || '-'}</td>
                    <td className="p-3 text-sm text-right text-gray-700 font-medium">
                      {item.SoLuong?.toLocaleString('vi-VN') || '-'}
                    </td>
                    <td className="p-3 text-sm text-right text-gray-700 font-medium">
                      {item.GiaNhap ? `${item.GiaNhap.toLocaleString('vi-VN')}₫` : '-'}
                    </td>
                    <td className="p-3 text-sm text-right font-medium text-brand-600">
                      {item.ThanhTien
                        ? `${(item.ThanhTien as number).toLocaleString('vi-VN')}₫`
                        : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && items.length > 0 && (
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <td className="p-3 text-sm text-gray-800" colSpan={6}>
                    Tổng cộng
                  </td>
                  <td className="p-3 text-sm text-right text-gray-800">
                    {totalQuantity.toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3 text-sm text-right text-gray-800">
                    {totalCost.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="p-3 text-sm text-right text-brand-600">
                    {totalAmount.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="p-3 text-sm text-right text-gray-800">
                    -
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">Sửa giao dịch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mã phiếu nhập</label>
                <input
                  type="text"
                  value={formData.MaPN}
                  disabled
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-700 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mã sản phẩm</label>
                <input
                  type="text"
                  value={formData.MaSP}
                  disabled
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-700 disabled:bg-gray-100"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.SoLuong}
                    onChange={(e) => setFormData({ ...formData, SoLuong: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Giá nhập</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.GiaNhap}
                    onChange={(e) => setFormData({ ...formData, GiaNhap: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-brand-500 px-5 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {isSaving ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
