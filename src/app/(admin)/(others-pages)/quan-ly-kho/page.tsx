import Link from 'next/link';
import {
  getInventoryView,
  InventoryLocation,
  InventoryLocationType,
  listInventoryByWarehouse,
} from '@/services/inventory.service';

type InventoryPageProps = {
  searchParams?: {
    type?: string;
    location?: string;
  };
};

const locationTypeOptions: Array<{ key: InventoryLocationType; label: string }> = [
  { key: 'warehouse', label: 'Kho' },
  { key: 'store', label: 'Cửa hàng' },
];

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const selectedType = params?.type === 'store' ? 'store' : 'warehouse';
  const selectedLocation = params?.location || '';

  let locations: InventoryLocation[] = [];
  let errorMessage: string | null = null;

  // try {
  //   locations = await getInventoryView({
  //     type: selectedType,
  //     locationId: selectedLocation,
  //   });
  // } catch (err) {
  //   console.error('Lỗi tải tồn kho:', err);
  //   errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi tải tồn kho';
  // }
  try {
    // 1. Gọi hàm lấy dữ liệu
    // Lưu ý: Đảm bảo listInventoryByWarehouse đã được import
    locations = await getInventoryView({ 
      type: selectedType, 
      locationId: selectedLocation 
    });
  } catch (error) {
    console.error("Lỗi tải tồn kho:", error);
    errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
  }
  const filteredLocations = selectedLocation
    ? locations.filter((location) => location.id === selectedLocation)
    : locations;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý kho / cửa hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem tồn kho theo từng kho hoặc cửa hàng. Chọn loại và vị trí để phân tích chi tiết.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {locationTypeOptions.map((item) => (
          <Link
            key={item.key}
            href={`/quan-ly-kho?type=${item.key}`}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedType === item.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {errorMessage ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-theme-sm p-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Không thể tải tồn kho</h2>
          <p className="text-sm text-gray-500 mb-5 max-w-xl mx-auto">
            Hệ thống hiện không thể kết nối tới cơ sở dữ liệu. Vui lòng kiểm tra lại cấu hình DB hoặc thử lại sau.
          </p>
          <div className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
            {errorMessage}
          </div>
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-theme-sm border border-gray-200 p-6 text-gray-500">
          <p className="font-medium text-gray-800 mb-2">Không tìm thấy dữ liệu {selectedType === 'store' ? 'cửa hàng' : 'kho'}.</p>
          <p>
            Hãy kiểm tra lại cấu hình cơ sở dữ liệu hoặc đảm bảo bảng tồn kho đã được đồng bộ.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/quan-ly-kho?type=${selectedType}&location=${location.id}`}
                className={`rounded-2xl border p-4 transition hover:border-brand-300 hover:bg-brand-50 ${
                  selectedLocation === location.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-brand-600">{location.type === 'warehouse' ? 'Kho' : 'Cửa hàng'}</p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">{location.name}</h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    {location.inventory.length} sản phẩm
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-500">{location.location ?? 'Không có địa chỉ'}</p>
                <p className="mt-1 text-sm text-gray-500">{location.phone ?? 'Không có số điện thoại'}</p>
              </Link>
            ))}
          </div>

          {filteredLocations.map((location) => (
            <div key={location.id} className="bg-white rounded-xl shadow-theme-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{location.name}</h2>
                    <p className="text-sm text-gray-500">
                      {location.type === 'warehouse' ? 'Kho' : 'Cửa hàng'} • {location.location ?? 'Không có địa chỉ'} • {location.phone ?? 'Không có điện thoại'}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-medium">
                    {location.inventory.length} sản phẩm
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-3">Mã SP</th>
                      <th className="px-6 py-3">Tên sản phẩm</th>
                      <th className="px-6 py-3">Mã code</th>
                      <th className="px-6 py-3">Số lượng</th>
                      <th className="px-6 py-3">Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {location.inventory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-5 text-center text-gray-500">
                          Chưa có sản phẩm tồn kho cho địa điểm này.
                        </td>
                      </tr>
                    ) : (
                      location.inventory.map((item) => (
                        <tr key={`${location.id}-${item.productId}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{item.productId}</td>
                          <td className="px-6 py-4">{item.productName ?? 'Không có tên'}</td>
                          <td className="px-6 py-4">{item.productCode ?? '—'}</td>
                          <td className="px-6 py-4">{item.quantity.toLocaleString('vi-VN')}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {item.lastUpdated
                              ? new Date(item.lastUpdated).toLocaleString('vi-VN', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
