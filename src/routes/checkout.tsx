import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { StoreShell } from "@/components/store/StoreShell";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/format";
import { settingsQuery } from "@/lib/store-data";
import { cancelPendingPayment, createOrder, verifyPayment } from "@/lib/shop.functions";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Vyshnavi Collections" },
      { name: "description", content: "Guest checkout with Cash on Delivery across India." },
      { property: "og:title", content: "Checkout — Vyshnavi Collections" },
      { property: "og:description", content: "Guest checkout with Cash on Delivery across India." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, maxCodCharge, clear } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const submitOrder = useServerFn(createOrder);
  const navigate = useNavigate();
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [method, setMethod] = useState<"cod" | "online">("cod");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const standard = Number(settings?.["shipping_standard"] ?? 0);
  const threshold = Number(settings?.["free_shipping_threshold"] ?? 0);
  const shipping = threshold > 0 && subtotal >= threshold ? 0 : standard;
  const codCharge = method === "cod" ? maxCodCharge : 0;
  const total = subtotal + shipping + codCharge;
  const onlineEnabled = settings?.["online_payment_enabled"] === "true";
  const codEnabled = settings?.["cod_enabled"] !== "false";

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    try {
      const result = await submitOrder({
        data: {
          customer: {
            name: form.name,
            phone: form.phone,
            whatsapp: sameWhatsapp ? form.phone : form.whatsapp,
            email: form.email,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            landmark: form.landmark,
          },
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
          paymentMethod: method,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (result.payment) {
        const pay = result.payment;
        const loaded = await loadRazorpay();
        if (!loaded || !window.Razorpay) {
          await cancelPayment({ data: { orderNumber: result.orderNumber } });
          toast.error("Could not open the payment window. Please check your connection and try again.");
          return;
        }
        const rzp = new window.Razorpay({
          key: pay.keyId,
          amount: pay.amount,
          currency: "INR",
          name: pay.name,
          description: pay.description,
          order_id: pay.razorpayOrderId,
          prefill: pay.prefill,
          theme: { color: "#7d2b3f" },
          modal: {
            ondismiss: () => {
              void cancelPayment({ data: { orderNumber: result.orderNumber } });
              setBusy(false);
              toast.error("Payment cancelled. Your order was not placed.");
            },
          },
          handler: (response: RazorpayHandlerResponse) => {
            void (async () => {
              const verified = await confirmPayment({
                data: {
                  orderNumber: result.orderNumber,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });
              if (!verified.ok) {
                toast.error(verified.error);
                setBusy(false);
                return;
              }
              clear();
              toast.success("Payment successful");
              navigate({ to: "/order-success/$orderNumber", params: { orderNumber: result.orderNumber } });
            })();
          },
        });
        rzp.open();
        return;
      }

      clear();
      toast.success("Order placed successfully");
      navigate({ to: "/order-success/$orderNumber", params: { orderNumber: result.orderNumber } });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-muted-foreground">Your cart is waiting for something beautiful.</p>
          <Link to="/products" className="mt-5 inline-block rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
            Browse Collections
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <form onSubmit={placeOrder} className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-5 md:py-12">
        <div className="space-y-5 md:col-span-3">
          <h1 className="font-display text-3xl">Checkout</h1>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full Name" required value={form.name} onChange={set("name")} className="sm:col-span-2" />
            <Field label="Mobile Number" required value={form.phone} onChange={set("phone")} inputMode="tel" />
            <Field label="Email (optional)" value={form.email} onChange={set("email")} type="email" />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={sameWhatsapp} onChange={(e) => setSameWhatsapp(e.target.checked)} />
              WhatsApp number same as mobile
            </label>
            {!sameWhatsapp ? (
              <Field label="WhatsApp Number" value={form.whatsapp} onChange={set("whatsapp")} className="sm:col-span-2" />
            ) : null}
            <Field label="Address" required value={form.address} onChange={set("address")} className="sm:col-span-2" />
            <Field label="City" required value={form.city} onChange={set("city")} />
            <Field label="State" required value={form.state} onChange={set("state")} />
            <Field label="Pincode" required value={form.pincode} onChange={set("pincode")} inputMode="numeric" />
            <Field label="Landmark (optional)" value={form.landmark} onChange={set("landmark")} />
          </div>

          <div className="space-y-2">
            <p className="text-xs tracking-luxe text-muted-foreground">Payment</p>
            {codEnabled ? (
              <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} className="mt-1" />
                <span>
                  <span className="font-medium">Cash on Delivery</span>
                  <span className="block text-muted-foreground">
                    Pay when your parcel arrives. Handling charge {inr(maxCodCharge)}.
                  </span>
                </span>
              </label>
            ) : null}
            <label
              className={`flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm ${onlineEnabled ? "" : "opacity-60"}`}
            >
              <input
                type="radio"
                checked={method === "online"}
                disabled={!onlineEnabled}
                onChange={() => setMethod("online")}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Pay Online (UPI / Card / Net Banking)</span>
                <span className="block text-muted-foreground">
                  {onlineEnabled ? "Secure payment via the store's payment gateway." : "Coming soon — add your payment gateway keys in Admin Settings."}
                </span>
              </span>
            </label>
          </div>
        </div>

        <aside className="h-fit space-y-3 rounded-lg border border-border/70 bg-card p-5 shadow-soft md:col-span-2">
          <p className="text-xs tracking-luxe text-muted-foreground">Order Summary</p>
          {items.map((i) => (
            <div key={i.productId + i.variant} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                {i.name} × {i.quantity}
                {i.variant ? <span className="block text-xs text-muted-foreground">{i.variant}</span> : null}
              </span>
              <span>{inr(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 text-sm">
            <Line label="Subtotal" value={inr(subtotal)} />
            <Line label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
            {codCharge > 0 ? <Line label="COD handling charge" value={inr(codCharge)} /> : null}
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-semibold">
            <span>Total</span>
            <span>{inr(total)}</span>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Placing order…" : method === "cod" ? "Place COD Order" : "Pay Online"}
          </button>
        </aside>
      </form>
    </StoreShell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
