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
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((x) => x.productId === item.productId);
          if (!existing) return { items: [...state.items, { ...item, quantity }] };
          return {
            items: state.items.map((x) =>
              x.productId === item.productId ? { ...x, quantity: x.quantity + quantity } : x
            ),
          };
        }),
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