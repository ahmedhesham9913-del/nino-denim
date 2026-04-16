import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

function matchItem(i: CartItem, productId: string, color: string, size: string) {
  return i.productId === productId && i.color === color && i.size === size;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            matchItem(i, item.productId, item.color, item.size)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                matchItem(i, item.productId, item.color, item.size)
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId, color, size) =>
        set((state) => ({
          items: state.items.filter((i) => !matchItem(i, productId, color, size)),
        })),

      updateQuantity: (productId, color, size, qty) =>
        set((state) => {
          if (qty < 1) {
            return {
              items: state.items.filter((i) => !matchItem(i, productId, color, size)),
            };
          }
          return {
            items: state.items.map((i) =>
              matchItem(i, productId, color, size)
                ? { ...i, quantity: qty }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    {
      name: "nino-cart",
      version: 2,
      migrate: () => ({ items: [] }), // clear old carts without color field
    }
  )
);
