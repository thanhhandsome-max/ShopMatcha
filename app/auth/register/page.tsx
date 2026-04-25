'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

/**
 * RegisterPage Component
 * Trang đăng ký tài khoản người dùng mới với form nhập name, email, password, confirm password.
 * Hỗ trợ: validation, toggle password visibility, terms agreement, và error handling.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state management
  const [name, setName] = useState(''); // Họ và tên người dùng
  const [email, setEmail] = useState(''); // Email đăng ký
  const [password, setPassword] = useState(''); // Mật khẩu
  const [confirmPassword, setConfirmPassword] = useState(''); // Xác nhận mật khẩu
  const [showPassword, setShowPassword] = useState(false); // Điều khiển hiển thị/ẩn mật khẩu
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Điều khiển hiển thị/ẩn xác nhận mật khẩu
  const [error, setError] = useState(''); // Thông báo lỗi
  const [loading, setLoading] = useState(false); // Trạng thái loading khi đang xử lý
  const [agreeTerms, setAgreeTerms] = useState(false); // Trạng thái đồng ý điều khoản

  /**
   * handleSubmit - Xử lý sự kiện submit form đăng ký
   * 
   * Các bước:
   * 1. Ngăn hành động mặc định của form
   * 2. Reset lỗi trước đó và bật loading state
   * 3. Validate dữ liệu đầu vào (name, email, password, confirm password, terms)
   * 4. Gửi yêu cầu đăng ký đến backend (hiện tại là mock)
   * 5. Lưu thông tin user vào auth context
   * 6. Redirect về trang chủ
   * 7. Xử lý lỗi nếu có
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation: Kiểm tra các field bắt buộc
      if (!name || !email || !password || !confirmPassword) {
        setError('Vui lòng điền tất cả trường');
        setLoading(false);
        return;
      }

      // Validation: Kiểm tra định dạng email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }

      // Validation: Kiểm tra độ dài mật khẩu tối thiểu
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }

      // Validation: Kiểm tra mật khẩu xác nhận khớp với mật khẩu
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }

      // Validation: Kiểm tra user đã đồng ý điều khoản
      if (!agreeTerms) {
        setError('Vui lòng chấp nhận điều khoản sử dụng');
        setLoading(false);
        return;
      }

      // Validation: Kiểm tra độ dài tên tối thiểu
      if (name.length < 2) {
        setError('Tên phải có ít nhất 2 ký tự');
        setLoading(false);
        return;
      }

      // TODO: Kết nối API đăng ký thực tế
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });

      // Mock register - xóa khi có API thực
      console.log('Register attempt:', { name, email, password });

      // Simulate API call - chờ 1 giây để tạo hiệu ứng loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save user to auth context - lưu thông tin user vào context
      login(email, name);

      // Redirect to home after successful registration - chuyển hướng về trang chủ sau đăng ký thành công
      router.push('/');
    } catch (err) {
      // Xử lý lỗi bất ngờ
      setError('Đã xảy ra lỗi, vui lòng thử lại');
      console.error(err);
    } finally {
      // Tắt loading state dù thành công hay thất bại
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Background Decoration - Thêm hiệu ứng background gradient blob để làm đẹp */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-50 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button - Nút quay lại trang chủ */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          ← Quay về trang chủ
        </Link>

        {/* Logo Section - Tiêu đề và mô tả trang đăng ký */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-[0.15em] text-[#2D5016] font-serif mb-2">
            HTDCHA
          </h1>
          <p className="text-sm text-gray-600 tracking-wider">Tạo tài khoản mới</p>
        </div>

        {/* Register Card - Container chính chứa form đăng ký */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          {/* Register Form - Form chính để nhập thông tin đăng ký */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input Field - Nhập họ và tên người dùng */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Clear error khi user bắt đầu nhập lại
                    setError('');
                  }}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input Field - Nhập email đăng ký với validation trực tuyến */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error khi user bắt đầu nhập lại
                    setError('');
                  }}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input Field - Nhập mật khẩu với tùy chọn hiển thị/ẩn */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error khi user bắt đầu nhập lại
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
                {/* Toggle button - hiển thị/ẩn mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input Field - Nhập lại mật khẩu để xác nhận */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    // Clear error khi user bắt đầu nhập lại
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
                {/* Toggle button - hiển thị/ẩn xác nhận mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Agreement Checkbox - Checkbox để user đồng ý điều khoản sử dụng */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  // Clear error khi user thay đổi checkbox
                  setError('');
                }}
                className="mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#2D5016]"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <Link href="/terms" className="text-[#2D5016] hover:underline font-medium">
                  điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="text-[#2D5016] hover:underline font-medium">
                  chính sách bảo mật
                </Link>
              </label>
            </div>

            {/* Error Message Display - Hiển thị thông báo lỗi nếu có */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button - Gửi form đăng ký */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D5016] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#3a6b1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {/* Hiển thị trạng thái loading hoặc text bình thường */}
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          {/* Login Redirect - Liên kết đến trang đăng nhập cho user đã có account */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-[#2D5016] font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        {/* Bypass Auth - Link cho phép user tiếp tục mua hàng mà không cần đăng ký */}
        <div className="mt-6 text-center">
          <Link href="/products" className="text-sm text-[#2D5016] hover:underline font-medium">
            Tiếp tục mua sắm mà không đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
  // End of RegisterPage Component
}
