'use client';

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold tracking-[0.15em] font-serif mb-4">HTDCHA</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Matcha ceremonial cao cấp từ Kyoto, Nhật Bản. Mang đến trải nghiệm trà đạo đích thực cho người Việt.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm">TikTok</a>
            </div>
          </div>

          {/* Điều khoản */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold mb-6 uppercase">Điều khoản</h4>
            <ul className="space-y-3">
              {[
                { href: "/privacy", label: "Chính sách bảo mật" },
                { href: "/refund", label: "Chính sách hoàn trả" },
                { href: "/shipping", label: "Chính sách vận chuyển" },
                { href: "/terms", label: "Điều khoản sử dụng" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tìm hiểu thêm */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold mb-6 uppercase">Tìm hiểu thêm</h4>
            <ul className="space-y-3">
              {[
                { href: "/contact", label: "Liên hệ" },
                { href: "/matcha-guide", label: "Matcha Guide" },
                { href: "/about", label: "Về chúng tôi" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold mb-6 uppercase">Ưu đãi độc quyền</h4>
            <p className="text-gray-400 text-sm mb-4">
              Đăng ký nhận thông tin ưu đãi và công thức matcha mới nhất.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <input
                type="email"
                placeholder="Nhập email vào đây"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent border border-gray-600 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-white outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-black px-4 py-2.5 text-xs tracking-wider font-semibold hover:bg-gray-200 transition-colors"
              >
                {subscribed ? "✓" : "ĐĂNG KÝ"}
              </button>
            </form>
            {subscribed && (
              <p className="text-green-400 text-xs mt-2">Cảm ơn bạn đã đăng ký!</p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">© 2026, HTDCHA. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">Phương thức thanh toán</span>
            <div className="flex gap-2">
              {["VISA", "MC", "MOMO"].map((method) => (
                <div key={method} className="bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-300">
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}