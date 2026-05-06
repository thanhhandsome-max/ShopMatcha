'use client';

import { useEffect, useState } from 'react';
import * as lichSuService from '@/services/lich-su-kho.service';

interface LichSuKhoTableProps {
  filter?: any;
}

export default function LichSuKhoTable({ filter }: LichSuKhoTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLichSu();
  }, [filter]);

  const loadLichSu = async () => {
    setLoading(true);
    try {
      const response = await lichSuService.searchLichSu(filter || {});
      // Đảm bảo dữ liệu là mảng
      setData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Lỗi tải lịch sử kho:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper hiển thị Badge loại biến động
  const renderTypeBadge = (type: string) => {
    const upperType = type?.toUpperCase();
    const types = {
      'NHẬP': 'bg-blue-100 text-blue-700 border-blue-200',
      'XUẤT': 'bg-orange-100 text-orange-700 border-orange-200',
      'CHUYỂN': 'bg-purple-100 text-purple-700 border-purple-200',
      'NHẬN': 'bg-green-100 text-green-700 border-green-200',
    };
    const style = types[upperType as keyof typeof types] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${style}`}>
        {upperType}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-5 text-left">Mã Giao Dịch</th>
              <th className="px-6 py-5 text-left">Thời Gian</th>
              <th className="px-6 py-5 text-left">Sản Phẩm</th>
              <th className="px-6 py-5 text-left">Loại</th>
              <th className="px-6 py-5 text-center">Số Lượng</th>
              <th className="px-6 py-5 text-left">Địa Điểm</th>
              <th className="px-6 py-5 text-right">Giá Trị</th>
              <th className="px-6 py-5 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td colSpan={8} className="px-6 py-5">
                    <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center text-gray-300 font-bold italic">
                  Không tìm thấy dữ liệu lịch sử phù hợp...
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                /* FIX LỖI TRÙNG KEY: Kết hợp ID + Mã SP + Index */
                <tr 
                  key={`${item.MaLS || 'LS'}-${item.MaSP || 'SP'}-${index}`} 
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="text-xs font-black text-gray-900">{item.MaLS}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                      Ref: {item.MaPhieuLienQuan || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-5 text-gray-500 text-[11px] font-medium">
                    {item.NgayTao ? new Date(item.NgayTao).toLocaleString('vi-VN', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                    }) : '---'}
                  </td>

                  <td className="px-6 py-5">
                    <div className="font-black text-gray-700 text-xs">{item.MaSP}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[150px]" title={item.TenSanPham}>
                      {item.TenSanPham || 'Sản phẩm chưa rõ'}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {renderTypeBadge(item.LoaiBienDong)}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded-lg font-black text-gray-900 min-w-[30px]">
                      {item.SoLuong}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center text-[10px] font-bold text-gray-600 gap-1">
                      {item.MaKho && (
                        <span className="bg-blue-50 px-2 py-1 rounded-lg text-blue-600 border border-blue-100">
                          📦 {item.MaKho}
                        </span>
                      )}
                      {item.MaKho && item.MaCH && <span className="text-gray-300">➜</span>}
                      {item.MaCH && (
                        <span className="bg-purple-50 px-2 py-1 rounded-lg text-purple-600 border border-purple-100">
                          🏪 {item.MaCH}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right font-black text-gray-900 tracking-tight">
                    {item.TongTien > 0 ? (
                      <span className="text-emerald-600">
                        {Number(item.TongTien).toLocaleString('vi-VN')} ₫
                      </span>
                    ) : (
                      <span className="text-gray-300 italic text-[10px]">Chưa tính giá</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                      <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl border shadow-sm transition-all ${
                        item.TrangThaiGiaoDich === 1 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse'
                      }`}>
                        {item.TrangThaiGiaoDich === 1 ? '● ĐÃ DUYỆT' : '○ ĐANG CHỜ'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}