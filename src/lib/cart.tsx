import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  codCharge: number;
  variant: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  maxCodCharge: number;
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vc_cart_v1";

export const cartKey = (item: Pick<CartItem, "productId" | "variant">) => `${item.productId}::${item.variant}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = cartKey(item);
      const existing = prev.find((i) => cartKey(i) === key);
      if (existing) {
        return prev.map((i) => (cartKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
  }, []);

  const setQuantity = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) => (cartKey(i) === key ? (qty <= 0 ? [] : [{ ...i, quantity: qty }]) : [i])),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      maxCodCharge: items.reduce((max, i) => Math.max(max, i.codCharge), 0),
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [items, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
