import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminListOrders, adminUpdateOrder, type AdminOrder } from "@/lib/admin.functions";
import { inr } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES = [
  "pending",
  "payment pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

function OrdersPage() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({ queryKey: ["admin", "orders"], queryFn: () => adminListOrders() });
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.find((o) => o.id === openId) ?? null;

  const update = useMutation({
    mutationFn: (vars: {
      id: string;
      order_status?: string;
      payment_status?: string;
      tracking_number?: string;
      admin_notes?: string;
    }) => adminUpdateOrder({ data: vars }),
    onSuccess: () => {
      toast.success("Order updated");
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  if (open) return <OrderDetail order={open} onBack={() => setOpenId(null)} onUpdate={(v) => update.mutate(v)} />;

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs tracking-luxe text-muted-foreground">
            <tr>
              <th className="p-3">ORDER</th>
              <th className="p-3">CUSTOMER</th>
              <th className="p-3">ITEMS</th>
              <th className="p-3">AMOUNT</th>
              <th className="p-3">PAYMENT</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setOpenId(o.id)}>
                <td className="p-3 font-medium">#{o.order_number}</td>
                <td className="p-3">
                  {o.customer_name}
                  <span className="block text-xs text-muted-foreground">{o.phone}</span>
                </td>
                <td className="p-3">{o.order_items?.length ?? 0}</td>
                <td className="p-3">{inr(Number(o.total))}</td>
                <td className="p-3 capitalize">
                  {o.payment_method === "cod" ? "COD" : "Online"} · {o.payment_status}
                </td>
                <td className="p-3 capitalize">{o.order_status}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderDetail({
  order,
  onBack,
  onUpdate,
}: {
  order: AdminOrder;
  onBack: () => void;
  onUpdate: (v: { id: string; order_status?: string; payment_status?: string; tracking_number?: string; admin_notes?: string }) => void;
}) {
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [notes, setNotes] = useState(order.admin_notes ?? "");

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">#{order.order_number}</h1>
        <button type="button" onClick={onBack} className="text-sm underline">
          Back
        </button>
      </div>

      <section className="rounded-lg border border-border bg-card p-4 text-sm shadow-soft">
        <p className="mb-2 text-xs tracking-luxe text-muted-foreground">CUSTOMER</p>
        <p>{order.customer_name}</p>
        <p className="text-muted-foreground">
          {order.phone}
          {order.whatsapp ? ` · WhatsApp ${order.whatsapp}` : ""}
          {order.email ? ` · ${order.email}` : ""}
        </p>
        <p className="mt-1 text-muted-foreground">
          {order.address}, {order.landmark ? `${order.landmark}, ` : ""}
          {order.city}, {order.state} — {order.pincode}
        </p>
        <a
          href={whatsappLink(order.whatsapp || order.phone, `Hello ${order.customer_name}, regarding your order #${order.order_number}`)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-md bg-whatsapp px-4 py-2 text-xs font-medium text-whatsapp-foreground"
        >
          Contact on WhatsApp
        </a>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 text-sm shadow-soft">
        <p className="mb-2 text-xs tracking-luxe text-muted-foreground">ITEMS</p>
        {(order.order_items ?? []).map((item) => (
          <div key={item.id} className="flex justify-between border-b border-border/60 py-1 last:border-0">
            <span>
              {item.product_name} × {item.quantity}
              <span className="block text-xs text-muted-foreground">
                {[item.sku, item.variant].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span>{inr(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 space-y-0.5 border-t border-border pt-2">
          <Row label="Subtotal" value={inr(Number(order.subtotal))} />
          <Row label="Shipping" value={inr(Number(order.shipping))} />
          <Row label="COD charge" value={inr(Number(order.cod_charge))} />
          <Row label="Total" value={inr(Number(order.total))} />
          <Row label="Payment" value={`${order.payment_method === "cod" ? "COD" : "Online"} · ${order.payment_status}`} />
          {order.payment_id ? <Row label="Transaction" value={order.payment_id} /> : null}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm shadow-soft">
        <p className="text-xs tracking-luxe text-muted-foreground">MANAGE</p>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Order status</span>
          <select
            value={order.order_status}
            onChange={(e) => onUpdate({ id: order.id, order_status: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Payment status</span>
          <select
            value={order.payment_status}
            onChange={(e) => onUpdate({ id: order.id, payment_status: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 capitalize"
          >
            {["pending", "paid", "failed", "refunded"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Tracking number</span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            onBlur={() => onUpdate({ id: order.id, tracking_number: tracking })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Admin notes</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate({ id: order.id, admin_notes: notes })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
      </section>
    </div>
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
