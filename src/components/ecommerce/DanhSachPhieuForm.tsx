'use client';

import { useState, useEffect } from 'react';

interface PhieuNhap {
  MaPN: string;
  MaNPP: string;
  MaNV: string;
  TongTien: number;
  NgayTao: string;
  TrangThai: number;
}

interface PhieuXuat {
  MaPX: string;
  MaNV: string;
  MaCH: string;
  TongTien: number;
  NgayTao: string;
  TrangThai: number;
}

export default function DanhSachPhieuForm({ type = 'nhap' }: { type: 'nhap' | 'xuat' }) {
  const [phieu, setPhieu] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhieu, setSelectedPhieu] = useState<string | null>(null);
  const [chitietVisible, setChitietVisible] = useState(false);
  const [chitiet, setChitiet] = useState<any[]>([]);

  useEffect(() => {
    loadPhieu();
  }, [type]);

  const loadPhieu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/phieu?type=${type}`);
      const data = await res.json();
      if (data.ok) {
        setPhieu(Array.isArray(data.phieu) ? data.phieu : []);
      } else {
        setError(data.error || 'Không thể tải danh sách phiếu');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const loadChitiet = async (maphieu: string) => {
    try {
      const res = await fetch(`/api/phieu?type=${type}&maphieu=${maphieu}&chitiet=true`);
      const data = await res.json();
      if (data.ok) {
        setChitiet(Array.isArray(data.chitiet) ? data.chitiet : []);
        setChitietVisible(true);
      } else {
        setError(data.error || 'Không thể tải chi tiết');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    }
  };

  const handleXoa = async (maphieu: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phiếu này?')) return;
    try {
      const res = await fetch('/api/phieu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, maphieu }),
      });
      const data = await res.json();
      if (data.ok) {
        loadPhieu();
      } else {
        setError(data.error || 'Xóa thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-theme-sm max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{type === 'nhap' ? 'Danh sách phiếu nhập' : 'Danh sách phiếu xuất'}</h2>
        <button onClick={loadPhieu} className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {phieu.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có phiếu {type === 'nhap' ? 'nhập' : 'xuất'} nào
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Mã phiếu</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Ngày tạo</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Tổng tiền</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Trạng thái</th>
                <th className="border border-gray-200 px-4 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {phieu.map((p: any) => (
                <tr key={p[type === 'nhap' ? 'MaPN' : 'MaPX']} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">{p[type === 'nhap' ? 'MaPN' : 'MaPX']}</td>
                  <td className="border border-gray-200 px-4 py-2">{new Date(p.NgayTao).toLocaleDateString('vi-VN')}</td>
                  <td className="border border-gray-200 px-4 py-2">{p.TongTien?.toLocaleString('vi-VN')} ₫</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.TrangThai === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.TrangThai === 1 ? 'Hoàn thành' : 'Chưa hoàn thành'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedPhieu(p[type === 'nhap' ? 'MaPN' : 'MaPX']);
                        loadChitiet(p[type === 'nhap' ? 'MaPN' : 'MaPX']);
                      }}
                      className="btn btn-sm btn-info mr-2"
                    >
                      Chi tiết
                    </button>
                    <button onClick={() => handleXoa(p[type === 'nhap' ? 'MaPN' : 'MaPX'])} className="btn btn-sm btn-danger">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chitietVisible && selectedPhieu && (
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chi tiết phiếu: {selectedPhieu}</h3>
            <button onClick={() => setChitietVisible(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          {chitiet.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Không có chi tiết sản phẩm</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Mã sản phẩm</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Số lượng</th>
                  {type === 'nhap' && <th className="border border-gray-200 px-4 py-2 text-left">Tổng tiền</th>}
                </tr>
              </thead>
              <tbody>
                {chitiet.map((ct: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-gray-200 px-4 py-2">{ct.MaSP}</td>
                    <td className="border border-gray-200 px-4 py-2">{ct.SoLuong}</td>
                    {type === 'nhap' && <td className="border border-gray-200 px-4 py-2">{ct.TongTien?.toLocaleString('vi-VN')} ₫</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
