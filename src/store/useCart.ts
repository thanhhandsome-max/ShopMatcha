import { checkProductStock } from "@/lib/backend";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<{ success: boolean; message: string }>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  checkItemStock: (productId: string, requestedQty: number) => Promise<{ success: boolean; message: string; availableStock: number }>;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      checkItemStock: async (productId: string, requestedQty: number) => {
        try {
          const stockInfo = await checkProductStock(productId);
          
          if (!stockInfo.inStock || stockInfo.totalStock <= 0) {
            return {
              success: false,
              message: 'Sản phẩm đã hết hàng',
              availableStock: 0
            };
          }
          
          if (requestedQty > stockInfo.totalStock) {
            return {
              success: false,
              message: `Chỉ còn ${stockInfo.totalStock} sản phẩm trong kho`,
              availableStock: stockInfo.totalStock
            };
          }
          
          return {
            success: true,
            message: 'Có thể thêm vào giỏ hàng',
            availableStock: stockInfo.totalStock
          };
        } catch (error) {
          return {
            success: false,
            message: 'Lỗi kiểm tra tồn kho',
            availableStock: 0
          };
        }
      },
      
      addItem: async (item, quantity = 1) => {
        const state = get();
        const existing = state.items.find((x) => x.productId === item.productId);
        const currentQty = existing ? existing.quantity : 0;
        const totalRequested = currentQty + quantity;
        
        // Kiểm tra tồn kho
        const stockCheck = await state.checkItemStock(item.productId, totalRequested);
        
        if (!stockCheck.success) {
          return {
            success: false,
            message: stockCheck.message
          };
        }
        
        // Thêm vào giỏ hàng
        set((state) => {
          if (!existing) {
            return { items: [...state.items, { ...item, quantity }] };
          }
          return {
            items: state.items.map((x) =>
              x.productId === item.productId ? { ...x, quantity: x.quantity + quantity } : x
            ),
          };
        });
        
        return {
          success: true,
          message: 'Đã thêm vào giỏ hàng'
        };
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((x) => x.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((x) => x.productId !== productId)
            : state.items.map((x) =>
                x.productId === productId ? { ...x, quantity } : x
              ),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "htdcha-cart" }
  )
);

export function formatMoneyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}