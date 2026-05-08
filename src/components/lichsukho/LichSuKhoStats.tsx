// 'use client';

// import { useEffect, useState } from 'react';
// import * as lichSuService from '@/services/lich-su-kho.service';

// interface LichSuKhoStatsProps {
//   filter?: any;
// }

// interface Stats {
//   totalNhap: number;
//   totalXuat: number;
//   totalChuyenNhan: number;
//   tongTienNhap: number;
//   tongTienXuat: number;
//   tongTienChuyenNhan: number;
// }

// export default function LichSuKhoStats({ filter }: LichSuKhoStatsProps) {
//   const [stats, setStats] = useState<Stats>({
//     totalNhap: 0,
//     totalXuat: 0,
//     totalChuyenNhan: 0,
//     tongTienNhap: 0,
//     tongTienXuat: 0,
//     tongTienChuyenNhan: 0,
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     loadStats();
//   }, [filter]);

//   const loadStats = async () => {
//     try {
//       setLoading(true);
//       const lichSu = await lichSuService.searchLichSu(filter || {});

//       const newStats: Stats = {
//         totalNhap: 0,
//         totalXuat: 0,
//         totalChuyenNhan: 0,
//         tongTienNhap: 0,
//         tongTienXuat: 0,
//         tongTienChuyenNhan: 0,
//       };

//       if (Array.isArray(lichSu)) {
//         lichSu.forEach((ls: any) => {
//           const loai = ls.LoaiBienDong?.toString().trim().toUpperCase();
//           const soLuong = parseInt(ls.SoLuong) || 0;
//           const tongTien = parseFloat(ls.TongTien) || 0;
//           const isHoanThanh = ls.TrangThaiGiaoDich === 1;

//           // Logic: Số lượng cộng tất cả, nhưng Tiền thì chỉ cộng nếu ĐÃ XÁC NHẬN
//           if (loai === 'NHẬP') {
//             newStats.totalNhap += soLuong;
//             if (isHoanThanh) newStats.tongTienNhap += tongTien;
//           } else if (loai === 'XUẤT') {
//             newStats.totalXuat += soLuong;
//             if (isHoanThanh) newStats.tongTienXuat += tongTien;
//           } else if (loai === 'CHUYỂN' || loai === 'NHẬN') {
//             newStats.totalChuyenNhan += soLuong;
//             if (isHoanThanh) newStats.tongTienChuyenNhan += tongTien;
//           }
//         });
//       }

//       setStats(newStats);
//     } catch (error) {
//       console.error('Lỗi tính toán thống kê:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const StatCard = ({ title, quantity, amount, color, icon }: { 
//     title: string; 
//     quantity: number; 
//     amount: number; 
//     color: 'blue' | 'orange' | 'purple';
//     icon: string;
//   }) => {
//     const themes = {
//       blue: 'bg-blue-50 border-blue-100 text-blue-700 shadow-blue-100',
//       orange: 'bg-orange-50 border-orange-100 text-orange-700 shadow-orange-100',
//       purple: 'bg-purple-50 border-purple-100 text-purple-700 shadow-purple-100',
//     };

//     return (
//       <div className={`border p-6 rounded-[32px] transition-all hover:shadow-xl shadow-md ${themes[color]}`}>
//         <div className="flex justify-between items-start mb-4">
//           <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</h4>
//           <span className="text-xl">{icon}</span>
//         </div>
        
//         <div className="space-y-4">
//           <div>
//             <p className="text-4xl font-black tracking-tighter">{quantity.toLocaleString()}</p>
//             <p className="text-[9px] font-bold uppercase opacity-50">Sản phẩm biến động</p>
//           </div>
          
