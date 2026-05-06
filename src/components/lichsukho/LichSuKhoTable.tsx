'use client';

import { useEffect, useState } from 'react';
import { ILichSuKho } from '@/types';
import * as lichSuService from '@/services/lich-su-kho.service';

interface LichSuKhoTableProps {
  filter?: {
    type?: 'nhap' | 'xuat' | 'chuyen';
    kho?: string;
    sanpham?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export default function LichSuKhoTable({ filter }: LichSuKhoTableProps) {
  const [lichSu, setLichSu] = useState<ILichSuKho[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLichSu();
  }, [filter]);

  const loadLichSu = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: ILichSuKho[];

      if (filter?.type) {
        data = await lichSuService.getLichSuByType(filter.type);
      } else {
        data = await lichSuService.getAllLichSuKho();
      }

      // Áp dụng các filter khác
      if (filter?.kho) {
        data = data.filter(ls => ls.MaKho === filter.kho);
      }
      if (filter?.sanpham) {
        data = data.filter(ls => ls.MaSP === filter.sanpham);
      }

      setLichSu(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLoaiGiaoDichLabel = (loai: string) => {
    switch (loai) {
      case 'nhap':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">Nhập hàng</span>;
      case 'xuat':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">Xuất hàng</span>;
      case 'chuyen':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">Chuyển hàng</span>;
      default:
        return loai;
    }
  };

  const getTrangThaiLabel = (trangThai?: number) => {
    switch (trangThai) {
      case 0:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm">Chờ xác nhận</span>;
      case 1:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">Đã xác nhận</span>;
      case 2:
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">Hoàn thành</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">Không xác định</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Lỗi: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Mã LS</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Sản phẩm</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Loại giao dịch</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Số lượng</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Giá tiền</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Tổng tiền</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Mã phiếu</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Nhân viên</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Ngày tạo</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {lichSu.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-8 text-gray-500">
                Không có dữ liệu lịch sử
              </td>
            </tr>
          ) : (
            lichSu.map((ls) => (
              <tr key={ls.MaLS} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">{ls.MaLS}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div>
                    <div className="font-medium">{ls.TenSP}</div>
                    <div className="text-xs text-gray-500">{ls.MaCodeSp}</div>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getLoaiGiaoDichLabel(ls.LoaiGiaoDich)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                  {ls.SoLuong}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {ls.GiaTien ? `${ls.GiaTien?.toLocaleString('vi-VN')} ₫` : '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                  {ls.TongTien ? `${ls.TongTien?.toLocaleString('vi-VN')} ₫` : '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-blue-600 font-medium">
                  {ls.MaPhieu}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {ls.TenNhanVien || '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm">
                  {new Date(ls.NgayTao).toLocaleDateString('vi-VN')}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getTrangThaiLabel(ls.TrangThaiGiaoDich)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
