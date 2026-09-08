import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { trackOrder } from "@/lib/shop.functions";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Vyshnavi Collections" },
      { name: "description", content: "Track your Vyshnavi Collections order with your order ID and mobile number." },
      { property: "og:title", content: "Track Your Order — Vyshnavi Collections" },
      { property: "og:description", content: "Track your order with your order ID and mobile number." },
    ],
  }),
  component: TrackPage,
});

const timeline = ["pending", "confirmed", "processing", "packed", "shipped", "out for delivery", "delivered"];
const labels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  "out for delivery": "Out for Delivery",
  delivered: "Delivered",
};

type Result = Awaited<ReturnType<typeof trackOrder>>;

function TrackPage() {
  const track = useServerFn(trackOrder);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      setResult(await track({ data: { orderNumber, phone } }));
    } catch {
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const status = (result?.order_status ?? "").toLowerCase();
  const currentIndex = timeline.indexOf(status);
  const closed = ["cancelled", "returned", "refunded"].includes(status);

  return (
    <StoreShell>
      <div className="mx-auto max-w-xl px-4 py-10 md:py-16">
        <h1 className="font-display text-3xl md:text-4xl">Track Your Order</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order ID (e.g. VC202609080001)"
            required
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            inputMode="tel"
            required
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Checking…" : "Track Order"}
          </button>
        </form>

        {result === null ? (
          <p className="mt-8 rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
            We couldn&apos;t find an order with those details.
          </p>
        ) : null}

        {result ? (
          <div className="mt-8 space-y-5 rounded-lg border border-border/70 bg-card p-5 shadow-soft">
            <div>
              <p className="font-display text-xl">#{result.order_number}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(result.created_at).toLocaleDateString("en-IN")} · {inr(result.total)} ·{" "}
                {result.payment_method === "cod" ? "Cash on Delivery" : "Paid online"}
              </p>
              {result.tracking_number ? (
                <p className="text-sm text-muted-foreground">Tracking: {result.tracking_number}</p>
              ) : null}
            </div>

            {closed ? (
              <p className="rounded-md bg-secondary p-3 text-sm capitalize">This order is {status}.</p>
            ) : (
              <ol className="space-y-3">
                {timeline.map((step, i) => {
                  const done = i <= currentIndex;
                  return (
                    <li key={step} className="flex items-center gap-3 text-sm">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className={i === currentIndex ? "font-medium" : done ? "" : "text-muted-foreground"}>
                        {labels[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="border-t border-border pt-3 text-sm">
              {result.order_items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{inr(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StoreShell>
  );
}
