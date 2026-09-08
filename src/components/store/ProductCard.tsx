import { Link } from "@tanstack/react-router";
import { discountPercent, inr } from "@/lib/format";
import { primaryImage } from "@/lib/store-data";
import type { ProductListItem } from "@/lib/shop.functions";

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = primaryImage(product.product_images);
  const price = Number(product.price);
  const original = product.original_price ? Number(product.original_price) : null;
  const off = discountPercent(price, original);
  const badge = product.stock <= 0
    ? "Sold out"
    : product.new_arrival
      ? "New"
      : product.bestseller
        ? "Bestseller"
        : off
          ? "Sale"
          : null;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block overflow-hidden rounded-lg border border-border/70 bg-card shadow-soft transition-shadow hover:shadow-[0_10px_40px_oklch(0.3_0.02_40/10%)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium tracking-luxe text-primary">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 font-display text-base leading-snug sm:text-lg">{product.name}</h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold sm:text-base">{inr(price)}</span>
          {original ? <span className="text-xs text-muted-foreground line-through">{inr(original)}</span> : null}
          {off ? <span className="text-xs font-medium text-primary">{off}% OFF</span> : null}
        </div>
      </div>
    </Link>
  );
}