//           <div className="pt-4 border-t border-current border-opacity-10">
//             <p className="text-lg font-black tracking-tight">
//               {amount.toLocaleString('vi-VN')} <span className="text-xs">₫</span>
//             </p>
//             <p className="text-[9px] font-bold uppercase opacity-50">Giá trị thực tế đã duyệt</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="h-48 bg-gray-100 rounded-[32px] animate-pulse"></div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//       <StatCard
//         title="Tổng Nhập Kho"
//         quantity={stats.totalNhap}
//         amount={stats.tongTienNhap}
//         color="blue"
//         icon="📥"
//       />
//       <StatCard
//         title="Tổng Xuất Kho"
//         quantity={stats.totalXuat}
//         amount={stats.tongTienXuat}
//         color="orange"
//         icon="📤"
//       />
//       <StatCard
//         title="Luân Chuyển Nội Bộ"
//         quantity={stats.totalChuyenNhan}
//         amount={stats.tongTienChuyenNhan}
//         color="purple"
//         icon="🚛"
//       />
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import * as lichSuService from '@/services/lich-su-kho.service';

interface LichSuKhoStatsProps {
  filter?: any;
}

interface Stats {
  totalNhap: number;
  totalXuat: number;
  totalChuyenNhan: number;
  tongTienNhap: number;
  tongTienXuat: number;
  tongTienChuyenNhan: number;
}

