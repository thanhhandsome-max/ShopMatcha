// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   getAllKhuyenMai,
//   createKhuyenMai,
//   updateKhuyenMai,
//   deleteKhuyenMai,
//   getAllMaGiamGia,
//   createMaGiamGia,
//   updateMaGiamGia,
//   deleteMaGiamGia,
// } from '@/services/khuyen-mai.service';
// import { IKhuyenMai } from '@/types';

// const formatDate = (value?: string | Date) => {
//   if (!value) return '---';
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return '---';
//   return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
// };

// const formatCurrency = (value?: number) => {
//   if (value === undefined || value === null) return '0';
//   return Number(value).toLocaleString('vi-VN');
// };

// export default function KhuyenMaiPage() {
//   const [activeTab, setActiveTab] = useState<'khuyen-mai' | 'ma-giam-gia'>('khuyen-mai');
//   const [khuyenMaiList, setKhuyenMaiList] = useState<IKhuyenMai[]>([]);
//   const [maGiamGiaList, setMaGiamGiaList] = useState<IKhuyenMai[]>([]);
//   const [loading, setLoading] = useState(false);

//   // FORM STATES - KHUYẾN MÃI
//   const [kmForm, setKmForm] = useState({
//     Makhuyenmai: '',
//     MaCH: '',
//     Masp: '',
//     mota: '',
//     giatrima: '',
//     thoihan: '',
//   });
//   const [kmEditing, setKmEditing] = useState<string | null>(null);

//   // FORM STATES - MÃ GIẢM GIÁ
//   const [ggForm, setGgForm] = useState({
//     Makhuyenmai: '',
//     Masp: '', // Mã code giảm giá
//     mota: '', // Tên khuyến mãi
//     giatrima: '',
//     thoihan: '',
//   });
//   const [ggEditing, setGgEditing] = useState<string | null>(null);

//   // Load dữ liệu
//   useEffect(() => {
//     loadKhuyenMai();
//     loadMaGiamGia();
//   }, []);

//   const loadKhuyenMai = async () => {
//     try {
//       const data = await getAllKhuyenMai();
//       setKhuyenMaiList(data);
//     } catch (error) {
//       console.error('Lỗi tải khuyến mãi:', error);
//       alert('Lỗi tải danh sách khuyến mãi');
//     }
//   };

//   const loadMaGiamGia = async () => {
//     try {
//       const data = await getAllMaGiamGia();
//       setMaGiamGiaList(data);
//     } catch (error) {
//       console.error('Lỗi tải mã giảm giá:', error);
//       alert('Lỗi tải danh sách mã giảm giá');
//     }
//   };

//   // ===== KHUYẾN MÃI =====

//   const handleKmFormChange = (field: string, value: string | number) => {
//     setKmForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const resetKmForm = () => {
//     setKmForm({ Makhuyenmai: '', MaCH: '', Masp: '', mota: '', giatrima: '', thoihan: '' });
//     setKmEditing(null);
//   };

//   const handleKmSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!kmForm.Makhuyenmai || !kmForm.MaCH || !kmForm.Masp || !kmForm.giatrima) {
//       alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
//       return;
//     }

//     // Đảm bảo mã bắt đầu bằng KM_
//     let makhuyenmai = kmForm.Makhuyenmai;
//     if (!makhuyenmai.startsWith('KM_')) {
//       makhuyenmai = `KM_${makhuyenmai}`;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         Makhuyenmai: makhuyenmai,
//         MaCH: kmForm.MaCH,
//         Masp: kmForm.Masp,
//         mota: kmForm.mota,
//         giatrima: Number(kmForm.giatrima),
//         thoihan: kmForm.thoihan || undefined,
//       };
//       if (kmEditing) {
//         await updateKhuyenMai(kmEditing, payload);
//         alert('Cập nhật khuyến mãi thành công');
//       } else {
//         await createKhuyenMai(payload as IKhuyenMai);
//         alert('Tạo khuyến mãi thành công');
//       }
//       loadKhuyenMai();
//       resetKmForm();
//     } catch (error) {
//       console.error('Lỗi:', error);
//       alert(`Lỗi: ${(error as Error).message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKmEdit = (km: IKhuyenMai) => {
//     setKmForm({
//       Makhuyenmai: km.Makhuyenmai,
//       MaCH: km.MaCH || '',
//       Masp: km.Masp || '',
//       mota: km.mota || '',
//       giatrima: km.giatrima?.toString() || '',
//       thoihan: km.thoihan ? new Date(km.thoihan).toISOString().split('T')[0] : '',
//     });
//     setKmEditing(km.Makhuyenmai);
//   };

