import { getBackendApiBase, getAuthHeadersJson } from "@/lib/backendApi";
import { create } from "zustand";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Tồn kho cửa hàng phục vụ giỏ (theo biến môi trường backend CART_STORE_MA_CH) */
  availableAtStore?: number;
};

type CartState = {
  items: CartItem[];
  maCH: string;
  isSyncing: boolean;
  hydrateFromServer: () => Promise<void>;
  addItem: (
    item: Omit<CartItem, "quantity" | "availableAtStore">,
    quantity?: number
  ) => Promise<{ success: boolean; message: string }>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number
  ) => Promise<{ success: boolean; message?: string }>;
  /** remote: true → gọi DELETE /api/cart (xóa trên SQL); mặc định chỉ xóa state client */
  clear: (options?: { remote?: boolean }) => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
  checkItemStock: (
    productId: string,
    requestedQty: number
  ) => Promise<{ success: boolean; message: string; availableStock: number }>;
};

async function parseJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function mapServerItems(raw: any[]): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: Number(i.price ?? 0),
    image: i.image || "",
    quantity: Number(i.quantity ?? 0),
    availableAtStore: typeof i.availableAtStore === "number" ? i.availableAtStore : undefined
  }));
}

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  maCH: "CH001",
  isSyncing: false,

  hydrateFromServer: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("htdcha-token");
    if (!token) {
      set({ items: [] });
      return;
    }
    set({ isSyncing: true });
    try {
      const res = await fetch(`${getBackendApiBase()}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await parseJson(res);
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          // Token invalid, clear it
          localStorage.removeItem("htdcha-token");
          localStorage.removeItem("htdcha-user");
        }
        set({ items: [], maCH: "CH001", isSyncing: false });
        return;
      }
      set({
        items: mapServerItems(data.data?.items),
        maCH: data.data?.maCH || "CH001",
        isSyncing: false
      });
    } catch {
      set({ isSyncing: false });
    }
  },

  addItem: async (item, quantity = 1) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("htdcha-token") : null;
    const rawUser =
      typeof window !== "undefined" ? localStorage.getItem("htdcha-user") : null;
    let maKH: string | undefined;
    try {
      maKH = rawUser ? JSON.parse(rawUser).maKH : undefined;
    } catch {
      maKH = undefined;
    }

    if (!token || !maKH) {
      return {
        success: false,
        message: "Vui lòng đăng nhập để mua sắm"
      };
    }

    const qty = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

    try {
      const res = await fetch(`${getBackendApiBase()}/cart/items`, {
        method: "POST",
        headers: getAuthHeadersJson(),
        body: JSON.stringify({ maSP: item.productId, soLuong: qty })
      });
      const data = await parseJson(res);
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          // Token invalid, clear it
          localStorage.removeItem("htdcha-token");
          localStorage.removeItem("htdcha-user");
          return {
            success: false,
            message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
          };
        }
        return {
          success: false,
          message: data.message || "Không thể thêm vào giỏ hàng"
        };
      }
      set({ items: mapServerItems(data.data?.items) });
      return {
        success: true,
        message: data.message || "Đã thêm vào giỏ hàng"
      };
    } catch {
      return { success: false, message: "Lỗi kết nối máy chủ" };
    }
  },

  removeItem: async (productId) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("htdcha-token") : null;
    if (!token) {
      set({ items: get().items.filter((x) => x.productId !== productId) });
      return;
    }
    try {
      const res = await fetch(
        `${getBackendApiBase()}/cart/items/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await parseJson(res);
      if (res.ok && data.success) {
        set({ items: mapServerItems(data.data?.items) });
      } else {
        set({ items: get().items.filter((x) => x.productId !== productId) });
      }
    } catch {
      set({ items: get().items.filter((x) => x.productId !== productId) });
    }
  },

  updateQuantity: async (productId, quantity) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("htdcha-token") : null;
    if (!token) {
      set({
        items:
          quantity <= 0
            ? get().items.filter((x) => x.productId !== productId)
            : get().items.map((x) =>
                x.productId === productId ? { ...x, quantity } : x
              )
      });
      return { success: true };
    }

    try {
      const res = await fetch(
        `${getBackendApiBase()}/cart/items/${encodeURIComponent(productId)}`,
        {
          method: "PUT",
          headers: getAuthHeadersJson(),
          body: JSON.stringify({ soLuong: quantity })
        }
      );
      const data = await parseJson(res);
      if (res.ok && data.success) {
        set({ items: mapServerItems(data.data?.items) });
        return { success: true };
      }
      return {
        success: false,
        message: data.message || "Không thể cập nhật số lượng"
      };
    } catch {
      return { success: false, message: "Lỗi kết nối máy chủ" };
    }
  },

  clear: async (options) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("htdcha-token") : null;
    if (options?.remote && token) {
      try {
        await fetch(`${getBackendApiBase()}/cart`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        /* ignore */
      }
    }
    set({ items: [] });
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  checkItemStock: async (productId, requestedQty) => {
    const line = get().items.find((x) => x.productId === productId);
    if (line && typeof line.availableAtStore === "number") {
      const cap = line.availableAtStore;
      if (requestedQty > cap) {
        return {
          success: false,
          message:
            cap <= 0
              ? "Sản phẩm đã hết hàng tại cửa hàng"
              : `Chỉ còn ${cap} sản phẩm trong kho cửa hàng`,
          availableStock: cap
        };
      }
      return {
        success: true,
        message: "Có thể đặt",
        availableStock: cap
      };
    }

    return {
      success: true,
      message: "Không có thông tin tồn kho chi tiết — vui lòng thử lại sau khi tải giỏ",
      availableStock: 999999
    };
  }
}));

export function formatMoneyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount);
}
