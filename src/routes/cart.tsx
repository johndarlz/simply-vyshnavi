import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { cartKey, useCart } from "@/lib/cart";
import { inr } from "@/lib/format";
import { settingsQuery } from "@/lib/store-data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Vyshnavi Collections" },
      { name: "description", content: "Review the pieces in your cart before checking out." },
      { property: "og:title", content: "Your Cart — Vyshnavi Collections" },
      { property: "og:description", content: "Review the pieces in your cart before checking out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, remove, setQuantity } = useCart();
  const { data: settings } = useQuery(settingsQuery);

  const standard = Number(settings?.["shipping_standard"] ?? 0);
  const threshold = Number(settings?.["free_shipping_threshold"] ?? 0);
  const shipping = items.length === 0 ? 0 : threshold > 0 && subtotal >= threshold ? 0 : standard;

  return (
    <StoreShell>
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">Your cart is waiting for something beautiful.</p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-4">
              {items.map((item) => (
                <li
                  key={cartKey(item)}
                  className="flex gap-4 rounded-lg border border-border/70 bg-card p-3 shadow-soft"
                >
                  <Link to="/products/$slug" params={{ slug: item.slug }} className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                    {item.image ? <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg">{item.name}</p>
                    {item.variant ? <p className="text-xs text-muted-foreground">{item.variant}</p> : null}
                    <p className="mt-1 text-sm font-medium">{inr(item.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <button type="button" className="px-3 py-1" onClick={() => setQuantity(cartKey(item), item.quantity - 1)}>
                          −
                        </button>
                        <span className="w-7 text-center text-sm">{item.quantity}</span>
                        <button type="button" className="px-3 py-1" onClick={() => setQuantity(cartKey(item), item.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(cartKey(item))}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{inr(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg border border-border/70 bg-card p-5 shadow-soft">
              <Row label="Subtotal" value={inr(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{inr(subtotal + shipping)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">COD handling charge, if any, is added at checkout.</p>
              <Link
                to="/checkout"
                className="mt-5 block rounded-md bg-primary py-3 text-center text-sm font-medium text-primary-foreground"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </StoreShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
