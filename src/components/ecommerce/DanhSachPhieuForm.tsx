// 'use client';

// import { useState, useEffect } from 'react';

// interface PhieuNhap {
//   MaPN: string;
//   MaNPP: string;
//   MaNV: string;
//   TongTien: number;
//   NgayTao: string;
//   TrangThai: number;
// }

// interface PhieuXuat {
//   MaPX: string;
//   MaNV: string;
//   MaCH: string;
//   TongTien: number;
//   NgayTao: string;
//   TrangThai: number;
// }

// export default function DanhSachPhieuForm({ type = 'nhap' }: { type: 'nhap' | 'xuat' }) {
//   const [phieu, setPhieu] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedPhieu, setSelectedPhieu] = useState<string | null>(null);
//   const [chitietVisible, setChitietVisible] = useState(false);
//   const [chitiet, setChitiet] = useState<any[]>([]);

//   useEffect(() => {
//     loadPhieu();
//   }, [type]);

//   const loadPhieu = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/phieu?type=${type}`);
//       const data = await res.json();
//       if (data.ok) {
//         setPhieu(Array.isArray(data.phieu) ? data.phieu : []);
//       } else {
//         setError(data.error || 'Không thể tải danh sách phiếu');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Lỗi không xác định');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadChitiet = async (maphieu: string) => {
//     try {
//       const res = await fetch(`/api/phieu?type=${type}&maphieu=${maphieu}&chitiet=true`);
//       const data = await res.json();
//       if (data.ok) {
//         setChitiet(Array.isArray(data.chitiet) ? data.chitiet : []);
//         setChitietVisible(true);
//       } else {
//         setError(data.error || 'Không thể tải chi tiết');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Lỗi không xác định');
//     }
//   };

//   const handleXoa = async (maphieu: string) => {
//     if (!window.confirm('Bạn chắc chắn muốn xóa phiếu này?')) return;
//     try {
//       const res = await fetch('/api/phieu', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ type, maphieu }),
//       });
//       const data = await res.json();
//       if (data.ok) {
//         loadPhieu();
//       } else {
//         setError(data.error || 'Xóa thất bại');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Lỗi không xác định');
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl p-6 shadow-theme-sm max-w-4xl mx-auto mt-8">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-lg font-semibold">{type === 'nhap' ? 'Danh sách phiếu nhập' : 'Danh sách phiếu xuất'}</h2>
//         <button onClick={loadPhieu} className="btn btn-primary" disabled={loading}>
//           {loading ? 'Đang tải...' : 'Tải lại'}
//         </button>
//       </div>

//       {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

