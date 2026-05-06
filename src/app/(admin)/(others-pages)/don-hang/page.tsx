'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  getDonHangWithFilter,
  getDonHangDetail,
  huyDonHang,
  updateTrangThaiDonHang,
} from '@/services/don-hang.service';
import { IDonHangQuanLy, IChiTietDonHang } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: '1', label: 'Chờ xử lý' },
  { value: '2', label: 'Đang xử lý' },
  { value: '3', label: 'Đang giao' },
  { value: '4', label: 'Hoàn thành' },
  { value: '5', label: 'Đã hủy' },
];

const STATUS_LABELS: Record<string, string> = {
  '1': 'Chờ xử lý',
  '2': 'Đang xử lý',
  '3': 'Đang giao',
  '4': 'Hoàn thành',
  '5': 'Đã hủy',
};

const statusClass = (status?: number) => {
  switch (status) {
    case 1: return 'bg-amber-50 text-amber-700 border-amber-200';
    case 2: return 'bg-blue-50 text-blue-700 border-blue-200';
    case 3: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 4: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 5: return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatDate = (value?: string | Date) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '0';
  return Number(value).toLocaleString('vi-VN');
};

export default function DonHangPage() {
  const [orders, setOrders] = useState<IDonHangQuanLy[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IDonHangQuanLy | null>(null);
  const [lineItems, setLineItems] = useState<IChiTietDonHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState({
    trangThai: '',
    cuaHang: '',
    startDate: '',
    endDate: '',
    timKiem: '',
  });
  const [showDetail, setShowDetail] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadOrders = async (currentFilter = filter) => {
    setLoading(true);
    try {
      const data = await getDonHangWithFilter({
        trangThai: currentFilter.trangThai ? Number(currentFilter.trangThai) : undefined,
        cuaHang: currentFilter.cuaHang || undefined,
        startDate: currentFilter.startDate ? new Date(currentFilter.startDate) : undefined,
        endDate: currentFilter.endDate ? new Date(currentFilter.endDate) : undefined,
        timKiem: currentFilter.timKiem || undefined,
      });
      setOrders(data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = (event: React.FormEvent) => {
    event.preventDefault();
    loadOrders();
  };

  const handleResetFilter = () => {
    const emptyFilter = { trangThai: '', cuaHang: '', startDate: '', endDate: '', timKiem: '' };
    setFilter(emptyFilter);
    loadOrders(emptyFilter);
  };

  const openDetail = async (order: IDonHangQuanLy) => {
    setSelectedOrder(order);
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const response = await getDonHangDetail(order.MaHD);
      setSelectedOrder(response.donHang);
      setLineItems(response.chiTiet || []);
    } catch (error) {
      console.error('Lỗi tải chi tiết đơn hàng:', error);
      setLineItems([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedOrder(null);
    setLineItems([]);
    setCancelReason('');
  };

  const handleUpdateStatus = async (status: number) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await updateTrangThaiDonHang(selectedOrder.MaHD, status);
      await loadOrders();
      const response = await getDonHangDetail(selectedOrder.MaHD);
      setSelectedOrder(response.donHang);
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert('Cập nhật trạng thái thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    setActionLoading(true);
    try {
      await huyDonHang(selectedOrder.MaHD, cancelReason.trim());
      await loadOrders();
      closeDetail();
    } catch (error) {
      console.error('Lỗi hủy đơn hàng:', error);
      alert('Hủy đơn hàng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStores = useMemo(() => {
    return Array.from(new Set(orders.map((order) => order.MaCuahang || '').filter(Boolean)));
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống xử lý hóa đơn ShopMatcha.</p>
        </div>
      </div>

      {/* BỘ LỌC */}
      <form 
        onSubmit={handleApplyFilter} 
        className="mb-8 rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm shadow-brand-100/10 overflow-hidden"
      >
        {/* Thay đổi lg thành xl để chỉ hiện 4 cột trên màn hình rất lớn, tránh chèn ép trên laptop */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          
          {/* 1. Lọc theo Trạng thái */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Trạng thái</label>
            <select
              value={filter.trangThai}
              onChange={(e) => handleFilterChange('trangThai', e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 2. Lọc theo Cửa hàng */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Cửa hàng</label>
            <input
              type="text"
              value={filter.cuaHang}
              onChange={(e) => handleFilterChange('cuaHang', e.target.value)}
              placeholder="Mã cửa hàng..."
              list="store-list"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
            />
            <datalist id="store-list">
              {filteredStores.map((store) => <option key={store} value={store} />)}
            </datalist>
          </div>

          {/* 3. Lọc theo Ngày tháng (Tối ưu độ rộng) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Thời gian (Từ - Đến)</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={filter.startDate} 
                onChange={(e) => handleFilterChange('startDate', e.target.value)} 
                className="w-1/2 rounded-2xl border border-gray-200 bg-gray-50/50 px-2 py-2.5 text-[11px] outline-none focus:border-brand-500" 
              />
              <input 
                type="date" 
                value={filter.endDate} 
                onChange={(e) => handleFilterChange('endDate', e.target.value)} 
                className="w-1/2 rounded-2xl border border-gray-200 bg-gray-50/50 px-2 py-2.5 text-[11px] outline-none focus:border-brand-500" 
              />
            </div>
          </div>

          {/* 4. Tìm kiếm & Nút hành động (Fix lỗi đẩy nút) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Tìm kiếm nhanh</label>
            <div className="flex gap-2">
              {/* min-w-0 giúp input có thể thu nhỏ lại khi thiếu diện tích */}
              <input
                type="text"
                value={filter.timKiem}
                onChange={(e) => handleFilterChange('timKiem', e.target.value)}
                placeholder="Mã đơn, SĐT..."
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
              <button 
                type="submit" 
                className="shrink-0 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 active:scale-95 transition-all shadow-sm"
              >
                Lọc
              </button>
              <button 
                type="button" 
                onClick={handleResetFilter} 
                className="shrink-0 rounded-2xl bg-gray-100 px-3 py-2.5 text-gray-500 hover:bg-gray-200 transition-all border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* DANH SÁCH BẢNG */}
      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Mã đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
            ) : orders.map((order) => (
              <tr key={order.MaHD} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{order.MaHD}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{order.TenKhachHang || 'Khách lẻ'}</p>
                  <p className="text-xs text-gray-400">{order.SoDienThoai}</p>
                </td>
                <td className="px-6 py-4 font-bold text-brand-600">{formatCurrency(order.TongTien)}đ</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(order.TrangThai)}`}>
                    {STATUS_LABELS[String(order.TrangThai)] || 'Không rõ'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => openDetail(order)} className="rounded-xl bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-all">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/60 p-4 sm:p-8 overflow-y-auto backdrop-blur-sm">
          <div className="relative w-full max-w-5xl rounded-[2rem] bg-white shadow-2xl overflow-hidden my-auto">
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-8 py-5 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Chi tiết hóa đơn {selectedOrder.MaHD}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ngày tạo: {formatDate(selectedOrder.NgayTao)}</p>
              </div>
              <button onClick={closeDetail} className="rounded-full bg-gray-100 p-3 text-gray-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="rounded-3xl bg-gray-50 p-6 grid gap-6 sm:grid-cols-2 border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Khách hàng</p>
                    <p className="text-sm font-bold text-gray-800">{selectedOrder.TenKhachHang || 'Khách lẻ'}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.SoDienThoai || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Địa chỉ</p>
                    <p className="text-sm font-bold text-gray-800">{selectedOrder.TenCuahang || 'Matcha Store'}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.KhachHangDiaChi || 'Tại quầy'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-800 border-l-4 border-brand-500 pl-3">Sản phẩm đơn hàng</h3>
                  <div className="space-y-3">
                    {lineItems.map((item) => (
                      <div key={`${item.MaHD}-${item.MaSP}`} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center font-bold text-brand-600 uppercase border border-brand-100">{item.MaSP.substring(0, 2)}</div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{item.TenSanPham || item.MaSP}</p>
                            <p className="text-xs text-gray-500">Số lượng: {item.SoLuong} x {formatCurrency(item.DonGia)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-gray-900">{formatCurrency(item.ThanhTien)}đ</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Trạng thái hiện tại</p>
                  <div className={`mb-6 w-full text-center rounded-2xl border-2 py-3 text-sm font-black ${statusClass(selectedOrder.TrangThai)}`}>
                    {STATUS_LABELS[String(selectedOrder.TrangThai)] || 'KHÔNG XÁC ĐỊNH'}
                  </div>
                  <div className="grid gap-2.5">
                    {[1, 2, 3, 4].map((status) => (
                      <button key={status} disabled={actionLoading || selectedOrder.TrangThai === status || selectedOrder.TrangThai === 5} onClick={() => handleUpdateStatus(status)} className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 hover:border-brand-500 hover:bg-brand-50 transition-all disabled:opacity-30">Chuyển sang {STATUS_LABELS[String(status)]}</button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-6">
                  <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Lý do hủy..." className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" rows={3} />
                  <button onClick={handleCancelOrder} disabled={actionLoading || selectedOrder.TrangThai === 5} className="mt-4 w-full rounded-2xl bg-rose-500 py-4 text-sm font-black text-white shadow-lg hover:bg-rose-600 transition-all active:scale-95 disabled:grayscale">
                    {selectedOrder.TrangThai === 5 ? 'ĐƠN HÀNG ĐÃ HỦY' : 'XÁC NHẬN HỦY ĐƠN'}
                  </button>
                </div>

                <div className="rounded-3xl bg-gray-900 p-6 text-white space-y-3">
                  <div className="flex justify-between text-xs text-gray-400"><span>Tiền hàng</span><span>{formatCurrency(selectedOrder.subtotal || selectedOrder.TongTien)}đ</span></div>
                  <div className="flex justify-between text-xs text-gray-400"><span>Giao hàng</span><span>{formatCurrency(selectedOrder.shipping_fee || 0)}đ</span></div>
                  <div className="h-px bg-gray-800 my-2"></div>
                  <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-300 uppercase">Thực thu</span><span className="text-2xl font-black text-brand-400">{formatCurrency(selectedOrder.TongTien)}đ</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}