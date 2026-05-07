// src/app/(admin)/(others-pages)/ton-kho/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import tonKhoService from '@/services/TonKho.service';
import { ILoaiSanPham, ITonKho, ISanPham } from '@/types';
import { sanPhamService } from '@/services/SanPham.service';
import { loaiSanPhamService } from '@/services/LoaiSanPham.service';

export default function TonKhoPage() {
  const [items, setItems] = useState<ITonKho[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedKho, setSelectedKho] = useState('all');
  const [selectedLoai, setSelectedLoai] = useState('all');
  const [loaiOptions, setLoaiOptions] = useState<ILoaiSanPham[]>([]);

  // map of product data for display (MaSP -> product)
  const [productsMap, setProductsMap] = useState<Record<string, ISanPham>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await tonKhoService.getAll();
      setItems(data || []);
      // fetch product details in batch and map by MaSP
      try {
        const allProds = await sanPhamService.getAll();
        const map: Record<string, ISanPham> = {};
        (allProds || []).forEach((p: ISanPham) => {
          if (p?.MaSP) map[p.MaSP] = p;
        });
        setProductsMap(map);
      } catch (err) {
        console.warn('Could not load product details', err);
        setProductsMap({});
      }

      try {
        const loais = await loaiSanPhamService.getAll();
        setLoaiOptions(loais || []);
      } catch (err) {
        console.warn('Could not load product types', err);
        setLoaiOptions([]);
      }
    } catch (err) {
      console.error('Load ton kho error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const khoOptions = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((it) => String(it.MaKho || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const itemsByKho = useMemo(() => {
    if (selectedKho === 'all') return items;
    return items.filter((it) => String(it.MaKho || '') === selectedKho);
  }, [items, selectedKho]);

  const itemsByLoai = useMemo(() => {
    if (selectedLoai === 'all') return itemsByKho;

    return itemsByKho.filter((item) => {
      const product = productsMap[item.MaSP];
      return String(product?.MaLoai || '') === selectedLoai;
    });
  }, [itemsByKho, productsMap, selectedLoai]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return itemsByLoai.filter((it) => {
      const prod = productsMap[it.MaSP];
      const name = prod?.TenSanPham?.toLowerCase() || '';
      const code = it.MaSP?.toLowerCase() || '';
      const matchesSearch = !q || name.includes(q) || code.includes(q);
      const matchesFilter = filter === 'all' || (filter === 'low' && (it.SoLuong ?? 0) < 20 && (it.SoLuong ?? 0) > 0) || (filter === 'out' && (it.SoLuong ?? 0) === 0);
      return matchesSearch && matchesFilter;
    });
  }, [itemsByLoai, productsMap, search, filter]);

  const counts = useMemo(() => ({
    all: itemsByLoai.length,
    low: itemsByLoai.filter(i => (i.SoLuong ?? 0) < 20 && (i.SoLuong ?? 0) > 0).length,
    out: itemsByLoai.filter(i => (i.SoLuong ?? 0) === 0).length,
  }), [itemsByLoai]);

  const totals = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0; // vốn tồn (assume product has GiaVon)
    let totalValue = 0; // giá trị tồn = SoLuong * GiaBan or GiaVon
    for (const it of filtered) {
      const qty = Number(it.SoLuong || 0);
      totalQty += qty;
      const prod = productsMap[it.MaSP];
      const giaVon = Number(prod?.GiaVon ?? 0);
      const giaBan = Number(prod?.GiaBan ?? prod?.GiaVon ?? 0);
      totalCost += qty * giaVon;
      totalValue += qty * giaBan;
    }
    return { totalQty, totalCost, totalValue };
  }, [filtered, productsMap]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản Lý Tồn Kho</h1>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
        <div className="flex-1">
          <input
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Tìm mã hoặc tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            value={selectedKho}
            onChange={(e) => setSelectedKho(e.target.value)}
          >
            <option value="all">Tất cả kho</option>
            {khoOptions.map((maKho) => (
              <option key={maKho} value={maKho}>
                Kho {maKho}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-72">
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
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

        <div className="flex gap-2">
          <button className={`px-3 py-2 rounded ${filter==='all'? 'bg-brand-500 text-white':'bg-white'}`} onClick={() => setFilter('all')}>
            Tất cả ({counts.all})
          </button>
          <button className={`px-3 py-2 rounded ${filter==='low'? 'bg-yellow-500 text-white':'bg-white'}`} onClick={() => setFilter('low')}>
            Sắp hết hàng ({counts.low})
          </button>
          <button className={`px-3 py-2 rounded ${filter==='out'? 'bg-red-500 text-white':'bg-white'}`} onClick={() => setFilter('out')}>
            Hết hàng ({counts.out})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-theme-sm border border-gray-200 max-h-[60vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
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
              <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">Không có dữ liệu</td></tr>
            ) : (
              filtered.map((it) => {
                const prod = productsMap[it.MaSP];
                const qty = Number(it.SoLuong || 0);
                const giaVon = Number(prod?.GiaVon ?? 0);
                const giaBan = Number(prod?.GiaBan ?? prod?.GiaVon ?? 0);
                return (
                  <tr key={`${it.MaKho}-${it.MaSP}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{it.MaSP}</td>
                    <td className="p-3 font-medium">{prod?.TenSanPham || '-'}</td>
                    <td className="p-3 text-right">{qty}</td>
                    <td className="p-3 text-right">{(qty * giaVon).toLocaleString()}</td>
                    <td className="p-3 text-right">{(qty * giaBan).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-gray-50 sticky bottom-0 font-medium text-sm">
            <tr>
              <td className="p-3">Tổng</td>
              <td className="p-3"></td>
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
