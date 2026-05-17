'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getBackendApiBase } from '@/lib/backendApi';
import { getPaymentMethodValue } from '@/lib/config';
import { formatMoneyVND, useCart } from '@/store/useCart';
import { Check, QrCode, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CustomerPromotion = {
  Makmkh: string;
  giatri: number;
  thoihan: string | null;
  mota: string | null;
  Uutien: number | null;
};

type CustomerAddress = {
  address_id: string;
  ten: string | null;
  Sdt: string | null;
  tinhthanhpho: string | null;
  quanhuyen: string | null;
  coinh: string | null;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, selectedItems, selectedItemIds, totalPrice, selectedTotalPrice, clear, removeItem, maCH } = useCart();
  const { user, isLoggedIn, isLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const checkoutItems = selectedItems();
  const checkoutTotal = selectedTotalPrice();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingStock, setCheckingStock] = useState(false);
  const [stockErrors, setStockErrors] = useState<{productId: string, message: string}[]>([]);
  const [customerPromotions, setCustomerPromotions] = useState<CustomerPromotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Contact Info
  const [phone, setPhone] = useState('');
  const [newsletter, setNewsletter] = useState(false);

  // Shipping Info
  const [country, setCountry] = useState('VN');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [postal, setPostal] = useState('');
  const [city, setCity] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState('standard');

  const shippingCost = shippingMethod === 'express' ? 50000 : 0;
  const selectedPromotionData = customerPromotions.find((promo) => promo.Makmkh === selectedPromotion) || null;
  const promotionDiscount = selectedPromotionData ? Number(selectedPromotionData.giatri || 0) : 0;
  const finalTotal = Math.max(checkoutTotal + shippingCost - promotionDiscount, 0);
  const selectedAddressData = customerAddresses.find((addr) => addr.address_id === selectedAddressId) || null;
  const paymentMethodLabel = paymentMethod === 'card'
    ? 'Thẻ tín dụng/Ghi nợ'
    : paymentMethod === 'vnpay'
    ? 'VNPay'
    : paymentMethod === 'paypal'
    ? 'PayPal'
    : 'Chuyển khoản ngân hàng';
  const receiverName = firstName || selectedAddressData?.ten || user?.name || 'Chưa nhập';
  const receiverPhone = phone || selectedAddressData?.Sdt || 'Chưa nhập';
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{
    MaDH: string;
    order_code: string;
    TongTien: number;
  } | null>(null);

  const receiverAddress = [
    address || selectedAddressData?.coinh || '',
    apartment || selectedAddressData?.quanhuyen || '',
    city || selectedAddressData?.tinhthanhpho || ''
  ].filter(Boolean).join(', ') || 'Chưa nhập';

  // Check authentication on mount
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    const loadPromotions = async () => {
      if (!isLoggedIn) return;

      setPromoLoading(true);
      try {
        const response = await fetch(`${getBackendApiBase()}/promotions/customer`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('htdcha-token') || ''}`
          }
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const promotions = Array.isArray(data.data?.promotions) ? data.data.promotions : [];
          setCustomerPromotions(
            promotions.map((promo: any) => ({
              Makmkh: promo.Makmkh,
              giatri: Number(promo.giatri || 0),
              thoihan: promo.thoihan || null,
              mota: promo.mota || null,
              Uutien: promo.Uutien ?? null
            }))
          );

          if (promotions.length > 0) {
            setSelectedPromotion((current) => current || promotions[0].Makmkh);
          }
        }
      } catch (fetchError) {
        console.error('Error loading customer promotions:', fetchError);
      } finally {
        setPromoLoading(false);
      }
    };

    void loadPromotions();
  }, [isLoggedIn]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!isLoggedIn) return;

      setAddressLoading(true);
      try {
        const response = await fetch(`${getBackendApiBase()}/addresses/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('htdcha-token') || ''}`
          }
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const addresses = Array.isArray(data.data?.addresses) ? data.data.addresses : [];
          setCustomerAddresses(addresses);

          if (addresses.length === 1) {
            setSelectedAddressId((current) => current || addresses[0].address_id);
          }
        }
      } catch (fetchError) {
        console.error('Error loading customer addresses:', fetchError);
      } finally {
        setAddressLoading(false);
      }
    };

    void loadAddresses();
  }, [isLoggedIn]);

  const applySavedAddress = (addressId: string) => {
    const selected = customerAddresses.find((item) => item.address_id === addressId);
    if (!selected) return;

    setPhone(selected.Sdt || phone);
    setCity(selected.tinhthanhpho || city);
    setAddress([selected.coinh, selected.quanhuyen, selected.tinhthanhpho].filter(Boolean).join(', '));
  };

  const checkCartStock = async () => {
    setCheckingStock(true);
    setStockErrors([]);
    
    try {
      const { checkMultipleProductsStock } = await import('@/lib/backend');
      const productIds = checkoutItems.map(item => item.productId);
      const stockInfos = await checkMultipleProductsStock(productIds);
      
      const errors: {productId: string, message: string}[] = [];
      
      checkoutItems.forEach(item => {
        const stockInfo = stockInfos.find(s => s.productId === item.productId);
        if (stockInfo) {
          if (!stockInfo.inStock || stockInfo.totalStock <= 0) {
            errors.push({
              productId: item.productId,
              message: `Sản phẩm "${item.name}" đã hết hàng`
            });
          } else if (item.quantity > stockInfo.totalStock) {
            errors.push({
              productId: item.productId,
              message: `Sản phẩm "${item.name}" chỉ còn ${stockInfo.totalStock} trong kho (bạn đã chọn ${item.quantity})`
            });
          }
        }
      });
      
      setStockErrors(errors);
      return errors.length === 0;
    } catch (error) {
      console.error('Error checking stock:', error);
      setStockErrors([{ productId: '', message: 'Lỗi kiểm tra tồn kho' }]);
      return false;
    } finally {
      setCheckingStock(false);
    }
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const usingSavedAddress = customerAddresses.length > 0 && selectedAddressId;

    // Nếu dùng địa chỉ đã lưu, số điện thoại đã có từ DB
    // Nếu thêm mới, bắt buộc phải nhập số điện thoại
    if (!usingSavedAddress && !phone) {
      setError('Vui lòng điền số điện thoại');
      return;
    }

    if (!usingSavedAddress && (!firstName || !address || !city)) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    if (customerAddresses.length > 0 && !selectedAddressId) {
      setError('Vui lòng chọn địa chỉ đã lưu');
      return;
    }
    setError('');
    setStep(3);
    window.scrollTo(0, 0);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        setError('Vui lòng điền đủ thông tin thẻ');
        return;
      }
    }

    setError('');

    if (checkoutItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Kiểm tra tồn kho trước khi tạo đơn và mở modal xác nhận
    const stockOk = await checkCartStock();
    if (!stockOk) {
      setError('Một số sản phẩm trong giỏ hàng không đủ hàng. Vui lòng cập nhật lại.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.productId,
          MaSP: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        MaCH: maCH || 'CH001',
        payment_method: getPaymentMethodValue(paymentMethod),
        address_id: selectedAddressId || '',
        customer_note: [
          `Payment via ${paymentMethod}`,
          `Contact: ${user?.name || 'unknown'} / ${phone}`,
          selectedPromotion ? `Promotion: ${selectedPromotion}` : ''
        ].filter(Boolean).join(' | '),
        shipping_fee: shippingCost,
        promotionId: selectedPromotion || undefined
      };

      const response = await fetch(`${getBackendApiBase()}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('htdcha-token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.debug('Checkout: create order response', data);
      if (!data.success) {
        setError(data.message || 'Tạo đơn hàng thất bại');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'vnpay') {
        await startVNPayPayment({
          orderId: data.data.MaDH,
          orderCode: data.data.order_code,
          amount: data.data.TongTien,
        });
        return;
      }

      setCreatedOrder({ MaDH: data.data.MaDH, order_code: data.data.order_code, TongTien: data.data.TongTien });
      setShowConfirmModal(true);
    } catch (err) {
      console.error('Create order error:', err);
      setError('Tạo đơn hàng thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const orderId = createdOrder?.MaDH;
      console.debug('Checkout: processing payment for order', createdOrder);
      if (!orderId) {
        setError('Không tìm thấy đơn hàng để xử lý thanh toán');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'vnpay') {
        await startVNPayPayment({
          orderId,
          orderCode: createdOrder?.order_code || orderId,
          amount: createdOrder?.TongTien,
        });
        return;
      }

      // Non-VNPay: clear cart and go to confirmation
      await clear({ remote: true });
      router.push(`/order-confirmation?orderId=${orderId}&status=success`);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Thanh toán thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const startVNPayPayment = async (order: { orderId: string; orderCode: string; amount: number | undefined }) => {
    const paymentResponse = await fetch(`${getBackendApiBase()}/payments/checkout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('htdcha-token')}`
      },
      body: JSON.stringify({
        orderId: order.orderId,
        amount: order.amount,
        orderInfo: `Thanh toan don hang ${order.orderCode}`
      })
    });

    const paymentData = await paymentResponse.json();
    console.debug('Checkout: payment API response', paymentData);
    if (paymentData.success) {
      const redirectUrl = paymentData.data?.paymentUrl || paymentData.data?.payment_url || paymentData.data?.redirectUrl || paymentData.data?.url;
      if (redirectUrl) {
        setShowConfirmModal(false);
        setLoading(false);
        console.info('Checkout: VNPay payment ready', redirectUrl);
        window.location.href = redirectUrl;
        return;
      }
      console.error('Checkout: payment response missing redirect URL', paymentData);
      setError('Không nhận được đường dẫn thanh toán từ VNPay');
      setLoading(false);
      return;
    }

    console.warn('Checkout: payment API returned failure', paymentData);
    setError(paymentData.message || 'Không tạo được mã thanh toán VNPay');
    setLoading(false);
  };

  const handleAbortCheckout = async () => {
    try {
      await clear({ remote: true });
      router.push('/products');
    } catch (abortError) {
      console.error('Abort checkout error:', abortError);
      setError('Không thể hủy mua hàng lúc này. Vui lòng thử lại.');
    }
  };

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
            <p className="text-gray-600 mb-8">Vui lòng thêm sản phẩm trước khi thanh toán</p>
            <Link href="/products" className="inline-block bg-[#2D5016] text-white px-8 py-3 rounded-lg hover:bg-[#3a6b1e] transition">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-[#2D5016] rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff7e8,_#f7f7f7_45%,_#eef2f6)] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#d8ebc8]/50 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-40 -right-20 h-80 w-80 rounded-full bg-[#dbe7f6]/60 blur-3xl animate-pulse" />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#2D5016] font-serif">HTDCHA</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex gap-4 mb-8">
              {[1, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    s < step ? 'bg-[#2D5016] text-white' : s === step ? 'bg-[#2D5016] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s < step ? <Check size={16} /> : (s === 1 ? 1 : 2)}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 mx-2 ${s < step ? 'bg-[#2D5016]' : 'bg-gray-200'}`}></div>}
                </div>
              ))}
            </div>

            {/* Step 1: Shipping Info */}
            {step === 1 && (
              <div className="bg-white/95 rounded-3xl shadow-lg shadow-black/5 border border-[#e7efe0] p-5 mb-6">
                <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">Thông tin giao hàng</h2>
                
                <form onSubmit={handleSubmitShipping} className="space-y-4">
                  {/* Saved Address Selection */}
                  <div className="rounded-2xl border border-[#e4ecd9] p-4 bg-[#f9fcf6]">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Địa chỉ đã lưu</p>
                        <p className="text-xs text-gray-500">Chọn từ bảng address trong database</p>
                      </div>
                      {addressLoading && <span className="text-xs text-gray-500">Đang tải...</span>}
                    </div>
                    {customerAddresses.length > 0 ? (
                      <select
                        value={selectedAddressId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSelectedAddressId(nextId);
                          if (nextId) {
                            applySavedAddress(nextId);
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                      >
                        <option value="">Chọn một địa chỉ đã lưu</option>
                        {customerAddresses.map((addr) => (
                          <option key={addr.address_id} value={addr.address_id}>
                            {addr.ten || 'Không tên'} - {addr.Sdt || 'Không có SĐT'} - {[addr.coinh, addr.quanhuyen, addr.tinhthanhpho].filter(Boolean).join(', ') || 'Không có địa chỉ chi tiết'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500">Chưa có địa chỉ nào trong hệ thống</div>
                    )}
                  </div>

                  {/* Toggle New Address Form Button */}
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="w-full py-2 text-sm border border-[#6f9453] text-[#2D5016] rounded-xl hover:bg-[#f3f8ee] transition font-medium"
                  >
                    {showNewAddressForm ? '← Ẩn form thêm địa chỉ' : '+ Thêm địa chỉ mới'}
                  </button>

                  {/* New Address Form - Hidden by default */}
                  {showNewAddressForm && (
                    <div className="space-y-4 p-4 border border-[#e4ecd9] rounded-2xl bg-[#f9fcf6]">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên người nhận</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setError('');
                          }}
                          placeholder="Nguyễn Văn A"
                          className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setError('');
                          }}
                          placeholder="+84 123 456 789"
                          className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            setError('');
                          }}
                          placeholder="123 Đường ABC"
                          className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                          <input
                            type="text"
                            value={apartment}
                            onChange={(e) => setApartment(e.target.value)}
                            placeholder="Quận 1"
                            className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              setError('');
                            }}
                            placeholder="Hà Nội"
                            className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="w-4 h-4 accent-[#2D5016]"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-600">
                      Nhận thông tin khuyến mãi
                    </label>
                  </div>

                  <div className="rounded-2xl border border-[#e4ecd9] p-4 bg-[#f9fcf6]">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mã khuyến mãi của bạn</p>
                        <p className="text-xs text-gray-500">Chọn mã giảm giá cá nhân nếu có</p>
                      </div>
                      {promoLoading && <span className="text-xs text-gray-500">Đang tải...</span>}
                    </div>
                    {customerPromotions.length > 0 ? (
                      <select
                        value={selectedPromotion}
                        onChange={(e) => setSelectedPromotion(e.target.value)}
                        className="w-full px-4 py-2.5 border border-[#d8e4cc] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#9dbb85]"
                      >
                        {customerPromotions.map((promo) => (
                          <option key={promo.Makmkh} value={promo.Makmkh}>
                            {promo.Makmkh} - Giảm {formatMoneyVND(promo.giatri)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500">Không có mã khuyến mãi khả dụng</div>
                    )}
                  </div>



                  {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                  <button
                    type="submit"
                    className="w-full bg-[#2D5016] text-white py-2.5 rounded-xl hover:bg-[#3a6b1e] transition font-semibold tracking-wide"
                  >
                    Tiếp tục đến thanh toán
                  </button>
                </form>

                {showConfirmModal && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Xác nhận thanh toán</h3>
                    <p className="text-sm text-gray-500 mt-1">Kiểm tra lại thông tin trước khi tạo giao dịch.</p>

                    <div className="mt-4 space-y-3 rounded-xl bg-[#f5f8f2] border border-[#dce9cf] p-4">
                      <div className="flex justify-between gap-4 text-sm"><span className="text-gray-600">Người nhận</span><span className="font-medium text-gray-900 text-right">{receiverName}</span></div>
                      <div className="flex justify-between gap-4 text-sm"><span className="text-gray-600">Số điện thoại</span><span className="font-medium text-gray-900 text-right">{receiverPhone}</span></div>
                      <div className="flex justify-between gap-4 text-sm"><span className="text-gray-600">Địa chỉ giao hàng</span><span className="font-medium text-gray-900 text-right">{receiverAddress}</span></div>
                      <div className="flex justify-between gap-4 text-sm"><span className="text-gray-600">Phương thức</span><span className="font-medium text-gray-900 text-right">{paymentMethodLabel}</span></div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Thông tin đơn hàng</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {checkoutItems.map((item) => (
                          <div key={`confirm-${item.productId}`} className="flex items-center justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                            </div>
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {formatMoneyVND(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 border-t border-gray-200 pt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Tạm tính</span>
                          <span>{formatMoneyVND(checkoutTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Vận chuyển</span>
                          <span>{formatMoneyVND(shippingCost)}</span>
                        </div>
                        {promotionDiscount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Giảm giá</span>
                            <span>-{formatMoneyVND(promotionDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2 mt-2">
                          <span className="text-gray-900">Tổng thanh toán</span>
                          <span className="text-[#2D5016]">{formatMoneyVND(finalTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                        className="w-full sm:flex-1 border border-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          // If there's a created order, try to mark it canceled; otherwise just abort
                          if (createdOrder?.MaDH) {
                            try {
                              setLoading(true);
                              const resp = await fetch(`${getBackendApiBase()}/orders/${createdOrder.MaDH}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('htdcha-token')}` },
                                body: JSON.stringify({ TrangThai: 3 })
                              });
                              const resJson = await resp.json();
                              if (!resJson.success) {
                                console.warn('Cancel order failed:', resJson);
                                setError(resJson.message || 'Không thể hủy đơn hàng');
                              }
                            } catch (err) {
                              console.error('Cancel order error:', err);
                              setError('Không thể hủy đơn hàng');
                            } finally {
                              setLoading(false);
                            }
                          }
                          setShowConfirmModal(false);
                          setCreatedOrder(null);
                          await clear({ remote: true });
                          router.push('/account/orders');
                        }}
                        className="w-full sm:flex-1 border border-red-300 text-red-700 py-3 rounded-lg hover:bg-red-50 transition font-medium"
                      >
                        Hủy mua hàng
                      </button>
                      <button
                        type="button"
                        onClick={processPayment}
                        className="w-full sm:flex-1 bg-[#2D5016] text-white py-3 rounded-lg hover:bg-[#3a6b1e] transition font-semibold"
                      >
                        Xác nhận và thanh toán
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white/95 rounded-3xl shadow-lg shadow-black/5 border border-[#e7efe0] p-5">
                <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">Phương thức thanh toán</h2>
                
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Chọn phương thức</label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50" style={{ borderColor: paymentMethod === 'card' ? '#2D5016' : '#e5e7eb', boxShadow: paymentMethod === 'card' ? '0 0 0 4px rgba(45,80,22,0.08)' : 'none' }}>
                        <input
                          type="radio"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium">Thẻ tín dụng/Ghi nợ</p>
                          <p className="text-xs text-gray-500">Visa, MasterCard, JCB</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Card</span>
                      </label>
                      
                      <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50" style={{ borderColor: paymentMethod === 'vnpay' ? '#2D5016' : '#e5e7eb', boxShadow: paymentMethod === 'vnpay' ? '0 0 0 4px rgba(45,80,22,0.08)' : 'none' }}>
                        <input
                          type="radio"
                          value="vnpay"
                          checked={paymentMethod === 'vnpay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium">VNPay</p>
                          <p className="text-xs text-gray-500">Thẻ ngân hàng / QR Code</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#e8f4df] text-[#2D5016]"><QrCode size={13} /> QR</span>
                      </label>
                      
                      <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50" style={{ borderColor: paymentMethod === 'paypal' ? '#2D5016' : '#e5e7eb', boxShadow: paymentMethod === 'paypal' ? '0 0 0 4px rgba(45,80,22,0.08)' : 'none' }}>
                        <input
                          type="radio"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium">PayPal</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">PayPal</span>
                      </label>

                      <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50" style={{ borderColor: paymentMethod === 'bank' ? '#2D5016' : '#e5e7eb', boxShadow: paymentMethod === 'bank' ? '0 0 0 4px rgba(45,80,22,0.08)' : 'none' }}>
                        <input
                          type="radio"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">Bank</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => {
                            setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16));
                            setError('');
                          }}
                          placeholder="4532 1234 5678 9010"
                          maxLength={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ thẻ</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => {
                            setCardName(e.target.value);
                            setError('');
                          }}
                          placeholder="NGUYEN VAN A"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hạn sử dụng</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              if (val.length >= 2) {
                                val = val.slice(0, 2) + '/' + val.slice(2);
                              }
                              setCardExpiry(val);
                              setError('');
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => {
                              setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3));
                              setError('');
                            }}
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 border border-[#ccd9bf] text-gray-900 py-2.5 rounded-xl hover:bg-[#f5f8f2] transition font-semibold"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#2D5016] text-white py-2.5 rounded-xl hover:bg-[#3a6b1e] transition font-semibold disabled:opacity-50"
                    >
                      {loading ? 'Đang xử lý...' : `Thanh toán ${formatMoneyVND(finalTotal)}`}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAbortCheckout}
                    className="w-full border border-red-300 text-red-700 py-2.5 rounded-xl hover:bg-red-50 transition font-semibold"
                  >
                    Hủy mua hàng
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 rounded-2xl shadow-xl shadow-black/5 border border-white p-6 sticky top-20">
              <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">Đơn hàng của bạn</h3>
              
              {/* Stock Error Messages */}
              {stockErrors.length > 0 && (
                <div className="mb-4 space-y-2">
                  {stockErrors.map((err, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{err.message}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {checkoutItems.map((item) => {
                  const hasError = stockErrors.some(e => e.productId === item.productId);
                  const imageSrc = item.image?.trim() || '';
                  return (
                    <div key={item.productId} className={`flex gap-4 pb-4 border-b ${hasError ? 'border-red-200 bg-red-50 -mx-2 px-2 rounded' : 'border-gray-100'}`}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="w-16 h-16 object-cover bg-gray-100 rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                          No image
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">x{item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatMoneyVND(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="self-start text-red-500 hover:text-red-700 transition-colors p-1"
                        aria-label={`Xóa ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Update Cart Button */}
              <button
                type="button"
                onClick={checkCartStock}
                disabled={checkingStock}
                className="w-full mb-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                {checkingStock ? 'Đang kiểm tra...' : 'Cập nhật giỏ hàng'}
              </button>

              <div className="border-t space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{formatMoneyVND(checkoutTotal)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Vận chuyển</span>
                    <span>{formatMoneyVND(shippingCost)}</span>
                  </div>
                )}
                {promotionDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Giảm giá</span>
                    <span>-{formatMoneyVND(promotionDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Tổng cộng</span>
                  <span>{formatMoneyVND(finalTotal)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Miễn phí vận chuyển cho đơn hàng trên 500,000₫
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
