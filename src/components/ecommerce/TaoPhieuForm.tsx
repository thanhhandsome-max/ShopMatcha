
'use client';

import { useState } from 'react';
import { createPhieuNhap, createPhieuXuat, createPhieuChuyen } from '@/services/phieu.service';

interface TaoPhieuFormProps {
  type: 'nhap' | 'xuat' | 'chuyen';
  onSuccess?: () => void;
}

export default function TaoPhieuForm({ type = 'nhap', onSuccess }: TaoPhieuFormProps) {
  // State quản lý thông tin phiếu chính
  const [phieu, setPhieu] = useState<any>({
    TrangThai: '1', // Mặc định là Hoàn thành
    NgayTao: new Date().toISOString().split('T')[0] // Mặc định ngày hiện tại
  });
  
  // State quản lý danh sách sản phẩm (chi tiết)
  const [chitiet, setChiTiet] = useState<any[]>([]);
  
  // State quản lý UI/UX
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State tạm để nhập sản phẩm
  const [maSP, setMaSP] = useState('');
  const [soLuong, setSoLuong] = useState<string>('');
  const [tongTienSP, setTongTienSP] = useState<string>('');

  // 1. XỬ LÝ THÊM SẢN PHẨM VÀO DANH SÁCH TẠM
  const handleAddProduct = () => {
    if (!maSP.trim() || !soLuong) {
      setError('Vui lòng nhập Mã sản phẩm và Số lượng');
      return;
    }
    
    const newItem = {
      MaSP: maSP,
      SoLuong: Number(soLuong),
      // Chỉ phiếu nhập mới cần tổng tiền từng món, phiếu khác có thể để trống
      TongTien: type === 'nhap' ? Number(tongTienSP) || 0 : undefined,
    };
    
    setChiTiet([...chitiet, newItem]);
    
    // Reset ô nhập sản phẩm
    setMaSP('');
    setSoLuong('');
    setTongTienSP('');
    setError(null);
  };

  // 2. XỬ LÝ GỬI DỮ LIỆU LÊN SERVER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Ép kiểu dữ liệu chuẩn xác trước khi gửi
      const formattedPhieu = {
        ...phieu,
        TongTien: Number(phieu.TongTien) || 0,
        TrangThai: phieu.TrangThai !== undefined ? Number(phieu.TrangThai) : 1
      };

      let maphieuRes;

      // Logic rẽ nhánh theo loại phiếu
      if (type === 'nhap') {
        maphieuRes = await createPhieuNhap(formattedPhieu, chitiet);
        setResult(`✓ Tạo phiếu nhập thành công: ${maphieuRes}`);
      } else if (type === 'xuat') {
        maphieuRes = await createPhieuXuat(formattedPhieu, chitiet);
        setResult(`✓ Tạo phiếu xuất thành công: ${maphieuRes}`);
      } else if (type === 'chuyen') {
        maphieuRes = await createPhieuChuyen(formattedPhieu, chitiet);
        setResult(`✓ Tạo phiếu chuyển hàng thành công: ${maphieuRes}`);
      }

      // Reset form sau khi thành công
      setPhieu({ TrangThai: '1', NgayTao: new Date().toISOString().split('T')[0] });
      setChiTiet([]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Lỗi submit form:", err);
      setError(`❌ ${err.message || 'Có lỗi xảy ra khi tạo phiếu'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 max-w-xl mx-auto h-full">
      <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
        {type === 'nhap' && '📥 Phiếu Nhập Hàng'}
        {type === 'xuat' && '📤 Phiếu Xuất Hàng'}
        {type === 'chuyen' && '🚚 Phiếu Chuyển Hàng'}
      </h2>

      {/* PHẦN 1: THÔNG TIN CHUNG */}
      <div className="space-y-3 mb-6">
        <input
          className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Mã nhân viên (MaNV)"
          required
          value={phieu.MaNV || ''}
          onChange={(e) => setPhieu((p: any) => ({ ...p, MaNV: e.target.value }))}
        />

        {type === 'nhap' && (
          <input
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Mã nhà phân phối (MaNPP)"
            required
            value={phieu.MaNPP || ''}
            onChange={(e) => setPhieu((p: any) => ({ ...p, MaNPP: e.target.value }))}
          />
        )}

        {type === 'xuat' && (
          <input
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Mã cửa hàng (MaCH)"
            required
            value={phieu.MaCH || ''}
            onChange={(e) => setPhieu((p: any) => ({ ...p, MaCH: e.target.value }))}
          />
        )}

        {/* {type === 'chuyen' && (
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Từ kho (MaCH_Tu)"
              required
              value={phieu.MaCH_Tu || ''}
              onChange={(e) => setPhieu((p: any) => ({ ...p, MaCH_Tu: e.target.value }))}
            />
            <input
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Đến kho (MaCH_Den)"
              required
              value={phieu.MaCH_Den || ''}
              onChange={(e) => setPhieu((p: any) => ({ ...p, MaCH_Den: e.target.value }))}
            />
          </div>
        )} */}
        {type === 'chuyen' && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              className="input border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Mã kho xuất (MaCH_Xuat)"
              required
              value={phieu.MaCH_Xuat || ''}
              onChange={(e) => setPhieu((p: any) => ({ ...p, MaCH_Xuat: e.target.value }))}
            />
            <input
              className="input border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Mã kho nhận (MaCH_Nhan)"
              required
              value={phieu.MaCH_Nhan || ''}
              onChange={(e) => setPhieu((p: any) => ({ ...p, MaCH_Nhan: e.target.value }))}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            type="number"
            placeholder="Tổng tiền phiếu"
            value={phieu.TongTien || ''}
            onChange={(e) => setPhieu((p: any) => ({ ...p, TongTien: e.target.value }))}
          />
          <input
            className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            type="date"
            value={phieu.NgayTao || ''}
            onChange={(e) => setPhieu((p: any) => ({ ...p, NgayTao: e.target.value }))}
          />
        </div>

        <select 
          className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={phieu.TrangThai}
          onChange={(e) => setPhieu((p: any) => ({ ...p, TrangThai: e.target.value }))}
        >
          <option value="1">✅ Hoàn thành</option>
          <option value="0">⏳ Chưa hoàn thành</option>
        </select>
      </div>

      {/* PHẦN 2: THÊM SẢN PHẨM CHI TIẾT */}
      <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
        <h3 className="text-sm font-bold mb-3 text-blue-800 uppercase tracking-wider">Thêm sản phẩm vào danh sách</h3>
        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            className="col-span-4 border p-2 rounded-lg text-sm"
            placeholder="Mã SP"
            value={maSP}
            onChange={(e) => setMaSP(e.target.value)}
          />
          <input
            type="number"
            className="col-span-3 border p-2 rounded-lg text-sm"
            placeholder="SL"
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
          />
          <input
            type="number"
            className={`border p-2 rounded-lg text-sm ${type === 'nhap' ? 'col-span-3' : 'hidden'}`}
            placeholder="Giá"
            value={tongTienSP}
            onChange={(e) => setTongTienSP(e.target.value)}
          />
          <button 
            type="button" 
            onClick={handleAddProduct} 
            className={`${type === 'nhap' ? 'col-span-2' : 'col-span-5'} bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors`}
          >
            Thêm
          </button>
        </div>
      </div>

      {/* PHẦN 3: XEM TRƯỚC DANH SÁCH */}
      {chitiet.length > 0 && (
        <div className="mb-6 max-h-40 overflow-y-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-2">Mã SP</th>
                <th className="p-2">SL</th>
                {type === 'nhap' && <th className="p-2">Tiền</th>}
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {chitiet.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 font-medium">{item.MaSP}</td>
                  <td className="p-2">{item.SoLuong}</td>
                  {type === 'nhap' && <td className="p-2 text-green-600">{item.TongTien?.toLocaleString()}</td>}
                  <td className="p-2 text-right">
                    <button 
                      type="button" 
                      onClick={() => setChiTiet(chitiet.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PHẦN 4: THÔNG BÁO & NÚT GỬI */}
      {error && <p className="text-red-600 text-sm mb-4 font-medium animate-pulse">{error}</p>}
      {result && <p className="text-green-600 text-sm mb-4 font-medium">{result}</p>}

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-green-100 transition-all disabled:bg-gray-300 disabled:shadow-none"
        disabled={loading || chitiet.length === 0}
      >
        {loading ? '⏳ Đang xử lý...' : `🚀 TẠO PHIẾU ${type.toUpperCase()}`}
      </button>
    </form>
  );
}