export default function LichSuKhoStats({ filter }: LichSuKhoStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalNhap: 0,
    totalXuat: 0,
    totalChuyenNhan: 0,
    tongTienNhap: 0,
    tongTienXuat: 0,
    tongTienChuyenNhan: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [filter]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Gọi service lấy toàn bộ lịch sử theo filter
      const lichSu = await lichSuService.searchLichSu(filter || {});

      const newStats: Stats = {
        totalNhap: 0,
        totalXuat: 0,
        totalChuyenNhan: 0,
        tongTienNhap: 0,
        tongTienXuat: 0,
        tongTienChuyenNhan: 0,
      };

      // if (Array.isArray(lichSu)) {
      //   lichSu.forEach((ls: any) => {
      //     // CHUẨN HÓA DỮ LIỆU ĐỂ SO SÁNH
      //     const loai = ls.LoaiBienDong?.toString().toUpperCase() || "";
      //     const soLuong = Number(ls.SoLuong) || 0;
      //     const tongTien = Number(ls.TongTien) || 0;
          
      //     // Trạng thái: Chấp nhận cả số 1 hoặc chuỗi "1"
      //     const isHoanThanh = ls.TrangThaiGiaoDich == 1;

      //     // 1. NHẬP KHO
      //     if (loai.includes('NHẬP') || loai.includes('NHAP')) {
      //       newStats.totalNhap += soLuong;
      //       if (isHoanThanh) newStats.tongTienNhap += tongTien;
      //     } 
      //     // 2. XUẤT KHO
      //     else if (loai.includes('XUẤT') || loai.includes('XUAT')) {
      //       newStats.totalXuat += soLuong;
      //       if (isHoanThanh) newStats.tongTienXuat += tongTien;
      //     } 
      //     // 3. CHUYỂN & NHẬN HÀNG
      //     else if (loai.includes('CHUYỂN') || loai.includes('CHUYEN') || loai.includes('NHẬN') || loai.includes('NHAN')) {
      //       newStats.totalChuyenNhan += soLuong;
      //       if (isHoanThanh) newStats.tongTienChuyenNhan += tongTien;
      //     }
      //   });
      // }
      if (Array.isArray(lichSu)) {
        lichSu.forEach((ls: any) => {
          // 1. Chuẩn hóa chuỗi: Bỏ dấu, viết hoa, xóa khoảng trắng để so sánh chính xác nhất
          const loaiRaw = ls.LoaiBienDong ? ls.LoaiBienDong.toString().trim().toUpperCase() : "";
          
          // Tạo bản không dấu để so sánh an toàn (Optional nhưng nên có)
          const loaiSafe = loaiRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          const soLuong = Number(ls.SoLuong) || 0;
          const tongTien = Number(ls.TongTien) || 0;
          
          // 2. So sánh trạng thái (Dùng == để chấp nhận cả "1" và 1)
          const isHoanThanh = ls.TrangThaiGiaoDich == 1;

          // 3. Phân loại logic dựa trên chuỗi gốc (loaiRaw) hoặc chuỗi không dấu (loaiSafe)
          if (loaiSafe.includes('NHAP')) {
            newStats.totalNhap += soLuong;
            if (isHoanThanh) newStats.tongTienNhap += tongTien;
          } 
          else if (loaiSafe.includes('XUAT')) {
            newStats.totalXuat += soLuong;
            if (isHoanThanh) newStats.tongTienXuat += tongTien;
          } 
          else if (loaiSafe.includes('CHUYEN') || loaiSafe.includes('NHAN')) {
            newStats.totalChuyenNhan += soLuong;
            if (isHoanThanh) newStats.tongTienChuyenNhan += tongTien;
          }
        });
      }

      setStats(newStats);
    } catch (error) {
      console.error('Lỗi tính toán thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

    
  
      

     

  // COMPONENT CON: CARD THỐNG KÊ
  const StatCard = ({ title, quantity, amount, color, icon }: { 
    title: string; 
    quantity: number; 
    amount: number; 
    color: 'blue' | 'orange' | 'purple';
    icon: string;
  }) => {
    const themes = {
      blue: 'bg-blue-50 border-blue-100 text-blue-700 shadow-blue-100/50',
      orange: 'bg-orange-50 border-orange-100 text-orange-700 shadow-orange-100/50',
      purple: 'bg-purple-50 border-purple-100 text-purple-700 shadow-purple-100/50',
    };

    return (
      <div className={`border p-6 rounded-[32px] transition-all hover:scale-[1.02] hover:shadow-2xl shadow-lg ${themes[color]}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</h4>
            <div className="h-1 w-8 bg-current opacity-20 rounded-full"></div>
          </div>
          <span className="text-2xl filter drop-shadow-sm">{icon}</span>
        </div>
        
        <div className="space-y-5">
          <div>
            <p className="text-4xl font-black tracking-tighter leading-none">
              {quantity.toLocaleString('vi-VN')}
            </p>
            <p className="text-[9px] font-bold uppercase opacity-50 mt-1 tracking-wider">Sản phẩm biến động</p>
          </div>
          
          <div className="pt-5 border-t border-current border-opacity-10 flex flex-col">
            <p className="text-xl font-black tracking-tight leading-none">
              {amount > 0 ? amount.toLocaleString('vi-VN') : '0'} 
              <span className="text-xs ml-1 font-bold">₫</span>
            </p>
            <p className="text-[9px] font-bold uppercase opacity-50 mt-1 tracking-wider">Giá trị thực tế đã duyệt</p>
          </div>
        </div>
      </div>
    );
  };

  // GIAO DIỆN KHI ĐANG LOAD
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-white border border-gray-100 rounded-[32px] p-6 space-y-4 shadow-sm">
             <div className="h-4 bg-gray-100 rounded-full w-1/3 animate-pulse"></div>
             <div className="h-12 bg-gray-50 rounded-2xl animate-pulse"></div>
             <div className="h-px bg-gray-100"></div>
             <div className="h-8 bg-gray-50 rounded-xl animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Tổng Nhập Kho"
        quantity={stats.totalNhap}
        amount={stats.tongTienNhap}
        color="blue"
        icon="📥"
      />
      <StatCard
        title="Tổng Xuất Kho"
        quantity={stats.totalXuat}
        amount={stats.tongTienXuat}
        color="orange"
        icon="📤"
      />
      <StatCard
        title="Luân Chuyển Nội Bộ"
        quantity={stats.totalChuyenNhan}
        amount={stats.tongTienChuyenNhan}
        color="purple"
        icon="🚛"
      />
    </div>
  );
}