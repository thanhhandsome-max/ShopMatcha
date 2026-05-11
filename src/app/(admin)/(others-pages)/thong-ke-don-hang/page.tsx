'use client';

import React, { useEffect, useState } from 'react';
import {
  getDonHangWithFilter,
  getDonHangDetail,
  getThongKeDonHang,
  getThongKeTheoTrangThaiDoanhThu,
} from '@/services/don-hang.service';
import { IDonHangQuanLy, IChiTietDonHang, IDonHangStats, IDonHangStatusStats } from '@/types';

type RevenueFilterState = {
  startDate: string;
  endDate: string;
  cuaHang: string;
  timKiem: string;
  trangThai?: number;
};

const STATUS_CONFIG = [
  { value: 1, label: 'Chờ thanh toán', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏳' },
  { value: 2, label: 'Đang giao', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🚚' },
  { value: 3, label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  { value: 4, label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '❌' },
];

const STATUS_LABELS: Record<string, string> = {
  '0': 'Chờ thanh toán',
  '1': 'Chờ thanh toán',
  '2': 'Đang giao',
  '3': 'Hoàn thành',
  '4': 'Đã hủy',
  '5': 'Đã hủy',
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

const parseStartDate = (value?: string) => (value ? new Date(value) : undefined);
const parseEndDate = (value?: string) => (value ? new Date(`${value}T23:59:59.999`) : undefined);

export default function ThongKeDonHangPage() {
  const [allOrders, setAllOrders] = useState<IDonHangQuanLy[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IDonHangQuanLy | null>(null);
  const [lineItems, setLineItems] = useState<IChiTietDonHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statsData, setStatsData] = useState<Record<string, any>>({});
  const [typeStats, setTypeStats] = useState<IDonHangStatusStats[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilterState>({
    startDate: '',
    endDate: '',
    cuaHang: '',
    timKiem: '',
    trangThai: undefined,
  });

  const loadAllData = async (currentFilter = revenueFilter) => {
    setLoading(true);
    try {
      const filterWithoutStatus = {
        ...currentFilter,
        trangThai: undefined,
      };

      const [allOrdersData, statsResponse, typeResponse] = await Promise.all([
        getDonHangWithFilter({
          trangThai: undefined,
          startDate: parseStartDate(filterWithoutStatus.startDate),
          endDate: parseEndDate(filterWithoutStatus.endDate),
          cuaHang: filterWithoutStatus.cuaHang || undefined,
          timKiem: filterWithoutStatus.timKiem || undefined,
        }),
        getThongKeDonHang(),
        getThongKeTheoTrangThaiDoanhThu({
          trangThai: currentFilter.trangThai,
          startDate: parseStartDate(currentFilter.startDate),
          endDate: parseEndDate(currentFilter.endDate),
          cuaHang: currentFilter.cuaHang || undefined,
          timKiem: currentFilter.timKiem || undefined,
        }),
      ]);

      setAllOrders(allOrdersData);
      setStatsData(statsResponse.stats || {});
      setTypeStats(typeResponse.stats || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      setTypeStats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueStats = async (currentFilter = revenueFilter) => {
    setLoading(true);
    try {
      const typeResponse = await getThongKeTheoTrangThaiDoanhThu({
        trangThai: currentFilter.trangThai,
        startDate: parseStartDate(currentFilter.startDate),
        endDate: parseEndDate(currentFilter.endDate),
        cuaHang: currentFilter.cuaHang || undefined,
        timKiem: currentFilter.timKiem || undefined,
      });
      setTypeStats(typeResponse.stats || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu doanh thu:', error);
      setTypeStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setRevenueFilter((prev) => ({
      ...prev,
      [field]: field === 'trangThai' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleApplyFilter = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadAllData(revenueFilter);
    setSelectedStatus(revenueFilter.trangThai ?? null);
  };

  const handleResetFilter = async () => {
    const emptyFilter = { startDate: '', endDate: '', cuaHang: '', timKiem: '', trangThai: undefined };
    setRevenueFilter(emptyFilter);
    setSelectedStatus(null);
    await loadAllData(emptyFilter);
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
  };

  const isWaitingPaymentStatus = (status?: number) => status === 0 || status === 1;

  const filteredBaseOrders = allOrders.filter((order) => {
    const orderDate = new Date(order.NgayTao || '');
    const startDate = revenueFilter.startDate ? new Date(revenueFilter.startDate) : undefined;
    const endDate = revenueFilter.endDate ? new Date(`${revenueFilter.endDate}T23:59:59.999`) : undefined;
    const matchesDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
    const matchesStore = !revenueFilter.cuaHang || (order.MaCuahang || '').toLowerCase().includes(revenueFilter.cuaHang.toLowerCase());
    const searchText = revenueFilter.timKiem?.trim().toLowerCase();
    const matchesSearch = !searchText || [order.MaHD, order.TenKhachHang, order.SoDienThoai]
      .some((field) => field?.toString().toLowerCase().includes(searchText));
    return matchesDate && matchesStore && matchesSearch;
  });

  const activeStatus = selectedStatus !== null ? selectedStatus : revenueFilter.trangThai;

  const filteredOrders = activeStatus === 1
    ? filteredBaseOrders.filter((order) => isWaitingPaymentStatus(order.TrangThai))
    : activeStatus
      ? filteredBaseOrders.filter((order) => order.TrangThai === activeStatus)
      : filteredBaseOrders;

  const currentRevenueFilterDescription = () => {
    const parts: string[] = [];
    if (revenueFilter.startDate) parts.push(`Từ ${formatDate(revenueFilter.startDate)}`);
    if (revenueFilter.endDate) parts.push(`đến ${formatDate(revenueFilter.endDate)}`);
    if (revenueFilter.cuaHang) parts.push(`Cửa hàng: ${revenueFilter.cuaHang}`);
    if (revenueFilter.timKiem) parts.push(`Tìm kiếm: ${revenueFilter.timKiem}`);
    if (revenueFilter.trangThai !== undefined && revenueFilter.trangThai !== null) {
      parts.push(`Trạng thái: ${STATUS_LABELS[String(revenueFilter.trangThai)] || revenueFilter.trangThai}`);
    }
    return parts.length ? parts.join(' • ') : 'Không có bộ lọc doanh thu đang áp dụng';
  };

  const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.TongTien || 0), 0);
  const filteredStores = Array.from(new Set(allOrders.map((order) => order.MaCuahang || '').filter(Boolean)));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">📊 Thống kê đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Phân tích chi tiết hoạt động bán hàng và trạng thái đơn hàng.</p>
        </div>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            title: 'Tổng đơn hàng',
            value: statsData?.totalDonHang || '—',
            description: 'Tổng số lượng đơn',
            color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            icon: '📦',
          },
          {
            title: 'Tổng doanh thu',
            value: `${totalRevenue.toLocaleString('vi-VN')}đ`,
            description: 'Tổng giá trị đơn hàng',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            icon: '💰',
          },
          {
            title: 'Đang xử lý',
            value: statsData?.donDangXuLy || '—',
            description: 'Đơn đang xử lý',
            color: 'bg-amber-50 text-amber-700 border-amber-100',
            icon: '⚙️',
          },
          {
            title: 'Hoàn thành',
            value: statsData?.donHoanThanh || '—',
            description: 'Đơn hoàn thành',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            icon: '✅',
          },
          {
            title: 'Đã hủy',
            value: statsData?.donHuy || '—',
            description: 'Đơn bị hủy',
            color: 'bg-rose-50 text-rose-700 border-rose-100',
            icon: '❌',
          },
        ].map((metric) => (
          <div key={metric.title} className={`rounded-[2rem] border px-6 py-5 ${metric.color} border-opacity-50 hover:shadow-lg transition-all`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">{metric.title}</p>
                <p className="text-3xl font-black text-gray-900">{loading ? '...' : metric.value}</p>
                <p className="mt-2 text-xs text-gray-500">{metric.description}</p>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* REVENUE BY ORDER TYPE */}
      <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Doanh thu theo trạng thái đơn hàng</h2>
            <p className="text-sm text-gray-500">Bộ lọc chỉ áp dụng cho phần doanh thu theo trạng thái.</p>
          </div>

          <form onSubmit={handleApplyFilter} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Thời gian (Từ - Đến)</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={revenueFilter.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-1/2 rounded-2xl border border-gray-200 bg-white px-2 py-2.5 text-[11px] outline-none focus:border-brand-500"
                  />
                  <input
                    type="date"
                    value={revenueFilter.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-1/2 rounded-2xl border border-gray-200 bg-white px-2 py-2.5 text-[11px] outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Cửa hàng</label>
                <input
                  type="text"
                  value={revenueFilter.cuaHang}
                  onChange={(e) => handleFilterChange('cuaHang', e.target.value)}
                  placeholder="Mã cửa hàng..."
                  list="store-list"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
                />
                <datalist id="store-list">
                  {filteredStores.map((store) => <option key={store} value={store} />)}
                </datalist>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Trạng thái</label>
                <select
                  value={revenueFilter.trangThai ?? ''}
                  onChange={(e) => handleFilterChange('trangThai', e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="1">Chờ thanh toán</option>
                  <option value="2">Đang giao</option>
                  <option value="3">Hoàn thành</option>
                  <option value="4">Đã hủy</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Tìm kiếm nhanh</label>
                <input
                  type="text"
                  value={revenueFilter.timKiem}
                  onChange={(e) => handleFilterChange('timKiem', e.target.value)}
                  placeholder="Mã đơn, SĐT..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Hành động</label>
                <div className="flex gap-2 h-10">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 active:scale-95 transition-all shadow-sm"
                  >
                    🔍 Lọc
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="shrink-0 rounded-2xl bg-gray-100 px-3 py-2.5 text-gray-500 hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </form>

          {(revenueFilter.startDate || revenueFilter.endDate || revenueFilter.cuaHang || revenueFilter.timKiem || revenueFilter.trangThai !== undefined) && (
            <p className="text-sm text-gray-400">{currentRevenueFilterDescription()}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {typeStats.length > 0 ? (
            typeStats.map((item) => (
              <div key={item.order_type} className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">{STATUS_LABELS[String(item.order_type)] || `Trạng thái ${item.order_type}`}</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(item.tongTien)}đ</p>
                <p className="mt-2 text-sm text-gray-500">{item.totalDonHang} đơn</p>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
              Không có dữ liệu doanh thu theo trạng thái đơn hàng.
            </div>
          )}
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={async () => {
            const newFilter = { ...revenueFilter, trangThai: undefined };
            setSelectedStatus(null);
            setRevenueFilter(newFilter);
            await loadAllData(newFilter);
          }}
          className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
            selectedStatus === null
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📋 Tất cả ({filteredOrders.length})
        </button>
        {STATUS_CONFIG.map((status) => {
          const count = status.value === 1
            ? filteredOrders.filter((order) => isWaitingPaymentStatus(order.TrangThai)).length
            : filteredOrders.filter((order) => order.TrangThai === status.value).length;
          return (
            <button
              key={status.value}
              onClick={async () => {
                const newFilter = { ...revenueFilter, trangThai: status.value };
                setSelectedStatus(status.value);
                setRevenueFilter(newFilter);
                await loadAllData(newFilter);
              }}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                selectedStatus === status.value
                  ? `${status.color} shadow-lg border-2`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.icon} {status.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider sticky top-0">
            <tr>
              <th className="px-6 py-4">Mã đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">SĐT</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.MaHD} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{order.MaHD}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{order.TenKhachHang || 'Khách lẻ'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.SoDienThoai || '—'}</td>
                  <td className="px-6 py-4 font-bold text-brand-600">{formatCurrency(order.TongTien)}đ</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                      isWaitingPaymentStatus(order.TrangThai) ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      order.TrangThai === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.TrangThai === 3 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      order.TrangThai === 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {STATUS_LABELS[String(order.TrangThai)] || 'Không rõ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.NgayTao)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openDetail(order)}
                      className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-all"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
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
                {/* Customer Info */}
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

                {/* Products */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-800 border-l-4 border-brand-500 pl-3">Sản phẩm đơn hàng</h3>
                  {detailLoading ? (
                    <div className="text-center py-8 text-gray-400">Đang tải...</div>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Right Column: Status & Amount */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Trạng thái hiện tại</p>
                  <div className={`mb-6 w-full text-center rounded-2xl border-2 py-3 text-sm font-black ${
                    selectedOrder.TrangThai === 1 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    selectedOrder.TrangThai === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    selectedOrder.TrangThai === 3 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    selectedOrder.TrangThai === 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {STATUS_LABELS[String(selectedOrder.TrangThai)] || 'KHÔNG XÁC ĐỊNH'}
                  </div>
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
