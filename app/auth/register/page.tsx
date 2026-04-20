'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!name || !email || !password || !confirmPassword) {
        setError('Vui lòng điền tất cả trường');
        setLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }

      if (!agreeTerms) {
        setError('Vui lòng chấp nhận điều khoản sử dụng');
        setLoading(false);
        return;
      }

      if (name.length < 2) {
        setError('Tên phải có ít nhất 2 ký tự');
        setLoading(false);
        return;
      }

      // TODO: Kết nối API đăng ký thực tế
      console.log('Register attempt:', { name, email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save user to auth context
      login(email, name);
      
      // Redirect to home after successful registration
      router.push('/');
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-50 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button - HOME */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          ← Quay về trang chủ
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-[0.15em] text-[#2D5016] font-serif mb-2">
            HTDCHA
          </h1>
          <p className="text-sm text-gray-600 tracking-wider">Tạo tài khoản mới</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
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
                    setError('');
                  }}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
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
                    setError('');
                  }}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
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
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
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
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D5016] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#3a6b1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-[#2D5016] font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Shopping */}
        <div className="mt-6 text-center">
          <Link href="/products" className="text-sm text-[#2D5016] hover:underline font-medium">
            Tiếp tục mua sắm mà không đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
