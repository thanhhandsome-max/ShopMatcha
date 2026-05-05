import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TaoPhieuForm = dynamic(() => import('@/components/ecommerce/TaoPhieuForm'), { ssr: false });
const DanhSachPhieuForm = dynamic(() => import('@/components/ecommerce/DanhSachPhieuForm'), { ssr: false });

export default function TaoPhieuNhapXuatPage() {
  return (
    <div className="p-6 max-w-full">
      <h1 className="text-3xl font-bold mb-8">📦 Quản lý Phiếu Nhập / Xuất Kho</h1>
      
      {/* Tạo phiếu mới */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">➕ Tạo Phiếu Mới</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
            <TaoPhieuForm type="nhap" />
          </Suspense>
          <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
            <TaoPhieuForm type="xuat" />
          </Suspense>
        </div>
      </section>

      {/* Danh sách phiếu */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">📋 Danh Sách Phiếu</h2>
        <div className="grid grid-cols-1 gap-8">
          <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
            <DanhSachPhieuForm type="nhap" />
          </Suspense>
          <Suspense fallback={<div className="bg-white p-6 rounded-xl shadow animate-pulse">Đang tải...</div>}>
            <DanhSachPhieuForm type="xuat" />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
