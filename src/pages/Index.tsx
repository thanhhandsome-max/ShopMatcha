'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Sun, Mountain } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/data/products";

const heroImage = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/88544963-be0e-491f-abe3-dbfd08bebd77.png";
const fieldImage = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/cc543ae9-1f31-403d-b2bf-8b80c519d337.png";
const matchaPowder = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/c28b23f3-9da1-4efb-982d-89d459bd2427.png";
const matchaLatte = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/842bcae5-9110-4f1b-8bb9-5ada7d092124.png";

export default function Index() {
  const featuredProducts = getFeaturedProducts();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroImage,
      title: "ichi-go ichi-e",
      subtitle: "Mỗi lần gặp gỡ đều đáng quý, bởi nó không bao giờ lặp lại.",
    },
    {
      image: fieldImage,
      title: "Từ Kyoto đến Việt Nam",
      subtitle: "Matcha ceremonial cao cấp từ vườn trà hơn 120 năm tại Ujitawara.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-2xl px-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white font-light tracking-wide mb-4 italic">
              {slides[currentSlide].title}
            </h2>
            <p className="text-white/90 text-sm md:text-base tracking-wide max-w-lg mx-auto mb-8">
              {slides[currentSlide].subtitle}
            </p>
            <Link
              href="/products"
              className="inline-block bg-white text-[#2D5016] px-8 py-3.5 text-xs tracking-[0.2em] font-semibold hover:bg-[#2D5016] hover:text-white transition-all duration-300 border border-white"
            >
              KHÁM PHÁ NGAY
            </Link>
          </div>
        </div>
        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-8 h-0.5 transition-all duration-300 ${
                index === currentSlide ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif text-[#2D5016] tracking-wide mb-3">
            Bộ sưu tập nổi bật
          </h2>
          <p className="text-gray-500 text-sm tracking-wide">
            Những sản phẩm matcha cao cấp được yêu thích nhất
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-semibold text-[#2D5016] hover:text-[#3a6b1e] transition-colors border-b border-[#2D5016] pb-1"
          >
            XEM TẤT CẢ SẢN PHẨM <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* About Matcha Section */}
      <section className="bg-[#2D5016] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-3">
              HTDCHA CEREMONIAL MATCHA
            </h2>
            <p className="text-white/70 text-sm tracking-wide">Đến từ Ujitawara, Kyoto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center px-4">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/10">
                <Mountain size={24} className="text-white/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-wider mb-3 uppercase">
                Vườn trà 3 thế hệ
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Vinh dự được hợp tác với gia đình có truyền thống trồng trà hơn 120 năm tại vùng đất được mệnh danh là cái nôi của trà xanh Nhật Bản.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/10">
                <Sun size={24} className="text-white/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-wider mb-3 uppercase">
                3 tuần che nắng
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Lá trà được che nắng 20-25 ngày trước khi thu hoạch, giúp tăng hàm lượng L-theanine và chlorophyll, tạo nên vị umami đặc trưng.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/10">
                <Leaf size={24} className="text-white/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-wider mb-3 uppercase">
                137x chống oxy hóa
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Bột matcha có chất chống oxy hóa hơn 137 lần và hàm lượng axit amin nhiều gấp 5 lần so với các loại trà đen và trà xanh phổ biến khác.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog / Guide Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/matcha-guide" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                src={matchaPowder}
                alt="HTDCHA Matcha"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-xs mb-2">Tìm hiểu</p>
                <h3 className="text-white text-lg font-serif">HTDCHA Matcha</h3>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Matcha phát minh từ hơn 800 năm trước tại Nhật Bản. Vốn chỉ được sử dụng trong các nghi lễ Thiền của Phật giáo.
            </p>
          </Link>

          <Link href="/matcha-guide" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                src={fieldImage}
                alt="Matcha 101"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-xs mb-2">Hướng dẫn</p>
                <h3 className="text-white text-lg font-serif">Matcha 101</h3>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Miền đất Kyoto được mệnh danh là cái nôi của trà xanh Nhật Bản với lịch sử hơn 800 năm.
            </p>
          </Link>

          <Link href="/matcha-guide" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                src={matchaLatte}
                alt="Matcha Latte"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-xs mb-2">Công thức</p>
                <h3 className="text-white text-lg font-serif">Matcha Latte</h3>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Bạn phân vân không biết làm sao sử dụng matcha? Hãy để HTDCHA bật mí công thức matcha latte nhé!
            </p>
          </Link>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="text-center py-16 bg-white">
        <h2 className="text-xl md:text-2xl font-serif text-[#2D5016] tracking-wide mb-2">
          @HTDCHA.VIETNAM
        </h2>
        <p className="text-gray-500 text-sm mb-8">Theo dõi chúng tôi trên Instagram</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 max-w-5xl mx-auto px-4">
          {[heroImage, matchaPowder, matchaLatte, fieldImage].map((img, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src={img}
                alt={`Instagram ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}