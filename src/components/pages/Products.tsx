'use client';

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/shop/ProductCard";
import {
    FrontendProduct,
    fetchProductList,
    mapBackendProduct,
    searchProducts,
} from "@/lib/backend";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { motion } from "framer-motion";

const categories = [
  { value: "all", label: "Tất cả" },
  { value: "matcha", label: "Matcha" },
  { value: "sencha", label: "Sencha & Hojicha" },
  { value: "accessories", label: "Dụng cụ" },
];

const sortOptions = [
  { value: "featured", label: "Nổi bật" },
  { value: "price-asc", label: "Giá: Thấp → Cao" },
  { value: "price-desc", label: "Giá: Cao → Thấp" },
  { value: "name-asc", label: "Tên: A → Z" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        if (searchQuery.trim()) {
          const data = await searchProducts(searchQuery, 100);
          setProducts(data.results.map(mapBackendProduct));
        } else {
          const data = await fetchProductList({ limit: 100 });
          setProducts(data.products.map(mapBackendProduct));
        }
      } catch (fetchError) {
        setError("Không thể tải sản phẩm từ backend. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [category, sort, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, sort, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      <motion.div 
        className="bg-white border-b border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-serif text-[#2D5016] tracking-wide mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Sản phẩm"}
          </motion.h1>
          <motion.p 
            className="text-gray-500 text-sm tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {searchQuery 
              ? `Tìm thấy ${filteredProducts.length} sản phẩm phù hợp`
              : "Matcha ceremonial & trà xanh cao cấp từ Kyoto, Nhật Bản"
            }
          </motion.p>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs tracking-wider font-medium text-gray-700 hover:text-[#2D5016] transition-colors sm:hidden"
            >
              <SlidersHorizontal size={14} /> BỘ LỌC
            </button>
            <div className={`flex-wrap gap-2 ${showFilters ? "flex" : "hidden sm:flex"}`}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 text-xs tracking-wider font-medium transition-all ${
                    category === cat.value
                      ? "bg-[#2D5016] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#2D5016] hover:text-[#2D5016]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 tracking-wider">Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs border border-gray-200 px-3 py-2 bg-white focus:border-[#2D5016] outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6 tracking-wider">
          {loading 
            ? "Đang tải sản phẩm..." 
            : searchQuery 
              ? `Tìm thấy ${filteredProducts.length} sản phẩm cho "${searchQuery}"`
              : `${filteredProducts.length} sản phẩm`
          }
        </p>

        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">Đang tải sản phẩm từ backend...</p>
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {currentProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {filteredProducts.length === 0 && (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào.</p>
              </motion.div>
            )}

            {totalPages > 1 && (
              <motion.div 
                className="flex justify-center items-center gap-2 mt-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-xs tracking-wider font-medium border border-gray-200 bg-white hover:border-[#2D5016] hover:text-[#2D5016] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  TRƯỚC
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-xs tracking-wider font-medium transition-all ${
                      currentPage === page
                        ? "bg-[#2D5016] text-white"
                        : "border border-gray-200 bg-white hover:border-[#2D5016] hover:text-[#2D5016]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-xs tracking-wider font-medium border border-gray-200 bg-white hover:border-[#2D5016] hover:text-[#2D5016] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SAU
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      <Footer />
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}