//   const handleKmDelete = async (Makhuyenmai: string) => {
//     if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
//     setLoading(true);
//     try {
//       await deleteKhuyenMai(Makhuyenmai);
//       alert('Xóa khuyến mãi thành công');
//       loadKhuyenMai();
//     } catch (error) {
//       alert(`Lỗi: ${(error as Error).message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== MÃ GIẢM GIÁ =====

//   const handleGgFormChange = (field: string, value: string | number) => {
//     setGgForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const resetGgForm = () => {
//     setGgForm({ Makhuyenmai: '', Masp: '', mota: '', giatrima: '', thoihan: '' });
//     setGgEditing(null);
//   };

//   const handleGgSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!ggForm.Makhuyenmai || !ggForm.Masp || !ggForm.giatrima) {
//       alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
//       return;
//     }

//     // Đảm bảo mã bắt đầu bằng GG_
//     let makhuyenmai = ggForm.Makhuyenmai;
//     if (!makhuyenmai.startsWith('GG_')) {
//       makhuyenmai = `GG_${makhuyenmai}`;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         Makhuyenmai: makhuyenmai,
//         Masp: ggForm.Masp,
//         mota: ggForm.mota, // Tên khuyến mãi
//         giatrima: Number(ggForm.giatrima),
//         thoihan: ggForm.thoihan || undefined,
//       };
//       if (ggEditing) {
//         await updateMaGiamGia(ggEditing, payload);
//         alert('Cập nhật mã giảm giá thành công');
//       } else {
//         await createMaGiamGia(payload);
//         alert('Tạo mã giảm giá thành công');
//       }
//       loadMaGiamGia();
//       resetGgForm();
//     } catch (error) {
//       console.error('Lỗi:', error);
//       alert(`Lỗi: ${(error as Error).message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGgEdit = (gg: IKhuyenMai) => {
//     setGgForm({
//       Makhuyenmai: gg.Makhuyenmai,
//       Masp: gg.Masp || '',
//       mota: gg.mota || '',
//       giatrima: gg.giatrima?.toString() || '',
//       thoihan: gg.thoihan ? new Date(gg.thoihan).toISOString().split('T')[0] : '',
//     });
//     setGgEditing(gg.Makhuyenmai);
//   };

//   const handleGgDelete = async (Makhuyenmai: string) => {
//     if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
//     setLoading(true);
//     try {
//       await deleteMaGiamGia(Makhuyenmai);
//       alert('Xóa mã giảm giá thành công');
//       loadMaGiamGia();
//     } catch (error) {
//       alert(`Lỗi: ${(error as Error).message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">Quản lý Khuyến mãi & Mã giảm giá</h1>
//         <p className="text-sm text-gray-500 mt-1">Tạo, sửa, xóa chương trình khuyến mãi và mã giảm giá (dùng bảng KhuyenMai)</p>
//       </div>

//       {/* TABS */}
//       <div className="flex gap-4 mb-6 border-b border-gray-200">
//         <button
//           onClick={() => setActiveTab('khuyen-mai')}
//           className={`px-4 py-3 font-medium transition ${
//             activeTab === 'khuyen-mai'
//               ? 'text-brand-600 border-b-2 border-brand-600'
//               : 'text-gray-600 hover:text-gray-800'
//           }`}
//         >
//           Khuyến mãi sản phẩm (KM_*)
//         </button>
//         <button
//           onClick={() => setActiveTab('ma-giam-gia')}
//           className={`px-4 py-3 font-medium transition ${
//             activeTab === 'ma-giam-gia'
//               ? 'text-brand-600 border-b-2 border-brand-600'
//               : 'text-gray-600 hover:text-gray-800'
//           }`}
//         >
//           Mã giảm giá (GG_*)
//         </button>
//       </div>

