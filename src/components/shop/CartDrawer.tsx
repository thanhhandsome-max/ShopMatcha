'use client';

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, formatMoneyVND } from "@/store/useCart";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clear, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-sm tracking-[0.15em] font-semibold uppercase">
            Giỏ hàng
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <ShoppingBag size={48} className="text-gray-300" />
          <p className="text-gray-500 text-sm">Giỏ hàng của bạn đang trống</p>
          <button
            onClick={onClose}
            className="bg-[#2D5016] text-white px-8 py-3 text-xs tracking-[0.15em] font-medium hover:bg-[#3a6b1e] transition-colors"
          >
            TIẾP TỤC MUA SẮM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle className="text-sm tracking-[0.15em] font-semibold uppercase">
          Giỏ hàng ({items.length})
        </SheetTitle>
      </SheetHeader>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 pb-4 border-b border-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover bg-gray-50 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                {item.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{formatMoneyVND(item.price)}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-50 transition-colors"
                    aria-label="Giảm"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1.5 hover:bg-gray-50 transition-colors"
                    aria-label="Tăng"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wider">Tổng cộng</span>
          <span className="text-lg font-semibold">{formatMoneyVND(totalPrice())}</span>
        </div>
        <p className="text-xs text-gray-500">Phí vận chuyển được tính khi thanh toán</p>
        <Link
          href="/checkout"
          onClick={onClose}
          className="block w-full bg-[#2D5016] text-white text-center py-3.5 text-xs tracking-[0.15em] font-medium hover:bg-[#3a6b1e] transition-colors"
        >
          THANH TOÁN
        </Link>
        <button
          onClick={onClose}
          className="block w-full border border-gray-300 text-center py-3 text-xs tracking-[0.15em] font-medium hover:bg-gray-50 transition-colors"
        >
          TIẾP TỤC MUA SẮM
        </button>
        <button
          onClick={clear}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors underline mx-auto block"
        >
          Xóa tất cả
        </button>
      </div>
    </div>
  );
}