'use client';

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/shop/ProductCard";
import Product360Card from "@/components/ui/Product360card";
import {
  FrontendProduct,
  fetchProductById,
  fetchRelatedProducts,
  mapBackendProduct,
} from "@/lib/backend";
import { formatMoneyVND, useCart } from "@/store/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, ChevronRight, Minus, Plus, RotateCcw, Shield, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ── Hàm kiểm tra tồn kho — gọi thẳng API backend ──
async function checkProductStock(productId: string): Promise<{ inStock: boolean; totalStock: number }> {
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) throw new Error('Stock API error');
    const data = await res.json();
    return {
      inStock: data.data?.totalStock > 0,
      totalStock: data.data?.totalStock ?? 0,
    };
  } catch {
    // Nếu API chưa có → fallback: coi như còn hàng, không hiện số
    return { inStock: true, totalStock: -1 };
  }
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const id = (params?.id as string) || "";

  const [product,          setProduct]          = useState<FrontendProduct | null>(null);
  const [relatedProducts,  setRelatedProducts]  = useState<FrontendProduct[]>([]);
  const [quantity,         setQuantity]         = useState(1);
  const [activeImage,      setActiveImage]      = useState(0);
  const [added,            setAdded]            = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [stockError,       setStockError]       = useState<string | null>(null);
  const [availableStock,   setAvailableStock]   = useState<number | null>(null);

  const addItem         = useCart((s) => s.addItem);

  // ── Load sản phẩm ──
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      setStockError(null);
      setAvailableStock(null);

      try {
        const productData   = await fetchProductById(id);
        const mapped        = mapBackendProduct(productData);
        setProduct(mapped);

        // Kiểm tra tồn kho song song với related products
        const [stockInfo, relatedData] = await Promise.all([
          checkProductStock(mapped.id),
          fetchRelatedProducts(id),
        ]);

        // totalStock === -1 nghĩa là API chưa có → không hiện số
        setAvailableStock(stockInfo.totalStock === -1 ? null : stockInfo.totalStock);
        if (!stockInfo.inStock) setStockError('Sản phẩm hiện đã hết hàng');

        setRelatedProducts(relatedData.map(mapBackendProduct));
      } catch {
        setError('Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ── Thêm vào giỏ ──
  const handleAddToCart = async () => {
    if (!product) return;
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để mua sắm");
      router.push("/auth/login");
      return;
    }
    setStockError(null);

    // Check stock
    const stockCheck = await checkProductStock(product.id);
    if (!stockCheck.inStock) {
      setStockError("Sản phẩm hiện hết hàng");
      return;
    }

    // Add to cart
    const result = await addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });

    if (result.success) {
      toast.success(result.message || "Đã thêm vào giỏ hàng");
    } else {
      toast.error(result.message || "Không thể thêm vào giỏ hàng");
    }
  };

  // ── Loading state ──
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

  // ── Error / not found ──
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAFAF5]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Sản phẩm không tồn tại</h1>
          <p className="text-gray-500 text-sm mb-6">{error || 'Không tìm thấy sản phẩm.'}</p>
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

  const images         = [product.image, product.imageHover];
  const outOfStock     = product.inStock === false || availableStock === 0;
  const stockLabel     = outOfStock
    ? 'Hết hàng'
    : availableStock !== null
      ? `Còn hàng (${availableStock} sản phẩm)`
      : 'Còn hàng';

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Breadcrumb */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#2D5016] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#2D5016] transition-colors">Sản phẩm</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </motion.div>

      {/* Product Detail */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >

          {/* ── Ảnh + 360 ── */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Product360Card
              frontImage={product.image}
              backImage={product.imageHover}
              alt={product.name}
            />
            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-[#2D5016]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Info ── */}
          <motion.div 
            className="lg:py-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.p 
              className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              HTDCHA
            </motion.p>
            <motion.h1 
              className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 leading-snug"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              {product.name}
            </motion.h1>

            {/* Giá */}
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
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
            </motion.div>

            <motion.p 
              className="text-gray-600 text-sm leading-relaxed mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              {product.longDescription}
            </motion.p>

            {/* Chi tiết sản phẩm */}
            <motion.div 
              className="space-y-3 mb-8 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Tình trạng:</span>
                <span className={outOfStock ? 'text-red-500' : 'text-green-600'}>
                  {stockLabel}
                </span>
              </div>
            </motion.div>

            {/* Số lượng + Add to cart */}
            <motion.div 
              className="flex items-center gap-4 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
            >
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Giảm"
                >
                  <Minus size={14} />
                </button>
                <span className="px-5 text-sm font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q =>
                    availableStock !== null ? Math.min(q + 1, availableStock) : q + 1
                  )}
                  disabled={availableStock !== null && quantity >= availableStock}
                  className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Tăng"
                >
                  <Plus size={14} />
                </button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                disabled={outOfStock}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs tracking-[0.15em] font-semibold transition-all ${
                  added
                    ? 'bg-green-600 text-white'
                    : outOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#2D5016] text-white hover:bg-[#3a6b1e]'
                }`}
              >
                <ShoppingBag size={14} />
                {added ? 'ĐÃ THÊM VÀO GIỎ ✓' : 'THÊM VÀO GIỎ HÀNG'}
              </motion.button>
            </motion.div>

            {/* Stock error */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stockError ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {stockError && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{stockError}</p>
                </div>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div 
              className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Truck size={18} className="mx-auto mb-2 text-[#2D5016]" />
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">Miễn phí ship</p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Shield size={18} className="mx-auto mb-2 text-[#2D5016]" />
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">Chính hãng 100%</p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <RotateCcw size={18} className="mx-auto mb-2 text-[#2D5016]" />
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">Đổi trả 7 ngày</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            <motion.h2 
              className="text-xl font-serif text-[#2D5016] text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              Sản phẩm liên quan
            </motion.h2>
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.95 }}
            >
              {relatedProducts.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.95 + index * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <Footer />
    </div>
  );
}