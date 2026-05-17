'use client';

import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, formatMoneyVND } from "@/store/useCart";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const selectedItemIds = useCart((s) => s.selectedItemIds);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const clear = useCart((s) => s.clear);
  const selectAllItems = useCart((s) => s.selectAllItems);
  const clearSelection = useCart((s) => s.clearSelection);
  const toggleItemSelection = useCart((s) => s.toggleItemSelection);
  const selectedTotalPrice = useCart((s) => s.selectedTotalPrice());

  const selectedCount = selectedItemIds.length;
  const selectedTotal = selectedTotalPrice;
  const isCheckoutDisabled = selectedCount === 0;

  // Lấy dữ liệu cart dưới dạng JSON với ảnh
  const cartJson = items.map(item => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    total: item.price * item.quantity
  }));

  console.log('Cart JSON:', cartJson);

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white">
        <SheetHeader className="px-6 py-4 border-b border-gray-100">
          <SheetTitle className="text-sm tracking-[0.15em] font-semibold uppercase text-gray-900">
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
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <SheetHeader className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-4">
          <SheetTitle className="text-sm tracking-[0.15em] font-semibold uppercase text-gray-900">
            Giỏ hàng ({items.length})
          </SheetTitle>
          <button
            type="button"
            onClick={() => {
              if (selectedCount === items.length) {
                clearSelection();
              } else {
                selectAllItems();
              }
            }}
            className="text-xs uppercase tracking-[0.15em] font-medium text-[#2D5016] hover:text-[#1f3a0f] transition-colors"
          >
            {selectedCount === items.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
        </div>
      </SheetHeader>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 rounded-3xl transform transition-all duration-200 hover:shadow-[0_12px_32px_rgba(45,80,22,0.08)] hover:scale-[1.01]"
          >
            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                checked={selectedItemIds.includes(item.productId)}
                onChange={() => toggleItemSelection(item.productId)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#2D5016] focus:ring-[#2D5016]"
                aria-label={`Chọn sản phẩm ${item.name}`}
              />
            </div>
            <div className="w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden rounded-2xl">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu ảnh lỗi
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={24} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                {item.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {formatMoneyVND(item.price)}
              </p>
              <div className="flex items-center justify-between mt-2">
                {/* Quantity controls */}
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={async () => {
                      const r = await updateQuantity(
                        item.productId,
                        item.quantity - 1
                      );
                      if (!r.success && r.message) toast.error(r.message);
                    }}
                    className="p-1.5 hover:bg-gray-50 transition-colors text-gray-700"
                    aria-label="Giảm"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 text-sm font-medium min-w-[2rem] text-center text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={async () => {
                      const r = await updateQuantity(
                        item.productId,
                        item.quantity + 1
                      );
                      if (!r.success && r.message) toast.error(r.message);
                    }}
                    className="p-1.5 hover:bg-gray-50 transition-colors text-gray-700"
                    aria-label="Tăng"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Xóa */}
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
      <div className="border-t border-gray-100 px-6 py-4 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Tổng cộng
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {formatMoneyVND(selectedTotal)}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Chỉ sản phẩm đã chọn mới được thanh toán.
        </p>
        <button
          type="button"
          onClick={() => {
            if (isCheckoutDisabled) {
              toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
              return;
            }
            onClose();
            router.push('/checkout');
          }}
          disabled={isCheckoutDisabled}
          className={`block w-full py-3.5 text-xs tracking-[0.15em] font-medium text-white rounded-lg transition-all ${isCheckoutDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#2D5016] hover:bg-[#3a6b1e]'}`}
        >
          {isCheckoutDisabled ? 'Chọn sản phẩm để thanh toán' : `THANH TOÁN (${selectedCount})`}
        </button>
        <button
          onClick={onClose}
          className="block w-full border border-gray-300 text-center py-3 text-xs tracking-[0.15em] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          TIẾP TỤC MUA SẮM
        </button>
        <button
          onClick={() => void clear({ remote: true })}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors underline mx-auto block"
        >
          Xóa tất cả
        </button>
      </div>

    </div>
  );
}