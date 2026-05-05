'use client';

import { Check, Loader2, Mail, Package, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  useEffect(() => {
    if (status === 'success' && orderId) {
      // Fetch order details from API
      fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('htdcha-token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrderData(data.data);
          } else {
            setError(data.message || 'Không tìm thấy đơn hàng');
          }
        })
        .catch(err => {
          console.error('Fetch order error:', err);
          setError('Lỗi kết nối server');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [status, orderId]);

  // Show loading
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

  // Show error if payment failed
  if (status === 'failed' || status === 'error') {
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
              <Package className="text-red-600" size={40} strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-600">{message || 'Đã xảy ra lỗi khi thanh toán'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <p className="text-gray-600 mb-6">Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-[#2D5016] text-white py-3 rounded-lg hover:bg-[#3a6b1e] transition font-medium uppercase tracking-wider"
              >
                Thử lại thanh toán
              </Link>
              <Link
                href="/cart"
                className="block w-full border border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition font-medium uppercase tracking-wider"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generate random order number if no API data
  const orderNumber = orderData?.MaDH || orderData?.order_code || 'HT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#2D5016] font-serif">HTDCHA</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <Check className="text-green-600" size={40} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng đã được xác nhận</h1>
          <p className="text-gray-600">Cảm ơn bạn đã mua hàng!</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <p className="text-gray-600 text-sm mb-2">Mã đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
            <p className="text-sm text-gray-500 mt-2">
              Đơn hàng này đã được xác nhận. Bạn sẽ nhận được email xác nhận trong vòng 5 phút.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#2D5016] text-white flex items-center justify-center flex-shrink-0">
                  <Check size={20} />
                </div>
                <div className="w-1 h-20 bg-gray-200 my-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-gray-900">Đơn hàng đã được xác nhận</h3>
                <p className="text-sm text-gray-600 mt-1">Vừa xong</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0">
                  <Package size={20} />
                </div>
                <div className="w-1 h-20 bg-gray-200 my-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-gray-900">Đang chuẩn bị hàng</h3>
                <p className="text-sm text-gray-600 mt-1">Dự kiến 1-2 ngày làm việc</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0">
                  <Truck size={20} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Đang vận chuyển</h3>
                <p className="text-sm text-gray-600 mt-1">Bạn sẽ nhận được thông báo khi hàng được giao</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail size={20} />
            Những bước tiếp theo
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Kiểm tra email của bạn để nhận xác nhận đơn hàng</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Chúng tôi sẽ chuẩn bị hàng của bạn trong 1-2 ngày làm việc</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span>Bạn sẽ nhận được thông báo vận chuyển với mã tracking</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
              <span>Nhận hàng tại địa chỉ bạn đã cung cấp</span>
            </li>
          </ul>
        </div>

        {/* Order Summary */}
        {orderData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền</span>
                <span className="font-medium">{orderData.TongTien?.toLocaleString()} ₫</span>
              </div>
              {orderData.shipping_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vận chuyển</span>
                  <span className="font-medium">{orderData.shipping_fee?.toLocaleString()} ₫</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold">Tổng cộng</span>
                <span className="font-bold text-lg">{orderData.TongTien?.toLocaleString()} ₫</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/products"
            className="block w-full bg-[#2D5016] text-white py-3 rounded-lg text-center hover:bg-[#3a6b1e] transition font-medium uppercase tracking-wider"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-900 py-3 rounded-lg text-center hover:bg-gray-50 transition font-medium uppercase tracking-wider"
          >
            Quay về trang chủ
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p className="mb-2">Cần hỗ trợ?</p>
          <p>
            <Link href="/contact" className="text-[#2D5016] hover:underline font-medium">
              Liên hệ chúng tôi
            </Link>
            {' '} hoặc email{' '}
            <a href="mailto:support@htdcha.com" className="text-[#2D5016] hover:underline font-medium">
              support@htdcha.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
