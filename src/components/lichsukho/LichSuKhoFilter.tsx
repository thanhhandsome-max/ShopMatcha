'use client';

import { useState } from 'react';

interface LichSuKhoFilterProps {
  onFilterChange: (filter: any) => void;
}

export default function LichSuKhoFilter({ onFilterChange }: LichSuKhoFilterProps) {
  const [type, setType] = useState<'nhap' | 'xuat' | 'chuyen' | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleFilterChange = () => {
    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (startDate) {
      filter.startDate = new Date(startDate);
    }

    if (endDate) {
      filter.endDate = new Date(endDate);
    }

    onFilterChange(filter);
  };

  const handleReset = () => {
    setType('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4">Bộ lọc lịch sử kho</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Loại giao dịch */}
        <div>
          <label className="block text-sm font-medium mb-2">Loại giao dịch</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tất cả</option>
            <option value="nhap">Nhập hàng</option>
            <option value="xuat">Xuất hàng</option>
            <option value="chuyen">Chuyển hàng</option>
          </select>
        </div>

        {/* Từ ngày */}
        <div>
          <label className="block text-sm font-medium mb-2">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Đến ngày */}
        <div>
          <label className="block text-sm font-medium mb-2">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Nút */}
        <div className="flex gap-2 items-end">
          <button
            onClick={handleFilterChange}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Lọc
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
