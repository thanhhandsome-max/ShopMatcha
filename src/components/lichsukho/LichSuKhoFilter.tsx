'use client';

import { useState } from 'react';

interface FilterProps {
  onFilterChange: (filter: any) => void;
}

export default function LichSuKhoFilter({ onFilterChange }: FilterProps) {
  const [tempFilter, setTempFilter] = useState({
    type: '',
    kho: '',
    sanpham: '',
    startDate: '',
    endDate: '',
  });

  // Gửi bộ lọc lên cha khi nhấn nút TÌM KIẾM
  const handleApplyFilter = () => {
    onFilterChange(tempFilter);
  };

  // Xóa toàn bộ bộ lọc
  const handleReset = () => {
    const emptyFilter = { type: '', kho: '', sanpham: '', startDate: '', endDate: '' };
    setTempFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔍</span>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-800">Bộ lọc thông minh</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Lọc theo Loại */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Loại giao dịch</label>
          <select 
            className="w-full border-2 border-gray-50 p-2.5 rounded-2xl outline-none focus:border-purple-500 text-xs font-bold bg-gray-50/50"
            value={tempFilter.type}
            onChange={(e) => setTempFilter({ ...tempFilter, type: e.target.value })}
          >
            <option value="">Tất cả loại</option>
            <option value="nhap">📥 Nhập hàng</option>
            <option value="xuat">📤 Xuất hàng</option>
            <option value="chuyen">🚛 Chuyển kho</option>
            <option value="nhan">✅ Nhận hàng</option>
          </select>
        </div>

        {/* Lọc theo Kho/CH */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Kho / Cửa hàng</label>
          <input 
            className="w-full border-2 border-gray-50 p-2.5 rounded-2xl outline-none focus:border-purple-500 text-xs font-bold bg-gray-50/50"
            placeholder="Mã Kho hoặc Mã CH"
            value={tempFilter.kho}
            onChange={(e) => setTempFilter({ ...tempFilter, kho: e.target.value })}
          />
        </div>

        {/* Lọc theo Mã SP */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Mã sản phẩm</label>
          <input 
            className="w-full border-2 border-gray-50 p-2.5 rounded-2xl outline-none focus:border-purple-500 text-xs font-bold bg-gray-50/50"
            placeholder="Ví dụ: SP001"
            value={tempFilter.sanpham}
            onChange={(e) => setTempFilter({ ...tempFilter, sanpham: e.target.value })}
          />
        </div>

        {/* Ngày bắt đầu */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Từ ngày</label>
          <input 
            type="date"
            className="w-full border-2 border-gray-50 p-2.5 rounded-2xl outline-none focus:border-purple-500 text-xs font-bold bg-gray-50/50"
            value={tempFilter.startDate}
            onChange={(e) => setTempFilter({ ...tempFilter, startDate: e.target.value })}
          />
        </div>

        {/* Ngày kết thúc */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Đến ngày</label>
          <input 
            type="date"
            className="w-full border-2 border-gray-50 p-2.5 rounded-2xl outline-none focus:border-purple-500 text-xs font-bold bg-gray-50/50"
            value={tempFilter.endDate}
            onChange={(e) => setTempFilter({ ...tempFilter, endDate: e.target.value })}
          />
        </div>

      </div>

      {/* NÚT THAO TÁC */}
      <div className="flex justify-end gap-2 mt-6">
        <button 
          onClick={handleReset}
          className="px-6 py-2.5 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase"
        >
          Xóa lọc
        </button>
        <button 
          onClick={handleApplyFilter}
          className="px-8 py-2.5 rounded-2xl text-[10px] font-black text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all uppercase tracking-widest"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
}