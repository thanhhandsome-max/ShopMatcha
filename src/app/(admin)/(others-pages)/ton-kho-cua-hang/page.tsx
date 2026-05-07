'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ICuaHang, ILoaiSanPham, ISanPham } from '@/types';
import { ITonKhoCuaHangDisplay, tonKhoCuaHangService } from '@/services/TonKhoCuaHang.service';
import { loaiSanPhamService } from '@/services/LoaiSanPham.service';

export default function TonKhoCuaHangPage() {
  const [items, setItems] = useState<ITonKhoCuaHangDisplay[]>([]);
  const [stores, setStores] = useState<ICuaHang[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, ISanPham>>({});
  const [loaiOptions, setLoaiOptions] = useState<ILoaiSanPham[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedCH, setSelectedCH] = useState('all');
  const [selectedLoai, setSelectedLoai] = useState('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const payload = await tonKhoCuaHangService.getAll();
      setItems(payload.data || []);
      setStores(payload.stores || []);

      const map: Record<string, ISanPham> = {};
      (payload.products || []).forEach((product) => {
        if (product?.MaSP) map[product.MaSP] = product;
      });
      setProductsMap(map);

      try {
        const loais = await loaiSanPhamService.getAll();
        setLoaiOptions(loais || []);
      } catch (err) {
        console.warn('Could not load product types', err);
        setLoaiOptions([]);
      }
    } catch (err) {
      console.error('Load ton kho cua hang error', err);
      setItems([]);
      setStores([]);
      setProductsMap({});
      setLoaiOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const storeOptions = useMemo(() => {
    if (stores.length > 0) {
      return stores
        .filter((store) => String(store.MaCH || '').trim())
        .map((store) => ({ MaCH: String(store.MaCH), TenCH: String(store.TenCH || '') }));
    }

    const unique = new Map<string, string>();
    items.forEach((item) => {
      const maCH = String(item.MaCH || '').trim();
      if (!maCH) return;
      unique.set(maCH, String(item.TenCH || ''));
    });

    return Array.from(unique.entries()).map(([MaCH, TenCH]) => ({ MaCH, TenCH }));
  }, [stores, items]);

  const itemsByStore = useMemo(() => {
    if (selectedCH === 'all') return items;
    return items.filter((item) => String(item.MaCH || '') === selectedCH);
  }, [items, selectedCH]);

  const itemsByLoai = useMemo(() => {
    if (selectedLoai === 'all') return itemsByStore;

    return itemsByStore.filter((item) => {
      const product = productsMap[item.MaSP];
      return String(product?.MaLoai || '') === selectedLoai;
    });
  }, [itemsByStore, productsMap, selectedLoai]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return itemsByLoai.filter((item) => {
      const product = productsMap[item.MaSP] || item;
      const maCH = String(item.MaCH || '').toLowerCase();
      const tenCH = String(item.TenCH || '').toLowerCase();
      const maSP = String(item.MaSP || '').toLowerCase();
      const tenSP = String(product?.TenSanPham || item.TenSanPham || '').toLowerCase();
      const matchesSearch = !q || maCH.includes(q) || tenCH.includes(q) || maSP.includes(q) || tenSP.includes(q);
      const qty = Number(item.SoLuong || 0);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'low' && qty < 20 && qty > 0) ||
        (filter === 'out' && qty === 0);
      return matchesSearch && matchesFilter;
    });
  }, [itemsByLoai, productsMap, search, filter]);

  const counts = useMemo(
    () => ({
      all: itemsByLoai.length,
      low: itemsByLoai.filter((item) => (item.SoLuong ?? 0) < 20 && (item.SoLuong ?? 0) > 0).length,
      out: itemsByLoai.filter((item) => (item.SoLuong ?? 0) === 0).length,
    }),
    [itemsByLoai]
  );

  const totals = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0;
    let totalValue = 0;

    for (const item of filtered) {
      const qty = Number(item.SoLuong || 0);
      const product = productsMap[item.MaSP] || item;
      const giaVon = Number(product?.GiaVon ?? item.GiaVon ?? 0);
      const giaBan = Number(product?.GiaBan ?? item.GiaBan ?? giaVon);

      totalQty += qty;
      totalCost += qty * giaVon;
      totalValue += qty * giaBan;
    }

    return { totalQty, totalCost, totalValue };
  }, [filtered, productsMap]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Tồn Kho Cửa Hàng</h1>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex-1">
          <input
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
            placeholder="Tìm theo mã SP hoặc tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full lg:w-72">
          <select
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
            value={selectedCH}
            onChange={(e) => setSelectedCH(e.target.value)}
          >
            <option value="all">Tất cả cửa hàng</option>
            {storeOptions.map((store) => (
              <option key={store.MaCH} value={store.MaCH}>
                {store.TenCH ? `${store.TenCH} - ${store.MaCH}` : store.MaCH}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-72">
          <select
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
            value={selectedLoai}
            onChange={(e) => setSelectedLoai(e.target.value)}
          >
            <option value="all">Tất cả loại sản phẩm</option>
            {loaiOptions.map((loai) => (
              <option key={loai.MaLoai} value={loai.MaLoai}>
                {loai.TenLoai}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            className={`px-3 py-2 rounded-lg border ${filter === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({counts.all})
          </button>
          <button
            className={`px-3 py-2 rounded-lg border ${filter === 'low' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setFilter('low')}
          >
            Sắp hết hàng ({counts.low})
          </button>
          <button
            className={`px-3 py-2 rounded-lg border ${filter === 'out' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setFilter('out')}
          >
            Hết hàng ({counts.out})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-theme-sm border border-gray-200 max-h-[60vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm sticky top-0 z-10">
            <tr>
              <th className="p-3">Mã SP</th>
              <th className="p-3">Tên Sản Phẩm</th>
              <th className="p-3 text-right">Số Lượng</th>
              <th className="p-3 text-right">Vốn Tồn</th>
              <th className="p-3 text-right">Giá Trị Tồn</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const qty = Number(item.SoLuong || 0);
                const product = productsMap[item.MaSP] || item;
                const giaVon = Number(product?.GiaVon ?? item.GiaVon ?? 0);
                const giaBan = Number(product?.GiaBan ?? item.GiaBan ?? giaVon);

                return (
                  <tr key={`${item.MaCH}-${item.MaSP}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{item.MaSP}</td>
                    <td className="p-3 font-medium">{item.TenSanPham || product?.TenSanPham || '-'}</td>
                    <td className="p-3 text-right">{qty}</td>
                    <td className="p-3 text-right">{(qty * giaVon).toLocaleString()}</td>
                    <td className="p-3 text-right">{(qty * giaBan).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-gray-50 font-medium text-sm sticky bottom-0 z-10">
            <tr>
              <td className="p-3">Tổng</td>
              <td className="p-3" />
              <td className="p-3 text-right">{totals.totalQty}</td>
              <td className="p-3 text-right">{totals.totalCost.toLocaleString()}</td>
              <td className="p-3 text-right">{totals.totalValue.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}