"use client";

import { create } from "zustand";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((x) => x.productId === item.productId);
      if (!existing) return { items: [...state.items, { ...item, quantity }] };

      return {
        items: state.items.map((x) =>
          x.productId === item.productId ? { ...x, quantity: x.quantity + quantity } : x,
        ),
      };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((x) => x.productId !== productId),
    })),
  clear: () => set({ items: [] }),
}));
