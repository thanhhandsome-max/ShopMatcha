'use client';

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/shop/ProductCard";
import {
    FrontendProduct,
    fetchProductList,
    mapBackendProduct,
} from "@/lib/backend";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export default function Products() {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProductList({ limit: 100 });
        setProducts(data.products.map(mapBackendProduct));
      } catch (fetchError) {
        setError("Không thể tải sản phẩm từ backend. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
      case "featured":
      default:
        break;
    }

    return result;
  }, [category, sort, products]);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2D5016] tracking-wide mb-2">
            Sản phẩm
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
            Matcha ceremonial & trà xanh cao cấp từ Kyoto, Nhật Bản
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
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

        {/* Results Count */}
        <p className="text-xs text-gray-500 mb-6 tracking-wider">
          {loading ? "Đang tải sản phẩm..." : `${filteredProducts.length} sản phẩm`}
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào.</p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}