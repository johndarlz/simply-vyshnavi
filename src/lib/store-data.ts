import { queryOptions } from "@tanstack/react-query";
import { getSettings, listCategories, listProducts } from "./shop.functions";

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: () => getSettings(),
  staleTime: 60_000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
  staleTime: 60_000,
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 30_000,
});

export function primaryImage(images?: { image_url: string; is_primary: boolean; sort_order: number }[] | null) {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  return sorted[0]?.image_url ?? null;
}
