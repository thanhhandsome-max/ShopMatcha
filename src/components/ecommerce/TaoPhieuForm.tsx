'use client';

import { useState } from 'react';
import { createPhieuNhap, createPhieuXuat } from '@/services/phieu.service';

export default function TaoPhieuForm({ type = 'nhap', onSuccess }: { type: 'nhap' | 'xuat'; onSuccess?: () => void }) {
  const [phieu, setPhieu] = useState<any>({});
  const [chitiet, setChiTiet] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let maphieu;
      if (type === 'nhap') {
        maphieu = await createPhieuNhap(phieu, chitiet);
        setResult(`✓ Tạo phiếu nhập thành công: ${maphieu}`);
      } else {
        maphieu = await createPhieuXuat(phieu, chitiet);
        setResult(`✓ Tạo phiếu xuất thành công: ${maphieu}`);
      }
      
      // Reset form
      setPhieu({});
      setChiTiet([]);
      
      // Call callback to refresh list
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(`❌ ${err.message || 'Có lỗi xảy ra'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-theme-sm max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">
        {type === 'nhap' ? '📥 Tạo phiếu nhập hàng' : '📤 Tạo phiếu xuất hàng'}
      </h2>

      {/* Nhập các trường cơ bản */}
      {type === 'nhap' && (
        <input
          className="input mb-3 w-full"
          placeholder="Mã nhà phân phối (MaNPP)"
          onChange={(e) => setPhieu((p: any) => ({ ...p, MaNPP: e.target.value }))}
        />
      )}
      <input
        className="input mb-3 w-full"
        placeholder="Mã nhân viên (MaNV)"
        onChange={(e) => setPhieu((p: any) => ({ ...p, MaNV: e.target.value }))}
      />
      {type === 'xuat' && (
        <input
          className="input mb-3 w-full"
          placeholder="Mã cửa hàng (MaCH)"
          onChange={(e) => setPhieu((p: any) => ({ ...p, MaCH: e.target.value }))}
        />
      )}
      <input
        className="input mb-3 w-full"
        placeholder="Tổng tiền"
        type="number"
        onChange={(e) => setPhieu((p: any) => ({ ...p, TongTien: Number(e.target.value) }))}
      />
      <input
        className="input mb-3 w-full"
        placeholder="Ngày tạo (yyyy-mm-dd)"
        type="date"
        onChange={(e) => setPhieu((p: any) => ({ ...p, NgayTao: e.target.value }))}
      />
      <input
        className="input mb-3 w-full"
        placeholder="Trạng thái (1=Hoàn thành, 0=Chưa)"
        type="number"
        onChange={(e) => setPhieu((p: any) => ({ ...p, TrangThai: Number(e.target.value) }))}
      />

      {/* TODO: Thêm bảng nhập chi tiết sản phẩm */}
      <div className="text-sm text-gray-500 mb-3 p-2 bg-blue-50 rounded">
        💡 TODO: Thêm bảng nhập chi tiết sản phẩm (MaSP, SoLuong, TongTien)
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? '⏳ Đang gửi...' : '✓ Tạo phiếu'}
      </button>

      {result && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">{result}</div>}
      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
    </form>
  );
}
