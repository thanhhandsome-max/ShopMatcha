'use client';

import { useEffect, useState } from 'react';
import { ILichSuKho } from '@/types';
import * as lichSuService from '@/services/lich-su-kho.service';

interface LichSuKhoStatsProps {
  filter?: {
    type?: 'nhap' | 'xuat' | 'chuyen';
    kho?: string;
    sanpham?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

interface Stats {
  totalNhap: number;
  totalXuat: number;
  totalChuyen: number;
  tongTienNhap: number;
  tongTienXuat: number;
  tongTienChuyen: number;
}

export default function LichSuKhoStats({ filter }: LichSuKhoStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalNhap: 0,
    totalXuat: 0,
    totalChuyen: 0,
    tongTienNhap: 0,
    tongTienXuat: 0,
    tongTienChuyen: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [filter]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const lichSu = await lichSuService.getAllLichSuKho();

      // Tính toán thống kê
      const newStats: Stats = {
        totalNhap: 0,
        totalXuat: 0,
        totalChuyen: 0,
        tongTienNhap: 0,
        tongTienXuat: 0,
        tongTienChuyen: 0,
      };

      lichSu.forEach((ls) => {
        if (ls.LoaiGiaoDich === 'nhap') {
          newStats.totalNhap += ls.SoLuong;
          newStats.tongTienNhap += ls.TongTien || 0;
        } else if (ls.LoaiGiaoDich === 'xuat') {
          newStats.totalXuat += ls.SoLuong;
          newStats.tongTienXuat += ls.TongTien || 0;
        } else if (ls.LoaiGiaoDich === 'chuyen') {
          newStats.totalChuyen += ls.SoLuong;
          newStats.tongTienChuyen += ls.TongTien || 0;
        }
      });

      setStats(newStats);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    quantity,
    amount,
    color,
  }: {
    title: string;
    quantity: number;
    amount: number;
    color: 'blue' | 'red' | 'green';
  }) => {
    const bgColor =
      color === 'blue'
        ? 'bg-blue-50 border-blue-200'
        : color === 'red'
          ? 'bg-red-50 border-red-200'
          : 'bg-green-50 border-green-200';

    const textColor =
      color === 'blue'
        ? 'text-blue-700'
        : color === 'red'
          ? 'text-red-700'
          : 'text-green-700';

    return (
      <div className={`border ${bgColor} p-4 rounded-lg`}>
        <h4 className="text-sm font-medium mb-2 text-gray-600">{title}</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className={`text-2xl font-bold ${textColor}`}>{quantity}</p>
            <p className="text-xs text-gray-500">Sản phẩm</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-semibold ${textColor}`}>
              {amount.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Nhập hàng"
        quantity={stats.totalNhap}
        amount={stats.tongTienNhap}
        color="blue"
      />
      <StatCard
        title="Xuất hàng"
        quantity={stats.totalXuat}
        amount={stats.tongTienXuat}
        color="red"
      />
      <StatCard
        title="Chuyển hàng"
        quantity={stats.totalChuyen}
        amount={stats.tongTienChuyen}
        color="green"
      />
    </div>
  );
}
