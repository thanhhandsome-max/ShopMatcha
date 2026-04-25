'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, formatMoneyVND } from '@/store/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CheckoutPage Component
 * Trang thanh toán 3 bước: thông tin liên hệ, địa chỉ giao hàng, phương thức thanh toán.
 * Tính năng: authentication check, multi-step form, order summary, shipping methods, payment options.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCart();
  const { isLoggedIn, isLoading } = useAuth();

  // Checkout flow state
  const [step, setStep] = useState(1); // Bước hiện tại: 1 (contact), 2 (shipping), 3 (payment)
  const [loading, setLoading] = useState(false); // Trạng thái loading khi xử lý
  const [error, setError] = useState(''); // Thông báo lỗi

  // Contact Info state
  const [email, setEmail] = useState(''); // Email liên hệ
  const [phone, setPhone] = useState(''); // Số điện thoại
  const [newsletter, setNewsletter] = useState(false); // Đăng ký newsletter

  // Shipping Info state
  const [country, setCountry] = useState('VN'); // Quốc gia giao hàng
  const [firstName, setFirstName] = useState(''); // Tên khách hàng
  const [lastName, setLastName] = useState(''); // Họ khách hàng
  const [address, setAddress] = useState(''); // Địa chỉ chính
  const [apartment, setApartment] = useState(''); // Căn hộ/phòng (tùy chọn)
  const [postal, setPostal] = useState(''); // Mã bưu điện
  const [city, setCity] = useState(''); // Thành phố

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card'); // Phương thức thanh toán (card/paypal/bank)
  const [cardNumber, setCardNumber] = useState(''); // Số thẻ tín dụng
  const [cardExpiry, setCardExpiry] = useState(''); // Hạn sử dụng thẻ (MM/YY)
  const [cardCvc, setCardCvc] = useState(''); // CVV/CVC của thẻ
  const [cardName, setCardName] = useState(''); // Tên chủ thẻ

  // Shipping Method state
  const [shippingMethod, setShippingMethod] = useState('standard'); // Phương thức giao hàng (standard/express)

  // Tính phí vận chuyển dựa trên phương thức giao hàng
  const shippingCost = shippingMethod === 'express' ? 50000 : 0;

  /**
   * useEffect - Kiểm tra xác thực người dùng
   * Nếu user chưa đăng nhập, chuyển hướng về trang login
   * Chạy khi component mount hoặc khi isLoggedIn/isLoading thay đổi
   */
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, isLoading, router]);

  /**
   * handleSubmitContact - Xử lý bước 1: Thông tin liên hệ
   * 
   * Các bước:
   * 1. Ngăn hành động mặc định của form
   * 2. Validate email và phone bắt buộc
   * 3. Reset lỗi và chuyển sang bước 2
   * 4. Scroll lên đầu trang
   */
  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      setError('Vui lòng điền email và số điện thoại');
      return;
    }
    setError('');
    setStep(2);
    window.scrollTo(0, 0);
  };

  /**
   * handleSubmitShipping - Xử lý bước 2: Địa chỉ giao hàng
   * 
   * Các bước:
   * 1. Ngăn hành động mặc định của form
   * 2. Validate các field địa chỉ bắt buộc
   * 3. Reset lỗi và chuyển sang bước 3
   * 4. Scroll lên đầu trang
   */
  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !address || !city || !postal) {
      setError('Vui lòng điền đủ thông tin địa chỉ');
      return;
    }
    setError('');
    setStep(3);
    window.scrollTo(0, 0);
  };

  /**
   * handleSubmitPayment - Xử lý bước 3: Thanh toán
   * 
   * Các bước:
   * 1. Ngăn hành động mặc định của form
   * 2. Validate thông tin thẻ (nếu chọn phương thức card)
   * 3. Bật loading state
   * 4. Simulate xử lý thanh toán (2 giây)
   * 5. Clear giỏ hàng và chuyển hướng sang trang order confirmation
   * 6. Xử lý lỗi nếu có
   */
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu chọn thanh toán bằng thẻ, validate thông tin thẻ
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        setError('Vui lòng điền đủ thông tin thẻ');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      // Simulate payment processing - tạo hiệu ứng xử lý thanh toán
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart and redirect - xóa giỏ hàng và chuyển hướng
      clear();
      router.push('/order-confirmation');
    } catch (err) {
      setError('Thanh toán thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Nếu giỏ hàng trống ở bước 1, hiển thị thông báo
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

  // Nếu đang kiểm tra xác thực, hiển thị loading spinner
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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Header với logo */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#2D5016] font-serif">HTDCHA</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Nội dung chính với 3 bước */}
          <div className="lg:col-span-2">
            {/* Progress Steps - Hiển thị tiến độ checkout */}
            <div className="flex gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s < step ? 'bg-[#2D5016] text-white' : s === step ? 'bg-[#2D5016] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {s < step ? <Check size={16} /> : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 mx-2 ${s < step ? 'bg-[#2D5016]' : 'bg-gray-200'}`}></div>}
                </div>
              ))}
            </div>

            {/* Step 1: Contact Info - Bước 1: Thông tin liên hệ */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">Thông tin liên hệ</h2>

                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Clear error khi user bắt đầu nhập lại
                        setError('');
                      }}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        // Clear error khi user bắt đầu nhập lại
                        setError('');
                      }}
                      placeholder="+84 123 456 789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                    />
                  </div>

                  {/* Newsletter checkbox - Checkbox đăng ký nhận thông tin */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="w-4 h-4 accent-[#2D5016]"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-600">
                      Nhận thông tin khuyến mãi qua email
                    </label>
                  </div>

                  {/* Error message - Hiển thị thông báo lỗi nếu có */}
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                  {/* Continue button - Nút tiếp tục sang bước 2 */}
                  <button
                    type="submit"
                    className="w-full bg-[#2D5016] text-white py-3 rounded-lg hover:bg-[#3a6b1e] transition font-medium uppercase tracking-wider"
                  >
                    Tiếp tục đến giao hàng
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Shipping Info - Bước 2: Địa chỉ giao hàng và phương thức vận chuyển */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Shipping address form - Form nhập địa chỉ giao hàng */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">Địa chỉ giao hàng</h2>

                  <form onSubmit={handleSubmitShipping} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia/Khu vực</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                      >
                        <option value="VN">Việt Nam</option>
                        <option value="TH">Thái Lan</option>
                        <option value="SG">Singapore</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            // Clear error khi user bắt đầu nhập lại
                            setError('');
                          }}
                          placeholder="Nguyễn"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            // Clear error khi user bắt đầu nhập lại
                            setError('');
                          }}
                          placeholder="Văn A"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          // Clear error khi user bắt đầu nhập lại
                          setError('');
                        }}
                        placeholder="123 Đường ABC"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Căn hộ/Tòa nhà (tùy chọn)</label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Phòng 101"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mã bưu điện</label>
                        <input
                          type="text"
                          value={postal}
                          onChange={(e) => {
                            setPostal(e.target.value);
                            // Clear error khi user bắt đầu nhập lại
                            setError('');
                          }}
                          placeholder="10000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            // Clear error khi user bắt đầu nhập lại
                            setError('');
                          }}
                          placeholder="Hà Nội"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
                        />
                      </div>
                    </div>

                    {/* Error message - Hiển thị thông báo lỗi nếu có */}
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                    <div className="flex gap-4">
                      {/* Back button - Nút quay lại bước 1 */}
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition font-medium uppercase tracking-wider"
                      >
                        Quay lại
                      </button>
                      {/* Continue button - Nút tiếp tục sang bước 3 */}
                      <button
                        type="submit"
                        className="flex-1 bg-[#2D5016] text-white py-3 rounded-lg hover:bg-[#3a6b1e] transition font-medium uppercase tracking-wider"
                      >
                        Tiếp tục đến thanh toán
                      </button>
                    </div>
                  </form>
                </div>

                {/* Shipping Methods - Lựa chọn phương thức giao hàng */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Phương thức giao hàng</h3>
                  <div className="space-y-3">
                    {/* Standard shipping - Giao hàng tiêu chuẩn (miễn phí) */}
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4 accent-[#2D5016]"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium">Giao hàng tiêu chuẩn</p>
                        <p className="text-sm text-gray-600">3-5 ngày làm việc</p>
                      </div>
                      <p className="font-medium">Miễn phí</p>
                    </label>
                    {/* Express shipping - Giao hàng nhanh (50,000₫) */}
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4 accent-[#2D5016]"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium">Giao hàng nhanh</p>
                        <p className="text-sm text-gray-600">1-2 ngày làm việc</p>
                      </div>
                      <p className="font-medium">50,000₫</p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment - Bước 3: Phương thức thanh toán */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">Phương thức thanh toán</h2>

                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Chọn phương thức</label>
                    <div className="space-y-3">
                      {/* Credit/Debit card option - Tùy chọn thanh toán bằng thẻ */}
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: paymentMethod === 'card' ? '#2D5016' : '#e5e7eb' }}>
                        <input
                          type="radio"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4">
                          <p className="font-medium">Thẻ tín dụng/Ghi nợ</p>
                        </div>
                      </label>

                      {/* PayPal option - Tùy chọn thanh toán bằng PayPal */}
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: paymentMethod === 'paypal' ? '#2D5016' : '#e5e7eb' }}>
                        <input
                          type="radio"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4">
                          <p className="font-medium">PayPal</p>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: paymentMethod === 'bank' ? '#2D5016' : '#e5e7eb' }}>
                        <input
                          type="radio"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#2D5016]"
                        />
                        <div className="ml-4">
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                        </div>
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
                          maxLength="19"
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
                            maxLength="5"
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
                            maxLength="3"
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
                      onClick={() => setStep(2)}
                      className="flex-1 border border-gray-300 text-gray-900 py-3 rounded-lg hover:bg-gray-50 transition font-medium uppercase tracking-wider"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#2D5016] text-white py-3 rounded-lg hover:bg-[#3a6b1e] transition font-medium uppercase tracking-wider disabled:opacity-50"
                    >
                      {loading ? 'Đang xử lý...' : `Thanh toán ${formatMoneyVND(totalPrice() + shippingCost)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary - Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">Đơn hàng của bạn</h3>

              {/* Items list - Danh sách sản phẩm trong đơn hàng */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover bg-gray-100 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">x{item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatMoneyVND(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price summary - Tóm tắt giá tiền */}
              <div className="border-t space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{formatMoneyVND(totalPrice())}</span>
                </div>
                {/* Show shipping cost if express selected - Hiển thị phí vận chuyển nếu chọn giao hàng nhanh */}
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Vận chuyển</span>
                    <span>{formatMoneyVND(shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Tổng cộng</span>
                  <span>{formatMoneyVND(totalPrice() + shippingCost)}</span>
                </div>
              </div>

              {/* Promo info - Thông tin khuyến mãi */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                Miễn phí vận chuyển cho đơn hàng trên 500,000₫
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // End of CheckoutPage Component
}