//       {/* ===== TAB: KHUYẾN MÃI ===== */}
//       {activeTab === 'khuyen-mai' && (
//         <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-6">
//           {/* FORM */}
//           <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm h-fit">
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               {kmEditing ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi'}
//             </h2>
//             <form onSubmit={handleKmSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Mã (tự động thêm KM_) *</label>
//                 <input
//                   type="text"
//                   value={kmForm.Makhuyenmai}
//                   onChange={(e) => handleKmFormChange('Makhuyenmai', e.target.value)}
//                   disabled={!!kmEditing}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm disabled:bg-gray-100"
//                   placeholder="001"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng *</label>
//                 <input
//                   type="text"
//                   value={kmForm.MaCH}
//                   onChange={(e) => handleKmFormChange('MaCH', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="CH001"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm *</label>
//                 <input
//                   type="text"
//                   value={kmForm.Masp}
//                   onChange={(e) => handleKmFormChange('Masp', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="SP001"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm *</label>
//                 <input
//                   type="number"
//                   value={kmForm.giatrima}
//                   onChange={(e) => handleKmFormChange('giatrima', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="50000"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn</label>
//                 <input
//                   type="date"
//                   value={kmForm.thoihan}
//                   onChange={(e) => handleKmFormChange('thoihan', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
//                 <textarea
//                   value={kmForm.mota}
//                   onChange={(e) => handleKmFormChange('mota', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="Mô tả chi tiết..."
//                   rows={3}
//                 />
//               </div>

//               <div className="flex gap-2 pt-4">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-gray-400"
//                 >
//                   {kmEditing ? 'Cập nhật' : 'Tạo'}
//                 </button>
//                 {kmEditing && (
//                   <button
//                     type="button"
//                     onClick={resetKmForm}
//                     className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                   >
//                     Hủy
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>

//           {/* TABLE */}
//           <div className="rounded-3xl border border-gray-200 bg-white shadow-theme-sm overflow-hidden">
//             <table className="min-w-full text-left text-sm text-gray-700">
//               <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-[0.2em]">
//                 <tr>
//                   <th className="px-4 py-3">Mã KM</th>
//                   <th className="px-4 py-3">Cửa hàng</th>
//                   <th className="px-4 py-3">SP</th>
//                   <th className="px-4 py-3">Giá trị</th>
//                   <th className="px-4 py-3">Thời hạn</th>
//                   <th className="px-4 py-3 text-center">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {khuyenMaiList.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="px-4 py-5 text-center text-gray-500">Chưa có khuyến mãi</td>
//                   </tr>
//                 ) : (
//                   khuyenMaiList.map((km) => (
//                     <tr key={km.Makhuyenmai} className="border-t border-gray-100 hover:bg-gray-50">
//                       <td className="px-4 py-3 font-medium">{km.Makhuyenmai}</td>
//                       <td className="px-4 py-3">{km.MaCH}</td>
//                       <td className="px-4 py-3">{km.Masp}</td>
//                       <td className="px-4 py-3">{formatCurrency(km.giatrima)}</td>
//                       <td className="px-4 py-3">{formatDate(km.thoihan)}</td>
//                       <td className="px-4 py-3 text-center flex justify-center gap-2">
//                         <button
//                           onClick={() => handleKmEdit(km)}
//                           className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
//                         >
//                           Sửa
//                         </button>
//                         <button
//                           onClick={() => handleKmDelete(km.Makhuyenmai)}
//                           className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700"
//                         >
//                           Xóa
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ===== TAB: MÃ GIẢM GIÁ ===== */}
//       {activeTab === 'ma-giam-gia' && (
//         <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-6">
//           {/* FORM */}
//           <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm h-fit">
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               {ggEditing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}
//             </h2>
//             <form onSubmit={handleGgSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Mã (tự động thêm GG_) *</label>
//                 <input
//                   type="text"
//                   value={ggForm.Makhuyenmai}
//                   onChange={(e) => handleGgFormChange('Makhuyenmai', e.target.value)}
//                   disabled={!!ggEditing}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm disabled:bg-gray-100"
//                   placeholder="001"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Mã code hiển thị *</label>
//                 <input
//                   type="text"
//                   value={ggForm.Masp}
//                   onChange={(e) => handleGgFormChange('Masp', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="SUMMER50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Tên khuyến mãi</label>
//                 <input
//                   type="text"
//                   value={ggForm.mota}
//                   onChange={(e) => handleGgFormChange('mota', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="Khuyến mãi mùa hè"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị *</label>
//                 <input
//                   type="number"
//                   value={ggForm.giatrima}
//                   onChange={(e) => handleGgFormChange('giatrima', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                   placeholder="50000"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn</label>
//                 <input
//                   type="date"
//                   value={ggForm.thoihan}
//                   onChange={(e) => handleGgFormChange('thoihan', e.target.value)}
//                   className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm"
//                 />
//               </div>

