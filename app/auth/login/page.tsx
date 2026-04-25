'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

/**
 * LoginPage Component
 * Trang đăng nhập người dùng với form nhập email, tên, và mật khẩu.
 * Hỗ trợ: validation, toggle password visibility, và error handling.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state management
  const [email, setEmail] = useState(''); // Email người dùng
  const [password, setPassword] = useState(''); // Mật khẩu
  const [name, setName] = useState(''); // Tên hiển thị
  const [showPassword, setShowPassword] = useState(false); // Điều khiển hiển thị/ẩn mật khẩu
  const [error, setError] = useState(''); // Thông báo lỗi
  const [loading, setLoading] = useState(false); // Trạng thái loading khi đang xử lý

  /**
   * handleSubmit - Xử lý sự kiện submit form đăng nhập
   * 
   * Các bước:
   * 1. Ngăn hành động mặc định của form
   * 2. Reset lỗi trước đó và bật loading state
   * 3. Validate dữ liệu đầu vào (email, password, name)
   * 4. Gửi yêu cầu đăng nhập đến backend (hiện tại là mock)
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
      if (!email || !password || !name) {
        setError('Vui lòng điền email, tên và mật khẩu');
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

      // TODO: Kết nối API đăng nhập thực tế
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Mock login - xóa khi có API thực
      console.log('Login attempt:', { email, password, name });

      // Simulate API call - chờ 1 giây để tạo hiệu ứng loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save user to auth context - lưu thông tin user vào context
      login(email, name);

      // Redirect to home after successful login - chuyển hướng về trang chủ sau đăng nhập thành công
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

        {/* Logo Section - Tiêu đề và mô tả trang đăng nhập */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-[0.15em] text-[#2D5016] font-serif mb-2">
            HTDCHA
          </h1>
          <p className="text-sm text-gray-600 tracking-wider">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Login Card - Container chính chứa form đăng nhập */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          {/* Login Form - Form chính để nhập thông tin đăng nhập */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input Field - Nhập email với validation trực tuyến */}
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

            {/* Name Input Field - Nhập tên hiển thị của user */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                Tên hiển thị
              </label>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Password Input Field - Nhập mật khẩu với tùy chọn hiển thị/ẩn */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Mật khẩu
                </label>
                {/* Link quên mật khẩu - chuyển đến trang reset password */}
                <Link href="/auth/forgot-password" className="text-xs text-[#2D5016] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
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

            {/* Error Message Display - Hiển thị thông báo lỗi nếu có */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button - Gửi form đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D5016] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#3a6b1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {/* Hiển thị trạng thái loading hoặc text bình thường */}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            {/* Divider - Phân cách giữa form đăng nhập và đăng nhập social */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Social Login Button - Đăng nhập bằng Google (chưa implement) */}
            <button
              type="button"
              disabled={loading}
              className="w-full border border-gray-300 bg-white text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </button>
          </form>

          {/* Sign Up Redirect - Liên kết đến trang đăng ký cho user chưa có account */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="text-[#2D5016] font-medium hover:underline">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box - Thông tin cho người test chức năng demo */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            💡 <span className="font-medium">Dùng để test:</span> Demo account functionality. Đăng nhập thực tế sẽ được kết nối với backend.
          </p>
        </div>

        {/* Bypass Auth - Link cho phép user tiếp tục mua hàng mà không cần đăng nhập */}
        <div className="mt-6 text-center">
          <Link href="/products" className="text-sm text-[#2D5016] hover:underline font-medium">
            Tiếp tục mua sắm mà không đăng nhập
          </Link>
        </div>
      </div>
    </div>
);
}
