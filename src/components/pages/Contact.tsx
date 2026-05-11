'use client';

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <nav className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#2D5016] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Liên hệ</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2D5016] tracking-wide mb-2">
            Liên hệ
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-serif text-[#2D5016] mb-6">Thông tin liên hệ</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[#2D5016] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Email</p>
                    <p className="text-sm text-gray-900">hello@htdcha.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-[#2D5016] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Điện thoại</p>
                    <p className="text-sm text-gray-900">+84 28 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#2D5016] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Địa chỉ</p>
                    <p className="text-sm text-gray-900">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[#2D5016] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Giờ làm việc</p>
                    <p className="text-sm text-gray-900">Thứ 2 - Thứ 7: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.2em] font-semibold uppercase text-gray-700 mb-3">
                Follow us
              </h3>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#2D5016] transition-colors">
                  Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#2D5016] transition-colors">
                  Instagram
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#2D5016] transition-colors">
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 border border-gray-100">
              <h2 className="text-lg font-serif text-[#2D5016] mb-6">Gửi tin nhắn</h2>

              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-6">
                  Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider uppercase mb-2">
                      Họ tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border-b-2 border-gray-200 focus:border-[#2D5016] bg-transparent py-2 text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider uppercase mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-b-2 border-gray-200 focus:border-[#2D5016] bg-transparent py-2 text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-wider uppercase mb-2">
                    Chủ đề
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border-b-2 border-gray-200 focus:border-[#2D5016] bg-transparent py-2 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 tracking-wider uppercase mb-2">
                    Tin nhắn *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-[#2D5016] bg-transparent p-3 text-sm outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#2D5016] text-white px-10 py-3.5 text-xs tracking-[0.15em] font-semibold hover:bg-[#3a6b1e] transition-colors"
                >
                  GỬI TIN NHẮN
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}