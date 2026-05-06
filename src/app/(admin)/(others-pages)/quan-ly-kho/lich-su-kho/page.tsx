'use client';

import { useState } from 'react';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import LichSuKhoFilter from '@/components/lichsukho/LichSuKhoFilter';
import LichSuKhoStats from '@/components/lichsukho/LichSuKhoStats';
import LichSuKhoTable from '@/components/lichsukho/LichSuKhoTable';
import ComponentCard from '@/components/common/ComponentCard';

export default function LichSuKhoPage() {
  const [filter, setFilter] = useState<any>({});

  const handleFilterChange = (newFilter: any) => {
    setFilter(newFilter);
  };

  return (
    <>
      <PageBreadCrumb
        pageName="Lịch sử nhập/xuất/chuyển hàng"
        description="Xem chi tiết lịch sử tất cả giao dịch nhập, xuất, chuyển hàng"
      />

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Bộ lọc */}
        <ComponentCard title="Tìm kiếm và bộ lọc">
          <LichSuKhoFilter onFilterChange={handleFilterChange} />
        </ComponentCard>

        {/* Thống kê */}
        <ComponentCard title="Thống kê">
          <LichSuKhoStats filter={filter} />
        </ComponentCard>

        {/* Danh sách lịch sử */}
        <ComponentCard title="Danh sách lịch sử">
          <LichSuKhoTable filter={filter} />
        </ComponentCard>
      </div>
    </>
  );
}