//       {phieu.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           Không có phiếu {type === 'nhap' ? 'nhập' : 'xuất'} nào
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="border border-gray-200 px-4 py-2 text-left">Mã phiếu</th>
//                 <th className="border border-gray-200 px-4 py-2 text-left">Ngày tạo</th>
//                 <th className="border border-gray-200 px-4 py-2 text-left">Tổng tiền</th>
//                 <th className="border border-gray-200 px-4 py-2 text-left">Trạng thái</th>
//                 <th className="border border-gray-200 px-4 py-2 text-center">Hành động</th>
//               </tr>
//             </thead>
//             <tbody>
//               {phieu.map((p: any) => (
//                 <tr key={p[type === 'nhap' ? 'MaPN' : 'MaPX']} className="hover:bg-gray-50">
//                   <td className="border border-gray-200 px-4 py-2 font-medium">{p[type === 'nhap' ? 'MaPN' : 'MaPX']}</td>
//                   <td className="border border-gray-200 px-4 py-2">{new Date(p.NgayTao).toLocaleDateString('vi-VN')}</td>
//                   <td className="border border-gray-200 px-4 py-2">{p.TongTien?.toLocaleString('vi-VN')} ₫</td>
//                   <td className="border border-gray-200 px-4 py-2">
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.TrangThai === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                       {p.TrangThai === 1 ? 'Hoàn thành' : 'Chưa hoàn thành'}
//                     </span>
//                   </td>
//                   <td className="border border-gray-200 px-4 py-2 text-center">
//                     <button
//                       onClick={() => {
//                         setSelectedPhieu(p[type === 'nhap' ? 'MaPN' : 'MaPX']);
//                         loadChitiet(p[type === 'nhap' ? 'MaPN' : 'MaPX']);
//                       }}
//                       className="btn btn-sm btn-info mr-2"
//                     >
//                       Chi tiết
//                     </button>
//                     <button onClick={() => handleXoa(p[type === 'nhap' ? 'MaPN' : 'MaPX'])} className="btn btn-sm btn-danger">
//                       Xóa
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {chitietVisible && selectedPhieu && (
//         <div className="mt-8 border-t pt-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Chi tiết phiếu: {selectedPhieu}</h3>
//             <button onClick={() => setChitietVisible(false)} className="text-gray-500 hover:text-gray-700">
//               ✕
//             </button>
//           </div>
//           {chitiet.length === 0 ? (
//             <div className="text-center py-4 text-gray-500">Không có chi tiết sản phẩm</div>
//           ) : (
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="border border-gray-200 px-4 py-2 text-left">Mã sản phẩm</th>
//                   <th className="border border-gray-200 px-4 py-2 text-left">Số lượng</th>
//                   {type === 'nhap' && <th className="border border-gray-200 px-4 py-2 text-left">Tổng tiền</th>}
//                 </tr>
//               </thead>
//               <tbody>
//                 {chitiet.map((ct: any, idx: number) => (
//                   <tr key={idx}>
//                     <td className="border border-gray-200 px-4 py-2">{ct.MaSP}</td>
//                     <td className="border border-gray-200 px-4 py-2">{ct.SoLuong}</td>
//                     {type === 'nhap' && <td className="border border-gray-200 px-4 py-2">{ct.TongTien?.toLocaleString('vi-VN')} ₫</td>}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';

interface DanhSachPhieuProps {
  type: 'nhap' | 'xuat' | 'chuyen';
}

export default function DanhSachPhieuForm({ type = 'nhap' }: DanhSachPhieuProps) {
  const [phieu, setPhieu] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhieu, setSelectedPhieu] = useState<string | null>(null);
  const [chitietVisible, setChitietVisible] = useState(false);
  const [chitiet, setChitiet] = useState<any[]>([]);

  // Xác định tên cột ID và màu sắc chủ đạo dựa trên loại phiếu
  const config = {
    nhap: { id: 'MaPN', label: 'Phiếu Nhập', color: 'blue' },
    xuat: { id: 'MaPX', label: 'Phiếu Xuất', color: 'orange' },
    chuyen: { id: 'MaPC', label: 'Phiếu Chuyển', color: 'purple' }
  }[type];

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
        setError(data.error || 'Không thể tải danh sách');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const loadChitiet = async (id: string) => {
    try {
      const res = await fetch(`/api/phieu?type=${type}&maphieu=${id}&chitiet=true`);
      const data = await res.json();
      if (data.ok) {
        setChitiet(Array.isArray(data.chitiet) ? data.chitiet : []);
        setChitietVisible(true);
      } else {
        alert(data.error || 'Không thể tải chi tiết');
      }
    } catch (err: any) {
      alert('Lỗi tải chi tiết sản phẩm');
    }
  };

  const handleXoa = async (id: string) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa ${config.label} này?`)) return;
    try {
      const res = await fetch('/api/phieu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, maphieu: id }),
      });
      const data = await res.json();
      if (data.ok) {
        loadPhieu();
        if (selectedPhieu === id) setChitietVisible(false);
      } else {
        setError(data.error || 'Xóa thất bại');
      }
    } catch (err: any) {
      setError('Lỗi khi thực hiện xóa');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header của bảng */}
      <div className={`p-4 border-b flex justify-between items-center bg-${config.color}-50/30`}>
        <h3 className={`font-bold text-${config.color}-700 uppercase text-sm tracking-wider`}>
          {config.label}
        </h3>
        <button 
          onClick={loadPhieu} 
          className="text-xs bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
          disabled={loading}
        >
          {loading ? '⏳...' : '🔄 Tải lại'}
        </button>
      </div>

      {error && <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Danh sách phiếu chính */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Mã Phiếu</th>
              <th className="px-4 py-3 text-left">Ngày Tạo</th>
              {type === 'nhap' && <th className="px-4 py-3 text-left">Nhà PP</th>}
              {type === 'xuat' && <th className="px-4 py-3 text-left">Cửa Hàng</th>}
              {type === 'chuyen' && <th className="px-4 py-3 text-left">Lộ Trình</th>}
              <th className="px-4 py-3 text-left">Giá Trị/TT</th>
              <th className="px-4 py-3 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {phieu.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Chưa có dữ liệu {config.label}</td>
              </tr>
            ) : (
              phieu.map((p: any) => {
                const currentId = p[config.id]; // Fix lỗi Key tại đây
                return (
                  <tr key={currentId} className={`hover:bg-gray-50 transition-colors ${selectedPhieu === currentId ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-gray-900">{currentId}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.NgayTao ? new Date(p.NgayTao).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    
                    {/* Cột động theo loại phiếu */}
                    <td className="px-4 py-3 text-gray-600">
                      {type === 'nhap' && (p.MaNPP || '---')}
                      {type === 'xuat' && (p.MaCH || '---')}
                      {type === 'chuyen' && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-red-600">{p.MaCH_Xuat}</span>
                          <span>➔</span>
                          <span className="font-medium text-green-600">{p.MaCH_Nhan}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">
                        {type === 'chuyen' ? 'Nội bộ' : `${p.TongTien?.toLocaleString('vi-VN')} ₫`}
                      </div>
                      <span className={`text-[10px] uppercase font-bold ${p.TrangThai === 1 ? 'text-green-500' : 'text-orange-500'}`}>
                        {p.TrangThai === 1 ? '● Hoàn thành' : '● Chờ xử lý'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPhieu(currentId);
                            loadChitiet(currentId);
                          }}
                          className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleXoa(currentId)} 
                          className="p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-colors"
                          title="Xóa phiếu"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Khu vực hiển thị chi tiết sản phẩm phía dưới */}
      {chitietVisible && selectedPhieu && (
        <div className={`m-4 p-4 rounded-xl border-2 border-dashed bg-gray-50 border-${config.color}-200`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800">📦 Chi tiết sản phẩm: {selectedPhieu}</h4>
            <button onClick={() => setChitietVisible(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>
          
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 text-left">Mã Sản Phẩm</th>
                <th className="py-2 text-center">Số Lượng</th>
                {type === 'nhap' && <th className="py-2 text-right">Thành Tiền</th>}
              </tr>
            </thead>
            <tbody>
              {chitiet.map((ct: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium">{ct.MaSP}</td>
                  <td className="py-2 text-center">{ct.SoLuong}</td>
                  {type === 'nhap' && (
                    <td className="py-2 text-right text-green-600 font-semibold">
                      {ct.TongTien?.toLocaleString('vi-VN')} ₫
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}