//               <div className="flex gap-2 pt-4">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-gray-400"
//                 >
//                   {ggEditing ? 'Cập nhật' : 'Tạo'}
//                 </button>
//                 {ggEditing && (
//                   <button
//                     type="button"
//                     onClick={resetGgForm}
//                     className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                   >
//                     Hủy
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>

//           {/* TABLE */}
//           <div className="rounded-3xl border border-gray-200 bg-white shadow-theme-sm overflow-hidden">
//             <table className="min-w-full text-left text-sm text-gray-700">
//               <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-[0.2em]">
//                 <tr>
//                   <th className="px-4 py-3">Mã GG</th>
//                   <th className="px-4 py-3">Mã code</th>
//                   <th className="px-4 py-3">Giá trị</th>
//                   <th className="px-4 py-3">Thời hạn</th>
//                   <th className="px-4 py-3 text-center">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {maGiamGiaList.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="px-4 py-5 text-center text-gray-500">Chưa có mã giảm giá</td>
//                   </tr>
//                 ) : (
//                   maGiamGiaList.map((gg) => (
//                     <tr key={gg.Makhuyenmai} className="border-t border-gray-100 hover:bg-gray-50">
//                       <td className="px-4 py-3 font-medium">{gg.Makhuyenmai}</td>
//                       <td className="px-4 py-3">{gg.Masp}</td>
//                       <td className="px-4 py-3">{formatCurrency(gg.giatrima)}</td>
//                       <td className="px-4 py-3">{formatDate(gg.thoihan)}</td>
//                       <td className="px-4 py-3 text-center flex justify-center gap-2">
//                         <button
//                           onClick={() => handleGgEdit(gg)}
//                           className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
//                         >
//                           Sửa
//                         </button>
//                         <button
//                           onClick={() => handleGgDelete(gg.Makhuyenmai)}
//                           className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700"
//                         >
//                           Xóa
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { IDonHangQuanLy } from '@/types'; // Hoặc type phù hợp của bạn

// Định nghĩa Interface cho dữ liệu khuyến mãi gộp
interface IKhuyenMaiGop {
  id: string;
  target?: string;    // MaKH
  storeId?: string;   // MaCH
  prodId?: string;    // MaSP
  value: number;      // giatri hoặc giatrima
  date: string;       // thoihan
  desc: string;       // mota
  priority?: number;  // Uutien
}

const formatDate = (value?: string | Date) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '0';
  return Number(value).toLocaleString('vi-VN');
};

