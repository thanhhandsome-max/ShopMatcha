// 'use client';
// import dynamic from 'next/dynamic';
// import { Suspense } from 'react';

// const TaoPhieuForm = dynamic(() => import('@/components/ecommerce/TaoPhieuForm'), { ssr: false });
// const DanhSachPhieuForm = dynamic(() => import('@/components/ecommerce/DanhSachPhieuForm'), { ssr: false });

// export default function TaoPhieuNhapXuatPage() {
//   return (
//     <div className="p-6 max-w-full">
//       <h1 className="text-3xl font-bold mb-8">📦 Quản lý Phiếu Nhập / Xuất Kho</h1>
      
//       {/* Tạo phiếu mới */}
//       <section className="mb-12">
//         <h2 className="text-2xl font-semibold mb-6 text-gray-800">➕ Tạo Phiếu Mới</h2>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
//             <TaoPhieuForm type="nhap" />
//           </Suspense>
//           <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
//             <TaoPhieuForm type="xuat" />
//           </Suspense>
//         </div>
//       </section>

//       {/* Danh sách phiếu */}
//       <section>
//         <h2 className="text-2xl font-semibold mb-6 text-gray-800">📋 Danh Sách Phiếu</h2>
//         <div className="grid grid-cols-1 gap-8">
//           <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
//             <DanhSachPhieuForm type="nhap" />
//           </Suspense>
//           <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
//             <DanhSachPhieuForm type="xuat" />
//           </Suspense>
//         </div>
//       </section>
//     </div>
//   );
// }
'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import các component form với chế độ không render ở server để tránh lỗi hydration
const TaoPhieuForm = dynamic(() => import('@/components/ecommerce/TaoPhieuForm'), { ssr: false });
const DanhSachPhieuForm = dynamic(() => import('@/components/ecommerce/DanhSachPhieuForm'), { ssr: false });

export default function TaoPhieuNhapXuatPage() {
  return (
    <div className="p-6 max-w-full bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
        📦 Hệ thống Quản lý Kho ShopMatcha
      </h1>
      
      {/* 1. KHU VỰC TẠO PHIẾU MỚI */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded-lg">➕</span> Tạo Phiếu Mới
          </h2>
        </div>
        
        {/* Điều chỉnh sang 3 cột trên màn hình lớn để đủ chỗ cho Phiếu Chuyển */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Suspense fallback={<LoadingCard title="Phiếu Nhập" />}>
            <TaoPhieuForm type="nhap" />
          </Suspense>

          <Suspense fallback={<LoadingCard title="Phiếu Xuất" />}>
            <TaoPhieuForm type="xuat" />
          </Suspense>

          <Suspense fallback={<LoadingCard title="Phiếu Chuyển" />}>
            <TaoPhieuForm type="chuyen" />
          </Suspense>
        </div>
      </section>

      {/* 2. KHU VỰC DANH SÁCH PHIẾU */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <span className="bg-green-600 text-white p-1 rounded-lg">📋</span> Nhật Ký Kho Hàng
        </h2>
        
        <div className="space-y-12">
          <Suspense fallback={<LoadingList />}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-blue-700 border-b pb-2">Danh Sách Phiếu Nhập Hàng</h3>
              <DanhSachPhieuForm type="nhap" />
            </div>
          </Suspense>

          <Suspense fallback={<LoadingList />}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-orange-700 border-b pb-2">Danh Sách Phiếu Xuất Hàng</h3>
              <DanhSachPhieuForm type="xuat" />
            </div>
          </Suspense>

          <Suspense fallback={<LoadingList />}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-purple-700 border-b pb-2">Danh Sách Phiếu Chuyển Hàng (Nội bộ)</h3>
              <DanhSachPhieuForm type="chuyen" />
            </div>
          </Suspense>
        </div>
      </section>
    </div>
  );
}

// Các component hiển thị trạng thái đang tải (Loading States)
function LoadingCard({ title }: { title: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-100 rounded w-full"></div>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
        <div className="h-24 bg-gray-100 rounded w-full"></div>
      </div>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
}