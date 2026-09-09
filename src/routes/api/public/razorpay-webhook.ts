import { createFileRoute } from "@tanstack/react-router";

async function hmacSha256Hex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const signature = request.headers.get("x-razorpay-signature");
        const body = await request.text();
        if (!signature || signature !== (await hmacSha256Hex(secret, body))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: {
          event?: string;
          payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
        };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const entity = event.payload?.payment?.entity;
        if (!entity?.order_id) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, payment_status, order_items(product_id, quantity)")
          .eq("payment_id", entity.order_id)
          .maybeSingle();

        if (!order) return new Response("ok");

        if (event.event === "payment.captured" && order.payment_status !== "paid") {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "paid",
              order_status: "confirmed",
              payment_id: entity.id ?? entity.order_id,
            })
            .eq("id", order.id);

          for (const item of order.order_items ?? []) {
            if (!item.product_id) continue;
            const { data: p } = await supabaseAdmin
              .from("products")
              .select("stock")
              .eq("id", item.product_id)
              .maybeSingle();
            if (p) {
              await supabaseAdmin
                .from("products")
                .update({ stock: Math.max(0, p.stock - item.quantity) })
                .eq("id", item.product_id);
            }
          }
        } else if (event.event === "payment.failed" && order.payment_status !== "paid") {
          await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
        }

        return new Response("ok");
      },
    },
  },
});
