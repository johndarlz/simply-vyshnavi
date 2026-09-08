import { inr } from "./format";

export function whatsappLink(number: string, message: string) {
  const digits = (number || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(opts: {
  storeName: string;
  productName: string;
  productId: string;
  variant?: string;
  quantity: number;
  price: number;
  url: string;
}) {
  const lines = [
    `Hello ${opts.storeName} 👋`,
    "",
    "I would like to order:",
    `Product: ${opts.productName}`,
    `Product ID: ${opts.productId}`,
  ];
  if (opts.variant) lines.push(`Variant: ${opts.variant}`);
  lines.push(`Quantity: ${opts.quantity}`, `Price: ${inr(opts.price)}`, "", "Product Link:", opts.url, "", "Please confirm my order.");
  return lines.join("\n");
}

export function productUrl(slug: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/products/${slug}`;
}
