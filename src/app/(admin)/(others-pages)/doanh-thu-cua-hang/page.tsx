'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import type { ApexOptions } from 'apexcharts';
import { ICuaHang } from '@/types';
import { doanhthuCuaHangService } from '@/services/DoanhthuCuaHang.service';
import { cuaHangService } from '@/services/CuaHang.service';

const RevenueChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueItem {
  MaCH: string;
  SoPhieu: number;
  DoanhThu: number;
}

interface DailyRevenueItem {
  Ngay: string;
  SoDon: number;
  DoanhThu: number;
}

interface TopProduct {
  MaSP: string;
  TenSanPham: string;
  TongSoLuong: number;
  DoanhThu: number;
}

export default function DoanhthuCuaHangPage() {
  const [stores, setStores] = useState<ICuaHang[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStores = async () => {
    try {
      const s = await cuaHangService.getAll();
      setStores(s || []);
    } catch (err) {
      console.error('Load stores error', err);
    }
  };

  const loadRevenue = async (maCH?: string, from?: string, to?: string) => {
    setLoading(true);
    try {
      const result = await doanhthuCuaHangService.getRevenue({
        maCH: maCH || undefined,
        fromDate: from || undefined,
        toDate: to || undefined,
      });
      setRevenueData(result.revenue || []);
      setDailyRevenue(result.dailyRevenue || []);
      setTopProducts(result.topProducts || []);
    } catch (err) {
      console.error('Load revenue error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const from = formatDate(firstDay);
    const to = formatDate(lastDay);
    setFromDate(from);
    setToDate(to);
    loadRevenue('', from, to);
  }, []);

  const handleFilter = () => {
    loadRevenue(selectedStore, fromDate, toDate);
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStore(value);
    loadRevenue(value, fromDate, toDate);
  };

  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + (item.DoanhThu || 0), 0),
    [revenueData],
  );

  const totalOrders = useMemo(
    () => revenueData.reduce((sum, item) => sum + (item.SoPhieu || 0), 0),
    [revenueData],
  );

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const selectedStoreName =
    selectedStore === ''
      ? 'Tất cả cửa hàng'
      : stores.find((store) => String(store.MaCH) === selectedStore)?.TenCH || selectedStore;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const formatCompactCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  const formatDateLabel = (value: string) =>
    new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(value));

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#465FFF'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.35,
        opacityTo: 0.05,
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
    },
    xaxis: {
      categories: dailyRevenue.map((item) => formatDateLabel(item.Ngay)),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatCompactCurrency(value),
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value),
      },
    },
    legend: { show: false },
  };

  const chartSeries = [
    {
      name: 'Doanh thu',
      data: dailyRevenue.map((item) => Number(item.DoanhThu || 0)),
    },
  ];

  const exportToCSV = () => {
    const csvContent: string[] = [];

    csvContent.push('BÁO CÁO DOANH THU CỬA HÀNG');
    csvContent.push(`Cửa hàng,${selectedStoreName}`);
    csvContent.push(`Kỳ báo cáo,${fromDate} đến ${toDate}`);
    csvContent.push('');

    csvContent.push('TỔNG HỢP');
    csvContent.push('Chỉ tiêu,Giá trị');
    csvContent.push(`Tổng doanh thu,${totalRevenue}`);
    csvContent.push(`Số đơn hàng,${totalOrders}`);
    csvContent.push(`TB doanh thu/đơn,${averageOrderValue.toFixed(2)}`);
    csvContent.push('');

    csvContent.push('THỐNG KÊ THEO NGÀY');
    csvContent.push('Ngày,Số đơn,Doanh thu');
    dailyRevenue.forEach((item) => {
      csvContent.push(`${item.Ngay},${item.SoDon},${item.DoanhThu}`);
    });
    csvContent.push('');

    csvContent.push('DOANH THU THEO CỬA HÀNG');
    csvContent.push('Cửa hàng,Số phiếu,Doanh thu');
    revenueData.forEach((item) => {
      csvContent.push(
        `"${stores.find((store) => String(store.MaCH) === item.MaCH)?.TenCH || item.MaCH}",${item.SoPhieu},${item.DoanhThu}`,
      );
    });
    csvContent.push('');

    csvContent.push('SẢN PHẨM BÁN CHẠY (TOP 10)');
    csvContent.push('Sản phẩm,Số lượng,Doanh thu');
    topProducts.forEach((product) => {
      csvContent.push(`"${product.TenSanPham || product.MaSP}",${product.TongSoLuong},${product.DoanhThu}`);
    });

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `doanh-thu-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Cửa hàng</label>
            <select
              value={selectedStore}
              onChange={handleStoreChange}
              className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none"
            >
              <option value="">-- Tất cả --</option>
              {stores.map((store) => (
                <option key={String(store.MaCH)} value={String(store.MaCH)}>
                  {store.TenCH || store.MaCH}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button onClick={handleFilter} className="rounded-lg bg-brand-500 px-4 py-2.5 text-white">
              Lọc
            </button>
            <button onClick={exportToCSV} className="rounded-lg bg-green-500 px-4 py-2.5 text-white">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Statistics</h2>
            <p className="text-sm text-gray-500">Doanh thu theo ngày của {selectedStoreName.toLowerCase()}.</p>
          </div>
          <div className="text-sm text-gray-500">
            Kỳ báo cáo: <span className="font-medium text-gray-800">{fromDate} - {toDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Biểu đồ doanh thu</p>
                <p className="text-base font-semibold text-gray-800">Theo ngày trong khoảng đã lọc</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-600 shadow-sm">
                {selectedStoreName}
              </span>
            </div>

            <div className="min-h-80">
              {loading ? (
                <div className="flex h-80 items-center justify-center text-sm text-gray-500">Đang tải...</div>
              ) : dailyRevenue.length === 0 ? (
                <div className="flex h-80 items-center justify-center text-sm text-gray-500">
                  Không có dữ liệu thống kê
                </div>
              ) : (
                <RevenueChart options={chartOptions} series={chartSeries} type="area" height={320} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-800">Tóm tắt nhanh</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-gray-500">Tổng doanh thu</p>
                <p className="mt-1 text-lg font-bold text-blue-700">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-gray-500">Số đơn hàng</p>
                <p className="mt-1 text-lg font-bold text-green-700">{totalOrders}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs text-gray-500">TB doanh thu/đơn</p>
                <p className="mt-1 text-lg font-bold text-purple-700">{formatCurrency(averageOrderValue)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Số ngày có dữ liệu</p>
                <p className="mt-1 text-lg font-bold text-gray-800">{dailyRevenue.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
        <div className="rounded-xl bg-blue-50 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl bg-green-50 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Số đơn hàng</p>
          <p className="text-2xl font-bold text-green-700">{totalOrders}</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-4 shadow-sm">
          <p className="text-sm text-gray-600">TB doanh thu/đơn</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-800">
              {selectedStore ? `Doanh thu của ${selectedStoreName}` : 'Doanh thu theo cửa hàng'}
            </h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm">Cửa hàng</th>
                  <th className="p-3 text-right text-sm">Số phiếu</th>
                  <th className="p-3 text-right text-sm">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-sm">
                      Đang tải...
                    </td>
                  </tr>
                ) : revenueData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-sm">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  revenueData.map((item) => (
                    <tr key={item.MaCH} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        {stores.find((store) => String(store.MaCH) === item.MaCH)?.TenCH || item.MaCH}
                      </td>
                      <td className="p-3 text-right text-sm">{item.SoPhieu}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatCurrency(item.DoanhThu || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-800">Sản phẩm bán chạy (Top 10)</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm">Sản phẩm</th>
                  <th className="p-3 text-right text-sm">SL</th>
                  <th className="p-3 text-right text-sm">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-sm">
                      Đang tải...
                    </td>
                  </tr>
                ) : topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-sm">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => (
                    <tr key={product.MaSP} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{product.TenSanPham || product.MaSP}</td>
                      <td className="p-3 text-right text-sm">{product.TongSoLuong}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatCurrency(product.DoanhThu || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}