'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart, formatMoneyVND } from "@/store/useCart";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <picture>
            <img
              src={isHovered && product.imageHover ? product.imageHover : product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"%3E%3Crect width="500" height="500" fill="%23e5e7eb"/%3E%3Ctext x="250" y="250" font-size="20" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage Not Available%3C/text%3E%3C/svg%3E';
              }}
            />
          </picture>
          {/* Tags */}
          {product.tags.includes("bestseller") && (
            <span className="absolute top-3 left-3 z-10 bg-[#2D5016] text-white text-[10px] tracking-wider px-2 py-1 uppercase font-medium">
              Bestseller
            </span>
          )}
          {product.tags.includes("new") && (
            <span className="absolute top-3 left-3 z-10 bg-amber-600 text-white text-[10px] tracking-wider px-2 py-1 uppercase font-medium">
              Mới
            </span>
          )}

          {/* Quick Add Button */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-10 bg-[#2D5016] text-white text-center py-3 text-xs tracking-[0.15em] font-medium cursor-pointer transition-all duration-300 hover:bg-[#3a6b1e] ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
            onClick={handleAddToCart}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingBag size={14} />
              THÊM VÀO GIỎ
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] text-gray-400 tracking-wider uppercase">HTDCHA</p>
          <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2D5016] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {formatMoneyVND(product.price)}
            </span>
            {product.priceMax && (
              <>
                <span className="text-gray-400 text-sm">–</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatMoneyVND(product.priceMax)}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}