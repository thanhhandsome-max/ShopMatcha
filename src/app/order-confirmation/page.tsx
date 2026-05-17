'use client';

import { getBackendApiBase } from '@/lib/backendApi';
import { useCart } from '@/store/useCart';
import { Check, Loader2, Mail, Package, Truck, CircleAlert, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type FlowStatus = 'pending_payment' | 'waiting_shipping' | 'waiting_receive' | 'need_review' | 'return';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const clearCart = useCart((state) => state.clear);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnReasonError, setReturnReasonError] = useState('');

  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  const isPaidOrder = Number(orderData?.payment_status) === 1;

  function normalizeImagePath(value?: string) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `/images/products/${trimmed}`;
  }

  function formatVND(value?: number) {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  }

  function deriveFlowStatus(order: any): FlowStatus {
    const method = String(order?.payment_method || '').toLowerCase();
    const isCOD = method === 'cod' || method.includes('cod');
    const isDraftVNPay = Number(order?.order_type) === 2 && Number(order?.payment_status) === 0;

    if (Number(order?.TrangThai) === 4 || Number(order?.payment_status) === 3) return 'return';
    if (isDraftVNPay) return 'pending_payment';
    if (!isCOD && Number(order?.payment_status) === 0) return 'pending_payment';
    if (Number(order?.TrangThai) === 1) return 'waiting_shipping';
    if (Number(order?.TrangThai) === 2) return 'waiting_receive';
    if (Number(order?.TrangThai) === 3) return 'need_review';
    return 'pending_payment';
  }

  function statusMeta(key: FlowStatus) {
    switch (key) {
      case 'pending_payment':
        return { label: 'Chờ thanh toán', badge: 'bg-amber-100 text-amber-800' };
      case 'waiting_shipping':
        return { label: 'Chờ vận chuyển', badge: 'bg-blue-100 text-blue-800' };
      case 'waiting_receive':
        return { label: 'Chờ nhận', badge: 'bg-sky-100 text-sky-800' };
      case 'need_review':
        return { label: 'Cần đánh giá', badge: 'bg-green-100 text-green-800' };
      case 'return':
        return { label: 'Trả hàng', badge: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Chờ thanh toán', badge: 'bg-amber-100 text-amber-800' };
    }
  }

  function paymentStatusLabel(v?: number) {
    if (Number(v) === 1) return 'Đã thanh toán';
    if (Number(v) === 3) return 'Đã hủy';
    return 'Chưa thanh toán';
  }

  function paymentMethodLabel(v?: string) {
    const method = String(v || '').toLowerCase();
    if (method === 'vnpay') return 'VNPay';
    if (method === 'cod') return 'Thanh toán khi nhận hàng';
    if (method.includes('bank')) return 'Chuyển khoản';
    return v || 'Không xác định';
  }

  useEffect(() => {
    if (!orderId) {
      setError('Thiếu mã đơn hàng');
      setLoading(false);
      return;
    }

    fetch(`${getBackendApiBase()}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('htdcha-token') || ''}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrderData(data.data);
          if (Number(data.data?.payment_status) === 1) {
            void clearCart({ remote: true });
          }
        } else {
          setError(data.message || 'Không tìm thấy đơn hàng');
        }
      })
      .catch((err) => {
        console.error('Fetch order error:', err);
        setError('Lỗi kết nối server');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleConfirmReturn() {
    if (!orderId) return;
    if (!returnReason.trim()) {
      setReturnReasonError('Vui lòng nhập lý do trả hàng');
      return;
    }

    setReturnReasonError('');
    setSubmittingReturn(true);
    try {
      const res = await fetch(`${getBackendApiBase()}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('htdcha-token') || ''}`
        },
        body: JSON.stringify({ TrangThai: 4, reason: returnReason })
      });
      const data = await res.json();
      if (data.success) {
        setOrderData((prev: any) => (prev ? { ...prev, TrangThai: 4, payment_status: 3 } : prev));
        setShowReturnModal(false);
        setReturnReason('');
      } else {
        setError(data.message || 'Không thể gửi yêu cầu trả hàng');
      }
    } catch (err) {
      console.error('Return request error:', err);
      setError('Lỗi kết nối server');
    } finally {
      setSubmittingReturn(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2D5016] mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold tracking-[0.15em] text-[#2D5016] font-serif">HTDCHA</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <CircleAlert className="text-red-600" size={40} strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Không thể hiển thị đơn hàng</h1>
            <p className="text-gray-600">{error || message || 'Đã xảy ra lỗi khi tải dữ liệu từ hệ thống'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại đơn hàng của bạn trong lịch sử mua hàng.</p>
            <div className="space-y-3">
              <Link
                href="/account/orders"
                className="block w-full bg-[#2D5016] text-white py-3 rounded-lg hover:bg-[#3a6b1e] transition font-medium uppercase tracking-wider"
              >
                Quay về lịch sử đơn hàng
              </Link>
              <Link
                href="/"
                className="block w-full border border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition font-medium uppercase tracking-wider"
              >
                Quay về trang chính
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentFlow = deriveFlowStatus(orderData);
  const currentMeta = statusMeta(currentFlow);
  const isDraftVNPayOrder = Number(orderData?.order_type) === 2 && Number(orderData?.payment_status) === 0;
  const steps: Array<{ key: FlowStatus; title: string; hint: string; icon: 'mail' | 'package' | 'truck' | 'check' | 'return' }> = [
    { key: 'pending_payment', title: 'Chờ thanh toán', hint: 'Đơn hàng đang chờ xác nhận thanh toán', icon: 'mail' },
    { key: 'waiting_shipping', title: 'Chờ vận chuyển', hint: 'Đơn hàng đang được chuẩn bị', icon: 'package' },
    { key: 'waiting_receive', title: 'Chờ nhận', hint: 'Đơn hàng đã bàn giao cho đơn vị vận chuyển', icon: 'truck' },
    { key: 'need_review', title: 'Cần đánh giá', hint: 'Đơn hàng đã hoàn tất, bạn có thể đánh giá sản phẩm', icon: 'check' },
    { key: 'return', title: 'Trả hàng', hint: 'Đơn hàng đã hủy hoặc có yêu cầu trả hàng', icon: 'return' }
  ];
  const currentIndex = steps.findIndex((s) => s.key === currentFlow);

  const customerName =
    orderData?.khachhang?.HoTen ||
    orderData?.khachhang?.TenKH ||
    orderData?.khachhang?.Ten ||
    'Khách hàng';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f8ee] to-[#f8fcf5]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#2D5016] font-serif">HTDCHA</h1>
        </div>
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Yêu cầu trả hàng</h3>
              <p className="text-sm text-gray-600 mb-4">Vui lòng cho biết lý do bạn muốn trả hàng. Chúng tôi sẽ liên hệ lại để xác nhận.</p>
              <textarea
                value={returnReason}
                onChange={(e) => {
                  setReturnReason(e.target.value);
                  if (returnReasonError) setReturnReasonError('');
                }}
                rows={4}
                className="w-full border border-gray-200 rounded-md p-3 mb-4"
                placeholder="Lý do trả hàng..."
              />
              {returnReasonError && (
                <p className="-mt-2 mb-4 text-sm text-red-600">{returnReasonError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowReturnModal(false); setReturnReason(''); setReturnReasonError(''); }}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleConfirmReturn()}
                  disabled={submittingReturn}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {submittingReturn ? 'Đang gửi...' : 'Xác nhận trả hàng'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e8f2df] mb-5">
            <Check className="text-[#4f6b3b]" size={32} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#dbe8cf] p-6 mb-6">
          {isDraftVNPayOrder && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">Đơn VNPay đang chờ thanh toán</p>
              <p className="text-sm text-amber-700 mt-1">Đơn này được giữ ở trạng thái nháp cho đến khi hệ thống nhận được xác nhận thanh toán từ VNPay.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Mã đơn hàng</p>
              <p className="font-bold text-xl text-gray-900">{orderData?.order_code || orderData?.MaDH}</p>
            </div>
            <div>
              <p className="text-gray-500">Khách hàng</p>
              <p className="font-semibold text-gray-900">{customerName}</p>
            </div>
            <div>
              <p className="text-gray-500">Ngày tạo</p>
              <p className="font-semibold text-gray-900">{new Date(orderData?.NgayTao).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-gray-500">Trạng thái đơn</p>
              <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${currentMeta.badge}`}>
                {currentMeta.label}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Thanh toán</p>
              <p className="font-semibold text-gray-900">{paymentStatusLabel(orderData?.payment_status)}</p>
            </div>
            <div>
              <p className="text-gray-500">Phương thức thanh toán</p>
              <p className="font-semibold text-gray-900">{paymentMethodLabel(orderData?.payment_method)}</p>
            </div>
            <div>
              <p className="text-gray-500">Mã địa chỉ</p>
              <p className="font-semibold text-gray-900">{orderData?.address_id || 'Không có'}</p>
            </div>
            <div>
              <p className="text-gray-500">Mã cửa hàng</p>
              <p className="font-semibold text-gray-900">{orderData?.MaCH || 'Không có'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500">Ghi chú khách hàng</p>
              <p className="font-medium text-gray-800">{orderData?.customer_note || 'Không có ghi chú'}</p>
            </div>
          </div>

          {currentFlow !== 'return' && (
            <div className="mt-4">
              <button
                onClick={() => setShowReturnModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                <RotateCcw className="w-4 h-4" /> Yêu cầu trả hàng
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 mt-6 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tiến trình theo 5 trạng thái</h3>
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const active = currentFlow === step.key;
                const completed = currentFlow !== 'return' ? idx < currentIndex : step.key === 'return';
                const iconClass = active || completed ? 'bg-[#5f7f46] text-white' : 'bg-gray-200 text-gray-500';

                return (
                  <div key={step.key} className="flex gap-3 items-start">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                      {step.icon === 'mail' && <Mail size={16} />}
                      {step.icon === 'package' && <Package size={16} />}
                      {step.icon === 'truck' && <Truck size={16} />}
                      {step.icon === 'check' && <Check size={16} />}
                      {step.icon === 'return' && <RotateCcw size={16} />}
                    </div>
                    <div>
                      <p className={`font-semibold ${active ? 'text-[#2f4e20]' : 'text-gray-800'}`}>{statusMeta(step.key).label}</p>
                      <p className="text-sm text-gray-600">{step.hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#dbe8cf] p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tổng tiền đơn hàng</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">{formatVND(orderData?.subtotal ?? orderData?.TongTien)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-medium">{formatVND(orderData?.shipping_fee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-lg text-[#2f4e20]">{formatVND(orderData?.TongTien)}</span>
            </div>
          </div>
        </div>

        {orderData?.chitietdonhang?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#dbe8cf] p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm trong đơn</h3>
            <div className="space-y-4">
              {orderData.chitietdonhang.map((item: any) => {
                const image = normalizeImagePath(
                  item?.sanpham?.sanpham_anh?.[0]?.DuongDanAnh ||
                  item?.sanpham?.sanpham_anh?.[0]?.Anh ||
                  item?.image
                );
                const name = item?.sanpham?.TenSP || item?.TenSP || item?.MaSP;

                return (
                  <div key={item.MaSP} className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#edf5e6] border border-[#dce8d0] flex-shrink-0">
                        {image ? (
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-gray-600">Mã SP: {item.MaSP}</p>
                        <p className="text-gray-600">Đơn giá: {formatVND(item.DonGia)}</p>
                        <p className="text-gray-600">Số lượng: {item.SoLuong}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 whitespace-nowrap">{formatVND(item.TongTien ?? item.DonGia * item.SoLuong)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/account/orders"
            className="inline-flex flex-1 items-center justify-center bg-[#dbeccc] border border-[#c8dfb4] text-[#355225] py-2.5 rounded-2xl text-center hover:bg-[#c7e0ae] transition-colors font-medium uppercase tracking-wide text-sm"
          >
            Xem lịch sử đơn hàng
          </Link>
          <Link
            href="/products"
            className="inline-flex flex-1 items-center justify-center bg-[#edf6e5] border border-[#d4e6c3] text-[#48643a] py-2.5 rounded-2xl text-center hover:bg-[#dbeccc] transition-colors font-medium uppercase tracking-wide text-sm"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="mt-10 text-center text-sm text-gray-600">
          <p className="mb-2">Cần hỗ trợ?</p>
          <p>
            <Link href="/contact" className="text-[#2D5016] hover:underline font-medium">
              Liên hệ chúng tôi
            </Link>
            {' '}hoặc email{' '}
            <a href="mailto:support@htdcha.com" className="text-[#2D5016] hover:underline font-medium">
              support@htdcha.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
