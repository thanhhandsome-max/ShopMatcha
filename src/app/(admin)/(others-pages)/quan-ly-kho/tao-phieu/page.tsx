'use client';

import React, { useState } from 'react';
import TaoPhieuForm from '@/components/ecommerce/TaoPhieuForm';
import DanhSachPhieuForm from '@/components/ecommerce/DanhSachPhieuForm';

export default function TaoPhieuPage() {
  // 1. State điều khiển loại phiếu đang tạo (Form phía trên)
  const [formType, setFormType] = useState<'nhap' | 'xuat' | 'chuyen' | 'nhan'>('nhap');
  
  // 2. State điều khiển loại phiếu đang xem (Danh sách phía dưới)
  const [viewType, setViewType] = useState<'nhap' | 'xuat' | 'chuyen' | 'nhan'>('nhap');
  
  // 3. Key dùng để ép danh sách load lại dữ liệu khi tạo phiếu thành công
  const [refreshKey, setRefreshKey] = useState(0);

  // Xử lý khi tạo phiếu thành công
  const handleCreateSuccess = () => {
    // Tự động chuyển danh sách bên dưới sang loại phiếu vừa tạo để kiểm tra
    setViewType(formType);
    // Tăng key để component DanhSachPhieuForm thực hiện fetch lại data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* =========================================================
          HEADER TỔNG THỂ
          ========================================================= */}
      <div className="bg-white border-b border-gray-100 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="bg-purple-600 text-white p-2 rounded-2xl shadow-lg shadow-purple-100">📦</span>
              HỆ THỐNG <span className="text-purple-600 uppercase">QUẢN LÝ KHO</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">ShopMatcha Inventory v2.6</p>
          </div>

          {/* Thanh chọn nhanh loại phiếu để tạo (Form) */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* =========================================================
            KHU VỰC 1: FORM TẠO PHIẾU (NẰM TRÊN)
            ========================================================= */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-1 w-6 bg-purple-600 rounded-full"></div>
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
              Bắt đầu tạo phiếu mới
            </h3>
          </div>
          
          {/* Component Form - Truyền type và hàm callback khi thành công */}
          <TaoPhieuForm 
            forcedType={formType} 
            onSuccess={handleCreateSuccess} 
          />
        </section>

        {/* ĐƯỜNG CHIA CÁCH TRỰC QUAN (DIVIDER) */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 border-dashed"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-6 text-gray-400 text-xl filter grayscale opacity-50">📂</span>
          </div>
        </div>

        {/* =========================================================
            KHU VỰC 2: DANH SÁCH PHIẾU (NẰM DƯỚI)
            ========================================================= */}
        <section className="space-y-6">
          
          {/* THANH CHỌN TABS DANH SÁCH - NẰM NGAY TRÊN ĐẦU BẢNG */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 px-2">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-800 uppercase italic flex items-center gap-2">
                Tra cứu lịch sử 
                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg text-[10px] not-italic">
                  {viewType.toUpperCase()}
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                Danh sách các phiếu đã được lưu trữ trong hệ thống
              </p>
            </div>

            {/* BỘ TABS CHUYÊN BIỆT CHO DANH SÁCH */}
            <div className="flex p-1.5 bg-white border border-gray-200 rounded-[24px] shadow-sm">
              {(['nhap', 'xuat', 'chuyen', 'nhan'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewType(tab)}
                  className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                    viewType === tab 
                    ? 'bg-purple-600 text-white shadow-xl shadow-purple-100 scale-105' 
                    : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'nhap' && '📥 Nhập'}
                  {tab === 'xuat' && '📤 Xuất'}
                  {tab === 'chuyen' && '🚛 Chuyển'}
                  {tab === 'nhan' && '✅ Nhận'}
                </button>
              ))}
            </div>
          </div>

          {/* HIỂN THỊ DANH SÁCH PHIẾU */}
          <div 
            key={`${viewType}-${refreshKey}`} 
            className="animate-in fade-in slide-in-from-bottom-6 duration-700"
          >
            <DanhSachPhieuForm type={viewType} />
          </div>
        </section>

      </div>

      {/* FOOTER TRANG TRÍ */}
      <div className="mt-20 border-t border-gray-100 pt-10 text-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">
          ShopMatcha Ecosystem &bull; Secure Inventory Management
        </p>
      </div>
    </div>
  );
}