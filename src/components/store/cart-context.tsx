"use client";

import * as React from "react";
import type { CartItem } from "@/lib/types";
import { calculatePriceCents } from "@/lib/discounts";

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "remove"; id: string }
  | { type: "update"; id: string; weight_grams: number }
  | { type: "clear" };

const CartContext = React.createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateWeight: (id: string, weight_grams: number) => void;
  clear: () => void;
  totals: { items: number; subtotal_cents: number };
} | null>(null);

const storageKey = "nutallis-cart";

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((item) => item.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === action.item.id
              ? { ...item, weight_grams: item.weight_grams + action.item.weight_grams }
              : item
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "remove":
      return { items: state.items.filter((item) => item.id !== action.id) };
    case "update":
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, weight_grams: action.weight_grams } : item
        ),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
};

const computeTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (acc, item) =>
      acc + calculatePriceCents(item.price_per_kg_cents, item.weight_grams),
    0
  );
  return { items: items.length, subtotal_cents: subtotal };
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(cartReducer, { items: [] });

  React.useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as CartState;
      dispatch({ type: "clear" });
      parsed.items.forEach((item) => dispatch({ type: "add", item }));
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const value = React.useMemo(
    () => ({
      state,
      addItem: (item: CartItem) => dispatch({ type: "add", item }),
      removeItem: (id: string) => dispatch({ type: "remove", id }),
      updateWeight: (id: string, weight_grams: number) =>
        dispatch({ type: "update", id, weight_grams }),
      clear: () => dispatch({ type: "clear" }),
      totals: computeTotals(state.items),
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
