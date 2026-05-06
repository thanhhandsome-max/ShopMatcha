'use client';

import { useState, useEffect } from 'react';

// Định nghĩa các tông màu cho từng loại phiếu
const theme = {
  nhap: { label: 'Nhập Hàng', icon: '📥', bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
  xuat: { label: 'Xuất Hàng', icon: '📤', bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50' },
  chuyen: { label: 'Chuyển Kho', icon: '🚛', bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50' },
  nhan: { label: 'Nhận Hàng', icon: '✅', bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50' },
};
interface TaoPhieuFormProps {
  forcedType: 'nhap' | 'xuat' | 'chuyen' | 'nhan';
  onSuccess?: () => void;
}
export default function TaoPhieuForm({ forcedType, onSuccess }: TaoPhieuFormProps) {
  const [activeType, setActiveType] = useState<keyof typeof theme>('nhap');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // State cho thông tin phiếu
  const [phieu, setPhieu] = useState<any>({
    MaNV: '',
    NgayTao: new Date().toISOString().split('T')[0],
    TongTien: '',
    MaNPP: '', MaKho: '', MaCH: '', MaCH_Xuat: '', MaCH_Nhan: '', MaPC: ''
  });

  // State cho chi tiết sản phẩm
  const [chitiet, setChiTiet] = useState<any[]>([]);
  const [maSP, setMaSP] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [tongTienSP, setTongTienSP] = useState('');

  const currentTheme = theme[activeType];

  // Reset form khi đổi Tab
  useEffect(() => {
    setPhieu({
      MaNV: phieu.MaNV, // Giữ lại mã nhân viên cho tiện
      NgayTao: new Date().toISOString().split('T')[0],
      TongTien: '',
      MaNPP: '', MaKho: '', MaCH: '', MaCH_Xuat: '', MaCH_Nhan: '', MaPC: ''
    });
    setChiTiet([]);
    setResult(null);
  }, [activeType]);

  // Thêm sản phẩm vào danh sách tạm
  const handleAddProduct = () => {
    if (!maSP || !soLuong) return alert('Vui lòng nhập mã SP và số lượng');
    const newItem = {
      MaSP: maSP.trim().toUpperCase(),
      SoLuong: parseInt(soLuong),
      TongTien: parseFloat(tongTienSP) || 0
    };
    setChiTiet([...chitiet, newItem]);
    // Tính lại tổng tiền phiếu
    setPhieu({ ...phieu, TongTien: phieu.TongTien + newItem.TongTien });
    setMaSP(''); setSoLuong(''); setTongTienSP('');
  };

  // Gửi dữ liệu lên API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/phieu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeType,
          phieu: phieu,
          chitiet: chitiet
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setResult(`🎉 Tạo ${theme[activeType].label} thành công: ${data.MaPhieu}`);
        setChiTiet([]);
        if (activeType !== 'nhan') setPhieu({ ...phieu, TongTien: 0 });
      } else {
        throw new Error(data.error || 'Lỗi không xác định');
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* TABS LỰA CHỌN */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-6 shadow-inner overflow-x-auto">
        {(Object.keys(theme) as Array<keyof typeof theme>).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveType(t)}
            className={`flex-1 py-3 px-4 text-[10px] font-black rounded-xl transition-all whitespace-nowrap ${
              activeType === t ? 'bg-white shadow-sm ' + theme[t].text : 'text-gray-400'
            }`}
          >
            {theme[t].icon} {theme[t].label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${currentTheme.text}`}>
          {currentTheme.icon} {currentTheme.label.toUpperCase()}
        </h2>

        <div className="space-y-4 mb-8">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-purple-500 outline-none text-sm" placeholder="Mã Nhân Viên" required value={phieu.MaNV} onChange={(e) => setPhieu({ ...phieu, MaNV: e.target.value })} />
            <input className="w-full border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" type="date" value={phieu.NgayTao} onChange={(e) => setPhieu({ ...phieu, NgayTao: e.target.value })} />
          </div>

          {/* Input linh hoạt theo loại phiếu */}
          {activeType === 'nhap' && (
            <div className="grid grid-cols-2 gap-4">
              <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Mã Nhà PP" required value={phieu.MaNPP} onChange={(e) => setPhieu({ ...phieu, MaNPP: e.target.value })} />
              <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Nhập vào Kho" required value={phieu.MaKho} onChange={(e) => setPhieu({ ...phieu, MaKho: e.target.value })} />
            </div>
          )}

          {activeType === 'xuat' && (
            <div className="grid grid-cols-2 gap-4">
              <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Từ Kho Xuất" required value={phieu.MaKho} onChange={(e) => setPhieu({ ...phieu, MaKho: e.target.value })} />
              <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Đến Cửa Hàng" required value={phieu.MaCH} onChange={(e) => setPhieu({ ...phieu, MaCH: e.target.value })} />
            </div>
          )}

          {activeType === 'chuyen' && (
            <div className="grid grid-cols-2 gap-4">
              <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Cửa Hàng Xuất" required value={phieu.MaCH_Xuat} onChange={(e) => setPhieu({ ...phieu, MaCH_Xuat: e.target.value })} />
              <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Cửa Hàng Nhận" required value={phieu.MaCH_Nhan} onChange={(e) => setPhieu({ ...phieu, MaCH_Nhan: e.target.value })} />
            </div>
          )}

          {activeType === 'nhan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="Mã Phiếu Chuyển (MaPC)" required value={phieu.MaPC} onChange={(e) => setPhieu({ ...phieu, MaPC: e.target.value })} />
                <input className="border-2 border-gray-100 p-3 rounded-2xl outline-none text-sm" placeholder="CH Nhận Thực Tế" required value={phieu.MaCH} onChange={(e) => setPhieu({ ...phieu, MaCH: e.target.value })} />
              </div>
              <p className="text-[10px] text-green-600 font-bold italic px-2">* Hệ thống sẽ tự động hoàn thành phiếu chuyển liên quan.</p>
            </div>
          )}

          <div className="pt-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tổng giá trị phiếu</label>
            <input 
              className="w-full border-2 border-gray-100 p-3 rounded-2xl outline-none font-black text-blue-600 bg-gray-50 focus:border-blue-400 transition-all" 
              type="number" 
              // THAY ĐỔI: placeholder hiện chữ mờ
              placeholder="Nhập tổng giá trị (VNĐ)..." 
              // THAY ĐỔI: Nếu giá trị là 0 hoặc rỗng thì để trống để placeholder hiện lên
              value={phieu.TongTien || ''} 
              onChange={(e) => setPhieu({ ...phieu, TongTien: e.target.value })} 
            />
          </div>
        </div>

        {/* INPUT THÊM SẢN PHẨM (Ẩn khi đi Nhận hàng vì đã có MaPC) */}
        {activeType !== 'nhan' && (
          <div className="p-5 rounded-3xl border-2 border-dashed border-gray-200 mb-6 bg-gray-50">
            <div className="flex gap-2 items-center">
              <input className="flex-1 p-3 rounded-xl text-xs border border-gray-200 outline-none" placeholder="Mã SP" value={maSP} onChange={(e) => setMaSP(e.target.value)} />
              <input className="w-20 p-3 rounded-xl text-xs border border-gray-200 outline-none" type="number" placeholder="SL" value={soLuong} onChange={(e) => setSoLuong(e.target.value)} />
              {activeType === 'nhap' && <input className="w-24 p-3 rounded-xl text-xs border border-gray-200 outline-none" type="number" placeholder="Giá" value={tongTienSP} onChange={(e) => setTongTienSP(e.target.value)} />}
              <button type="button" onClick={handleAddProduct} className={`px-4 py-3 rounded-xl text-white font-black text-[10px] transition-all shadow-md ${currentTheme.bg}`}>
                + THÊM
              </button>
            </div>
          </div>
        )}

        {/* BẢNG DANH SÁCH SẢN PHẨM TẠM */}
        {chitiet.length > 0 && (
          <div className="mb-8 rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
                <tr><th className="p-4">Sản Phẩm</th><th className="p-4 text-center">SL</th><th className="p-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chitiet.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 font-black text-gray-700">{item.MaSP}</td>
                    <td className="p-4 text-center font-bold">{item.SoLuong}</td>
                    <td className="p-4 text-right">
                      <button type="button" onClick={() => setChiTiet(prev => prev.filter((_, i) => i !== index))} className="text-red-400 font-black">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* HIỂN THỊ TRẠNG THÁI TỰ ĐỘNG */}
        <div className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center mb-8">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            TRẠNG THÁI: {activeType === 'chuyen' ? '⏳ CHỜ XỬ LÝ' : '✅ HOÀN THÀNH'}
          </span>
        </div>

        {/* THÔNG BÁO KẾT QUẢ */}
        {result && (
          <div className="text-green-600 text-center font-black mb-8 bg-green-50 p-4 rounded-2xl border border-green-100 animate-pulse text-xs">
            {result}
          </div>
        )}

        {/* NÚT XÁC NHẬN */}
        <button 
          type="submit" 
          disabled={loading || (activeType !== 'nhan' && chitiet.length === 0)} 
          className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${loading ? 'bg-gray-200' : currentTheme.bg}`}
        >
          {loading ? '⏳ ĐANG XỬ LÝ...' : `🚀 XÁC NHẬN TẠO PHIẾU ${activeType.toUpperCase()}`}
        </button>
      </form>
    </div>
  );
}