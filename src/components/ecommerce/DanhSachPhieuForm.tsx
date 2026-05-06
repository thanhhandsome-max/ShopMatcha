'use client';

import { useState, useEffect } from 'react';

interface DanhSachPhieuProps {
  type: 'nhap' | 'xuat' | 'chuyen' | 'nhan';
}

export default function DanhSachPhieuForm({ type = 'nhap' }: DanhSachPhieuProps) {
  const [phieu, setPhieu] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhieu, setSelectedPhieu] = useState<string | null>(null);
  const [chitietVisible, setChitietVisible] = useState(false);
  const [chitiet, setChitiet] = useState<any[]>([]);

  // 1. Cấu hình màu sắc và nhãn theo loại phiếu
  const config = {
    nhap: { id: 'MaPN', label: 'Phiếu Nhập', color: 'blue' },
    xuat: { id: 'MaPX', label: 'Phiếu Xuất', color: 'orange' },
    chuyen: { id: 'MaPC', label: 'Phiếu Chuyển', color: 'purple' },
    nhan: { id: 'MaPNH', label: 'Phiếu Nhận', color: 'green' }
  }[type];

  const colorClasses = {
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
    orange: { bg: 'bg-orange-50/50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
    purple: { bg: 'bg-purple-50/50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
    green: { bg: 'bg-green-50/50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-800' }
  }[config.color as 'blue' | 'orange' | 'purple' | 'green'];

  useEffect(() => {
    loadPhieu();
    setChitietVisible(false);
  }, [type]);

  // 2. Load danh sách phiếu từ API
  const loadPhieu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/phieu?type=${type}`);
      const data = await res.json();
      if (data.ok) {
        setPhieu(Array.isArray(data.phieu) ? data.phieu : []);
      } else {
        setError(data.error || 'Không thể tải danh sách');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // 3. Load chi tiết sản phẩm của phiếu
  const loadChitiet = async (id: string) => {
    try {
      const res = await fetch(`/api/phieu?type=${type}&maphieu=${id}&chitiet=true`);
      const data = await res.json();
      if (data.ok) {
        setChitiet(data.chitiet || []);
        setChitietVisible(true);
        setSelectedPhieu(id);
      }
    } catch (err) {
      alert('Lỗi tải dữ liệu chi tiết');
    }
  };

  const handleXoa = async (id: string) => {
    if (!window.confirm(`Xác nhận xóa phiếu ${id}? Hành động này không thể hoàn tác.`)) return;
    try {
      const res = await fetch('/api/phieu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, maphieu: id }),
      });
      if ((await res.json()).ok) loadPhieu();
    } catch (err) {
      alert('Lỗi khi thực hiện xóa');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all">
      {/* HEADER BẢNG */}
      <div className={`p-5 border-b flex justify-between items-center ${colorClasses.bg}`}>
        <div>
          <h3 className={`font-black uppercase text-sm tracking-tighter ${colorClasses.text}`}>
            {config.label}
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase opacity-60">Quản lý lịch sử biến động</p>
        </div>
        <button 
          onClick={loadPhieu} 
          className="bg-white hover:scale-105 transition-transform border border-gray-200 px-4 py-2 rounded-2xl font-black text-[10px] shadow-sm flex items-center gap-2"
          disabled={loading}
        >
          {loading ? '...' : '🔄 LÀM MỚI'}
        </button>
      </div>

      {error && <div className="m-5 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100">⚠️ {error}</div>}

      {/* TABLE CONTENT */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-5 text-left">Mã định danh</th>
              <th className="px-6 py-5 text-left">Thời điểm</th>
              {type === 'nhap' && <th className="px-6 py-5 text-left">Đối tác NPP</th>}
              {(type === 'xuat' || type === 'nhan') && <th className="px-6 py-5 text-left">Cơ sở/Cửa hàng</th>}
              {type === 'chuyen' && <th className="px-6 py-5 text-left">Lộ trình vận chuyển</th>}
              <th className="px-6 py-5 text-left">Trạng thái</th>
              <th className="px-6 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {phieu.length === 0 && !loading ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-300 font-medium italic">Hiện chưa có dữ liệu cho mục này...</td></tr>
            ) : (
              phieu.map((p) => (
                <tr key={p[config.id]} className={`group hover:bg-gray-50/80 transition-colors ${selectedPhieu === p[config.id] ? 'bg-purple-50/30' : ''}`}>
                  <td className="px-6 py-5 font-black text-gray-900">{p[config.id]}</td>
                  <td className="px-6 py-5 text-gray-500 text-xs font-medium">
                    {p.NgayTao ? new Date(p.NgayTao).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                  </td>
                  
                  {/* Dữ liệu linh hoạt */}
                  <td className="px-6 py-5 font-bold text-gray-600 italic">
                    {type === 'nhap' && (p.MaNPP || '---')}
                    {(type === 'xuat' || type === 'nhan') && (p.MaCH || '---')}
                    {type === 'chuyen' && (
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{p.MaCH_Xuat}</span>
                        <span className="text-gray-300">➜</span>
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">{p.MaCH_Nhan}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm border ${
                      p.TrangThai === 1 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse'
                    }`}>
                      {p.TrangThai === 1 ? '✅ HOÀN THÀNH' : '⏳ CHỜ XỬ LÝ'}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => loadChitiet(p[config.id])} className="p-2.5 bg-white border border-gray-100 hover:border-purple-300 rounded-xl text-lg shadow-sm" title="Chi tiết">👁️</button>
                      <button onClick={() => handleXoa(p[config.id])} className="p-2.5 bg-white border border-gray-100 hover:bg-red-50 hover:border-red-200 rounded-xl text-lg shadow-sm" title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CHI TIẾT SẢN PHẨM (DASHED BOX) */}
      {chitietVisible && (
        <div className={`m-6 p-6 rounded-3xl border-2 border-dashed bg-gray-50/50 ${colorClasses.border} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-black text-gray-800 text-sm flex items-center gap-2">
                📦 KIỂM TRA SẢN PHẨM: <span className={colorClasses.text}>{selectedPhieu}</span>
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Danh sách chi tiết các mặt hàng trong phiếu</p>
            </div>
            <button onClick={() => setChitietVisible(false)} className="bg-white border p-2 rounded-xl hover:text-red-500 font-black shadow-sm">ĐÓNG ✕</button>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80 text-gray-400 font-black text-[9px] uppercase">
                <tr>
                  <th className="px-4 py-4 text-left">Mã sản phẩm</th>
                  <th className="px-4 py-4 text-center">Lượng hàng</th>
                  {type === 'nhap' && <th className="px-4 py-4 text-right">Tổng giá trị</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chitiet.map((ct: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4 font-black text-gray-700">{ct.MaSp || ct.MaSP || ct.Masp}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg font-black text-gray-600">{ct.SoLuong}</span>
                    </td>
                    {type === 'nhap' && (
                      <td className="px-4 py-4 text-right text-green-600 font-black tracking-tight">
                        {ct.TongTien?.toLocaleString('vi-VN')} ₫
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}