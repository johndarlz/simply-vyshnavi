import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreShell } from "@/components/store/StoreShell";
import { getOrderByNumber } from "@/lib/shop.functions";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/order-success/$orderNumber")({
  loader: ({ params }) => getOrderByNumber({ data: { orderNumber: params.orderNumber } }),
  head: () => ({
    meta: [
      { title: "Order Placed — Vyshnavi Collections" },
      { name: "description", content: "Thank you for shopping with Vyshnavi Collections." },
      { property: "og:title", content: "Order Placed — Vyshnavi Collections" },
      { property: "og:description", content: "Thank you for shopping with Vyshnavi Collections." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => (
    <StoreShell>
      <p className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">Something went wrong. Please try again.</p>
    </StoreShell>
  ),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const order = Route.useLoaderData();

  if (!order) {
    return (
      <StoreShell>
        <p className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">
          We couldn&apos;t find an order with those details.
        </p>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="rounded-xl border border-border/70 bg-card p-8 text-center shadow-soft">
          <h1 className="font-display text-3xl">Order Placed Successfully 🎉</h1>
          <p className="mt-2 text-muted-foreground">Thank you for shopping with Vyshnavi Collections.</p>
          <p className="mt-5 text-xs tracking-luxe text-muted-foreground">Order ID</p>
          <p className="font-display text-2xl">#{order.order_number}</p>
        </div>

        <div className="mt-6 space-y-2 rounded-lg border border-border/70 bg-card p-5 text-sm shadow-soft">
          {order.order_items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {item.product_name} × {item.quantity}
                {item.variant ? <span className="block text-xs text-muted-foreground">{item.variant}</span> : null}
              </span>
              <span>{inr(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2">
            <Row label="Subtotal" value={inr(order.subtotal)} />
            <Row label="Shipping" value={Number(order.shipping) === 0 ? "Free" : inr(order.shipping)} />
            {Number(order.cod_charge) > 0 ? <Row label="COD handling charge" value={inr(order.cod_charge)} /> : null}
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span>{inr(order.total)}</span>
          </div>
          <Row label="Payment" value={order.payment_method === "cod" ? "Cash on Delivery" : "Paid online"} />
          <Row label="Status" value={order.order_status} />
          <div className="border-t border-border pt-2 text-muted-foreground">
            <p className="text-xs tracking-luxe">Delivery address</p>
            <p className="mt-1 text-foreground">
              {order.customer_name}, {order.address}, {order.city}, {order.state} — {order.pincode}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/track" className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
            Track Order
          </Link>
          <Link to="/products" className="rounded-md border border-foreground/20 px-6 py-3 text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </StoreShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between capitalize">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
