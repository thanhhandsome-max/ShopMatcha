'use client';

import React, { useState } from 'react';
import LichSuKhoFilter from '@/components/lichsukho/LichSuKhoFilter';
import LichSuKhoStats from '@/components/lichsukho/LichSuKhoStats';
import LichSuKhoTable from '@/components/lichsukho/LichSuKhoTable';

/**
 * TRANG LỊCH SỬ BIẾN ĐỘNG KHO - SHOPMATCHA
 * Chức năng: Theo dõi luồng hàng Nhập - Xuất - Chuyển - Nhận
 */
export default function LichSuKhoPage() {
  // State quản lý bộ lọc dùng chung cho cả Stats và Table
  const [filter, setFilter] = useState<any>({});

  // Hàm xử lý khi người dùng nhấn "Áp dụng bộ lọc" từ component Filter
  const handleFilterChange = (newFilter: any) => {
    setFilter(newFilter);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* 1. HEADER TRANG */}
      <div className="bg-white border-b border-gray-100 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <span className="bg-indigo-600 text-white p-2 rounded-2xl shadow-lg shadow-indigo-100">📊</span>
                LỊCH SỬ <span className="text-indigo-600">BIẾN ĐỘNG KHO</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-2">
                Theo dõi chi tiết luồng hàng hóa và giá trị tồn kho theo thời gian thực.
              </p>
            </div>

            {/* Nút tác vụ nhanh */}
            <div className="flex items-center gap-3">
              <a 
                href="/quan-ly-kho/tao-phieu" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
              >
                + Tạo phiếu mới
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* 2. KHU VỰC THỐNG KÊ (STATS) */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <LichSuKhoStats filter={filter} />
        </section>

        {/* 3. KHU VỰC BỘ LỌC (FILTER) */}
        <section className="animate-in fade-in slide-in-from-left-4 duration-700">
          <LichSuKhoFilter onFilterChange={handleFilterChange} />
        </section>

        {/* 4. BẢNG DỮ LIỆU CHI TIẾT (TABLE) */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">
              Danh sách chi tiết giao dịch
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black">
              Data Sync: Live
            </span>
          </div>
          <LichSuKhoTable filter={filter} />
        </section>

      </div>

      {/* FOOTER */}
      <div className="mt-20 text-center">
        <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.5em]">
          ShopMatcha Inventory Intelligence
        </p>
      </div>
    </div>
  );
}