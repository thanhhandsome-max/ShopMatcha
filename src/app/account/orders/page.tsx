"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBackendApiBase, getAuthHeadersJson } from "@/lib/backendApi";
import { formatMoneyVND } from "@/store/useCart";
import Link from "next/link";
import { ChevronRight, Filter, Package, ArrowLeft } from "lucide-react";

type OrderLine = {
  MaSP: string;
  TenSP?: string;
  SoLuong: number;
  DonGia: number;
  image?: string;
  sanpham?: {
    TenSP?: string;
    sanpham_anh?: Array<{
      DuongDanAnh?: string;
      Anh?: string;
    }>;
  };
};

type Order = {
  MaDH: string;
  order_code?: string;
  TongTien: number;
  NgayTao: string;
  TrangThai?: number;
  payment_status?: number;
  payment_method?: string;
  chitietdonhang?: OrderLine[];
};

type OrderFilter = "all" | "pending_payment" | "waiting_shipping" | "waiting_receive" | "need_review" | "return";

const FILTERS: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Tất cả đơn" },
  { value: "pending_payment", label: "Chờ thanh toán" },
  { value: "waiting_shipping", label: "Chờ vận chuyển" },
  { value: "waiting_receive", label: "Chờ nhận" },
  { value: "need_review", label: "Cần đánh giá" },
  { value: "return", label: "Trả hàng" }
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("all");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${getBackendApiBase()}/orders?page=1&limit=50`, {
          headers: getAuthHeadersJson()
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Không tải được lịch sử đơn");
          setOrders([]);
        } else {
          if (mounted) setOrders(data.data.orders || []);
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  function statusLabel(t?: number) {
    switch (t) {
      case 1:
        return "Đang xử lý";
      case 2:
        return "Đã xác nhận";
      case 3:
        return "Đã giao";
      case 4:
        return "Đã hủy";
      default:
        return "Chờ xử lý";
    }
  }

  function statusBadgeColor(t?: number) {
    switch (t) {
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-green-100 text-green-800";
      case 4:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function orderFilter(order: Order): OrderFilter {
    const method = String(order.payment_method || '').toLowerCase();
    const isCOD = method === 'cod' || method.includes('cod');
    const isPaid = Number(order.payment_status) === 1;

    if (order.TrangThai === 4) return "return";
    if (!isCOD && Number(order.payment_status) === 0) return "pending_payment";
    if ((isPaid || isCOD) && Number(order.TrangThai) === 1) return "waiting_shipping";
    if ((isPaid || isCOD) && Number(order.TrangThai) === 2) return "waiting_receive";
    if ((isPaid || isCOD) && Number(order.TrangThai) === 3) return "need_review";
    return "all";
  }

  function filterMeta(filter: OrderFilter) {
    switch (filter) {
      case "pending_payment":
        return { label: "Chờ thanh toán", badge: "bg-amber-100 text-amber-800" };
      case "waiting_shipping":
        return { label: "Chờ vận chuyển", badge: "bg-blue-100 text-blue-800" };
      case "waiting_receive":
        return { label: "Chờ nhận", badge: "bg-sky-100 text-sky-800" };
      case "need_review":
        return { label: "Cần đánh giá", badge: "bg-green-100 text-green-800" };
      case "return":
        return { label: "Trả hàng", badge: "bg-red-100 text-red-800" };
      default:
        return { label: "Tất cả đơn", badge: "bg-gray-100 text-gray-800" };
    }
  }

  const filteredOrders = selectedFilter === "all"
    ? orders
    : orders.filter((order) => orderFilter(order) === selectedFilter);

  function resolveLineName(line: OrderLine) {
    return line.TenSP || line.sanpham?.TenSP || line.MaSP;
  }

  function resolveLineImage(line: OrderLine) {
    const raw =
      line.image ||
      line.sanpham?.sanpham_anh?.[0]?.DuongDanAnh ||
      line.sanpham?.sanpham_anh?.[0]?.Anh ||
      "";

    const v = String(raw || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v) || v.startsWith("/") || v.startsWith("data:")) return v;
    return `/images/products/${v}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f9ef] via-[#f8fcf5] to-white">
      {/* Header Section */}
      <div className="bg-[#f3f8ee] border-b border-[#dbe8cf]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-[#2D5016]" />
              <h1 className="text-3xl font-bold text-[#23461a]">Lịch sử đơn hàng</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/90 border border-[#d4e2c6] text-[#3f5336] text-sm rounded-xl hover:bg-[#f4f9ef] transition-colors"
              >
                <ArrowLeft size={16} /> Thoát
              </button>
            </div>
          </div>
          <p className="text-[#5f7450] ml-11">Xem và quản lý tất cả đơn hàng của bạn</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Menu */}
        <div className="bg-[#f8fcf5] border border-[#dbe8cf] rounded-3xl shadow-[0_6px_20px_rgba(59,130,80,0.08)] p-5 mb-6">
          <div className="flex items-center gap-2 mb-4 text-[#436035] font-medium">
            <Filter size={18} className="text-[#2D5016]" />
            <span>Lọc đơn hàng</span>
            <span className={`ml-auto text-xs px-2 py-1 rounded-full ${filterMeta(selectedFilter).badge}`}>
              {filterMeta(selectedFilter).label}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                    active
                      ? "bg-[#5f7f46] text-white border-[#5f7f46] shadow-sm"
                      : "bg-white/90 text-[#3f5336] border-[#d4e2c6] hover:border-[#8cab70] hover:text-[#4d6a38]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2D5016] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && !error && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
            <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-[#5f7f46] text-white rounded-xl hover:bg-[#4f6b3b] transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && filteredOrders.length === 0 && !error && (
          <div className="text-center py-16 bg-[#f8fcf5] border border-[#dbe8cf] rounded-3xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có đơn hàng nào trong mục này</p>
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className="inline-block mt-4 px-6 py-2 bg-[#5f7f46] text-white rounded-xl hover:bg-[#4f6b3b] transition-colors"
            >
              Xem tất cả đơn
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((o) => {
              const derivedFilter = orderFilter(o);
              const derivedMeta = filterMeta(derivedFilter);
              return (
              <div key={o.MaDH} className="bg-white/95 border border-[#dbe8cf] rounded-2xl transform transition-all duration-300 hover:shadow-[0_8px_24px_rgba(70,120,70,0.12)] hover:scale-[1.01] overflow-hidden">
                {/* Order Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-[#e3edd9]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Mã đơn hàng</p>
                      <p className="text-lg font-bold text-gray-900">{o.order_code || o.MaDH}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Ngày đặt</p>
                      <p className="text-lg font-semibold text-gray-900">{new Date(o.NgayTao).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="flex items-end justify-between sm:justify-start gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Tổng tiền</p>
                        <p className="text-2xl font-bold text-[#466a34]">{formatMoneyVND(o.TongTien)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${derivedMeta.badge}`}>
                        {derivedMeta.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {o.chitietdonhang && o.chitietdonhang.length > 0 && (
                  <div className="px-4 sm:px-6 py-4">
                    <div className="grid grid-cols-1 gap-3">
                      {o.chitietdonhang.slice(0, 3).map((l) => (
                        <div key={l.MaSP} className="flex gap-4">
                          <div className="w-16 h-16 bg-[#eef5e8] rounded-xl flex-shrink-0 overflow-hidden border border-[#dfe9d3]">
                            {resolveLineImage(l) ? (
                              <img src={resolveLineImage(l)} alt={resolveLineName(l)} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#e4efda]">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{resolveLineName(l)}</p>
                            <p className="text-sm text-gray-600">Số lượng: <span className="font-semibold">{l.SoLuong}</span></p>
                            <p className="text-sm text-[#4d6a38] font-semibold">{formatMoneyVND(l.DonGia)}/cái</p>
                          </div>
                        </div>
                      ))}
                      {o.chitietdonhang.length > 3 && (
                        <p className="text-sm text-gray-500 ml-20">+{o.chitietdonhang.length - 3} sản phẩm khác</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Footer */}
                <div className="px-4 sm:px-6 py-4 bg-[#f4f9ef] border-t border-[#e1ebd7] flex justify-between items-center">
                  <p className="text-sm text-gray-600">Thời gian đặt: {new Date(o.NgayTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                  <Link
                    href={`/order-confirmation?orderId=${encodeURIComponent(o.MaDH)}&status=detail`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5f7f46] text-white rounded-xl hover:bg-[#4f6b3b] transition-colors font-medium text-sm"
                  >
                    Xem chi tiết
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
