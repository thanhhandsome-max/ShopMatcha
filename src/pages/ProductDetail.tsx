'use client';

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/shop/ProductCard";
import {
    FrontendProduct,
    fetchProductById,
    fetchRelatedProducts,
    mapBackendProduct,
} from "@/lib/backend";
import { formatMoneyVND, useCart } from "@/store/useCart";
import { ChevronRight, Minus, Plus, RotateCcw, Shield, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const [product, setProduct] = useState<FrontendProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<FrontendProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const productData = await fetchProductById(id);
        setProduct(mapBackendProduct(productData));

        const relatedData = await fetchRelatedProducts(id);
        setRelatedProducts(relatedData.map(mapBackendProduct));
      } catch (fetchError) {
        setError("Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-sm">Đang tải thông tin sản phẩm...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAFAF5]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Sản phẩm không tồn tại</h1>
          <p className="text-gray-500 text-sm mb-6">{error || "Không tìm thấy sản phẩm."}</p>
          <Link
            href="/products"
            className="inline-block bg-[#2D5016] text-white px-8 py-3 text-xs tracking-[0.15em] font-medium hover:bg-[#3a6b1e] transition-colors"
          >
            QUAY LẠI CỬA HÀNG
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = [product.image, product.imageHover];

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#2D5016] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#2D5016] transition-colors">
            Sản phẩm
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-[#2D5016]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mb-2">HTDCHA</p>
            <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-medium text-gray-900">
                {formatMoneyVND(product.price)}
              </span>
              {product.priceMax && (
                <>
                  <span className="text-gray-400 text-lg">–</span>
                  <span className="text-2xl font-medium text-gray-900">
                    {formatMoneyVND(product.priceMax)}
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.longDescription}
            </p>

            {/* Product Details */}
            <div className="space-y-3 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Xuất xứ:</span>
                <span className="text-gray-900">{product.origin}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Trọng lượng:</span>
                <span className="text-gray-900">{product.weight}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Tình trạng:</span>
                <span className={product.inStock ? "text-green-600" : "text-red-500"}>
                  {product.inStock ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Giảm"
                >
                  <Minus size={14} />
                </button>
                <span className="px-5 text-sm font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Tăng"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs tracking-[0.15em] font-semibold transition-all ${
                  added
                    ? "bg-green-600 text-white"
                    : product.inStock
                    ? "bg-[#2D5016] text-white hover:bg-[#3a6b1e]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingBag size={14} />
                {added ? "ĐÃ THÊM VÀO GIỎ ✓" : "THÊM VÀO GIỎ HÀNG"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck size={18} className="mx-auto mb-2 text-[#2D5016]" />
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">Miễn phí ship</p>
              </div>
              <div className="text-center">
                <Shield size={18} className="mx-auto mb-2 text-[#2D5016]" />
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">Chính hãng 100%</p>
              </div>
              <div className="text-center">
                <RotateCcw size={18} className="mx-auto mb-2 text-[#2D5016]" />
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">Đổi trả 7 ngày</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-serif text-[#2D5016] text-center mb-8">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}