export default function KhuyenMaiPage() {
  const [activeTab, setActiveTab] = useState<'san-pham' | 'khach-hang'>('san-pham');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // FORM STATE DUY NHẤT
  const [form, setForm] = useState({
    id: '',
    target: '',
    storeId: '',
    prodId: '',
    value: '',
    date: '',
    desc: '',
    priority: '0'
  });

  const resetForm = () => {
    setForm({ id: '', target: '', storeId: '', prodId: '', value: '', date: '', desc: '', priority: '0' });
    setIsEditing(false);
  };

  // LOAD DỮ LIỆU
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/khuyen-mai?type=${activeTab}`);
      const json = await res.json();
      if (json.success) {
        setList(json.data || []);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resetForm();
    loadData();
  }, [activeTab]);

  // XỬ LÝ SUBMIT (TẠO/SỬA)
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const method = isEditing ? 'PUT' : 'POST';
//       const res = await fetch('/api/khuyen-mai', {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...form, type: activeTab })
//       });

//       const json = await res.json();
//       if (json.success) {
//         alert(isEditing ? 'Cập nhật thành công' : 'Tạo mới thành công');
//         resetForm();
//         loadData();
//       } else {
//         alert('Lỗi: ' + json.error);
//       }
//     } catch (error) {
//       alert('Lỗi kết nối server');
//     } finally {
//       setLoading(false);
//     }
//   };
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Phải đảm bảo logic chọn Method chính xác
        const method = isEditing ? 'PUT' : 'POST'; 
        
        const res = await fetch('/api/khuyen-mai', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: activeTab })
        });

        const json = await res.json();
        if (json.success) {
        alert(isEditing ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        resetForm();
        loadData();
        } else {
        // Nếu Backend trả về lỗi Primary Key, nó sẽ hiện ở đây
        alert('Lỗi: ' + json.error);
        }
    } catch (error) {
        alert('Lỗi kết nối');
    } finally {
        setLoading(false);
    }
    };
  // XỬ LÝ SỬA
  const handleEdit = (item: any) => {
    setIsEditing(true);
    setForm({
      id: item.Makhuyenmai || item.Makmkh,
      target: item.MaKH || '',
      storeId: item.MaCH || '',
      prodId: item.Masp || '',
      value: (item.giatrima || item.giatri || 0).toString(),
      date: item.thoihan ? new Date(item.thoihan).toISOString().split('T')[0] : '',
      desc: item.mota || '',
      priority: (item.Uutien || 0).toString()
    });
  };

  // XỬ LÝ XÓA
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      const res = await fetch(`/api/khuyen-mai?id=${id}&type=${activeTab}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      alert('Lỗi xóa dữ liệu');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Khuyến mãi & Voucher</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý chương trình ưu đãi trên toàn hệ thống ShopMatcha.</p>
      </div>

      {/* TABS ĐIỀU HƯỚNG */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('san-pham')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'san-pham' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Khuyến mãi Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('khach-hang')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'khach-hang' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Voucher Khách hàng
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* CỘT TRÁI: FORM NHẬP LIỆU[cite: 1] */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {isEditing ? 'Cập nhật thông tin' : 'Tạo chương trình mới'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Mã định danh (ID)</label>
                <input 
                  disabled={isEditing}
                  placeholder={activeTab === 'san-pham' ? "KMXXX" : "KMKHXXX"} 
                  value={form.id} 
                  onChange={e => setForm({...form, id: e.target.value})} 
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white outline-none focus:border-brand-500 transition-all disabled:opacity-50" 
                  required 
                />
              </div>

              {activeTab === 'san-pham' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Cửa hàng</label>
                    <input placeholder="CH001" value={form.storeId} onChange={e => setForm({...form, storeId: e.target.value})} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Sản phẩm</label>
                    <input placeholder="SP001" value={form.prodId} onChange={e => setForm({...form, prodId: e.target.value})} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Mã khách hàng (MaKH)</label>
                  <input placeholder="KH001" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Số tiền giảm</label>
                  <input type="number" placeholder="50000" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Ngày hết hạn</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Mô tả nội dung</label>
                <textarea rows={3} placeholder="Mô tả ngắn gọn chương trình..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="flex-1 bg-brand-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50">
                {isEditing ? 'Cập nhật' : 'Lưu dữ liệu'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-6 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold text-xs uppercase hover:bg-gray-200 transition-all">Hủy</button>
              )}
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH[cite: 1] */}
        <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm h-fit">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Danh sách hiện có</h3>
            <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Mã định danh</th>
                  <th className="px-6 py-4">{activeTab === 'san-pham' ? 'Phạm vi' : 'Khách nhận'}</th>
                  <th className="px-6 py-4">Giảm giá</th>
                  <th className="px-6 py-4">Hết hạn</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Không có dữ liệu hiển thị.</td></tr>
                ) : (
                  list.map((item: any) => (
                    <tr key={item.Makhuyenmai || item.Makmkh} className="group hover:bg-brand-50/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{item.Makhuyenmai || item.Makmkh}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">
                          {activeTab === 'san-pham' ? (
                            <span className="flex flex-col">
                              <span className="text-xs font-medium">{item.MaCH || 'Tất cả Shop'}</span>
                              <span className="text-[10px] text-gray-400">{item.Masp || 'Tất cả SP'}</span>
                            </span>
                          ) : (
                            <span className="font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg text-xs">{item.MaKH}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900">{formatCurrency(item.giatrima || item.giatri)}đ</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{formatDate(item.thoihan)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(item.Makhuyenmai || item.Makmkh)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}