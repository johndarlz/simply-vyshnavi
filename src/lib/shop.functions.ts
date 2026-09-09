import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type StoreSettings = Record<string, string>;

export const getSettings = createServerFn({ method: "GET" }).handler(async (): Promise<StoreSettings> => {
  const { data } = await publicClient().from("settings").select("key, value");
  const out: StoreSettings = {};
  for (const row of data ?? []) out[row.key] = row.value ?? "";
  return out;
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
});

const productSelect =
  "id, name, slug, sku, price, original_price, stock, featured, new_arrival, bestseller, cod_charge, created_at, category_id, product_images(image_url, is_primary, sort_order)";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("products")
    .select(productSelect)
    .eq("active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export type ProductListItem = Awaited<ReturnType<typeof listProducts>>[number];

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: product } = await publicClient()
      .from("products")
      .select(
        "*, categories(name, slug), product_images(id, image_url, is_primary, sort_order), product_videos(id, video_url, thumbnail_url), product_variants(id, type, name, price_adjustment, stock, sku, image_url, sort_order)",
      )
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    return product;
  });

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/),
    whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
    address: z.string().trim().min(5).max(400),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().regex(/^[0-9]{6}$/),
    landmark: z.string().trim().max(150).optional().or(z.literal("")),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
        variant: z.string().max(120).optional().or(z.literal("")),
      }),
    )
    .min(1)
    .max(20),
  paymentMethod: z.enum(["cod", "online"]),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const settingsRes = await supabaseAdmin.from("settings").select("key, value");
    const settings: Record<string, string> = {};
    for (const row of settingsRes.data ?? []) settings[row.key] = row.value ?? "";

    const ids = data.items.map((i) => i.productId);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, sku, price, stock, cod_charge, active, allow_website_order")
      .in("id", ids);

    if (!products || products.length !== new Set(ids).size) {
      return { ok: false as const, error: "Some products are no longer available." };
    }

    let subtotal = 0;
    let codCharge = 0;
    const items: {
      product_id: string;
      product_name: string;
      sku: string | null;
      variant: string | null;
      quantity: number;
      price: number;
    }[] = [];

    for (const line of data.items) {
      const p = products.find((x) => x.id === line.productId)!;
      if (!p.active || !p.allow_website_order) {
        return { ok: false as const, error: `${p.name} is currently unavailable.` };
      }
      if (p.stock < line.quantity) {
        return { ok: false as const, error: `Only ${p.stock} left of ${p.name}.` };
      }
      const price = Number(p.price);
      subtotal += price * line.quantity;
      codCharge = Math.max(codCharge, Number(p.cod_charge));
      items.push({
        product_id: p.id,
        product_name: p.name,
        sku: p.sku,
        variant: line.variant || null,
        quantity: line.quantity,
        price,
      });
    }

    const standardShipping = Number(settings["shipping_standard"] ?? 0);
    const freeThreshold = Number(settings["free_shipping_threshold"] ?? 0);
    const shipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : standardShipping;
    const cod = data.paymentMethod === "cod" ? codCharge : 0;
    if (data.paymentMethod === "cod" && settings["cod_enabled"] !== "true") {
      return { ok: false as const, error: "Cash on delivery is currently unavailable." };
    }
    const razorpayKeyId = process.env["RAZORPAY_KEY_ID"];
    const razorpayKeySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (data.paymentMethod === "online") {
      if (settings["online_payment_enabled"] !== "true" || !razorpayKeyId || !razorpayKeySecret) {
        return { ok: false as const, error: "Online payment is unavailable right now. Please choose Cash on Delivery." };
      }
    }
    const total = subtotal + shipping + cod;

    const seqRes = await supabaseAdmin.rpc("next_order_number");
    const orderNumber =
      typeof seqRes.data === "string" && seqRes.data
        ? seqRes.data
        : "VC" +
          new Date().toISOString().slice(0, 10).replace(/-/g, "") +
          String(Math.floor(Math.random() * 9000) + 1000);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.customer.name,
        phone: data.customer.phone,
        whatsapp: data.customer.whatsapp || data.customer.phone,
        email: data.customer.email || null,
        address: data.customer.address,
        city: data.customer.city,
        state: data.customer.state,
        pincode: data.customer.pincode,
        landmark: data.customer.landmark || null,
        subtotal,
        shipping,
        cod_charge: cod,
        discount: 0,
        total,
        payment_method: data.paymentMethod,
        payment_status: "pending",
        order_status: data.paymentMethod === "online" ? "awaiting_payment" : "pending",
      })
      .select("id, order_number")
      .single();

    if (error || !order) return { ok: false as const, error: "Something went wrong. Please try again." };

    await supabaseAdmin.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));

    if (data.paymentMethod === "cod") {
      for (const line of data.items) {
        const p = products.find((x) => x.id === line.productId)!;
        await supabaseAdmin
          .from("products")
          .update({ stock: Math.max(0, p.stock - line.quantity) })
          .eq("id", p.id);
      }
      return { ok: true as const, orderNumber: order.order_number, payment: null };
    }

    // Online payment: create a Razorpay order server-side.
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: order.order_number,
        notes: { order_number: order.order_number },
      }),
    });

    if (!rzpRes.ok) {
      await supabaseAdmin.from("orders").update({ order_status: "cancelled" }).eq("id", order.id);
      return { ok: false as const, error: "Could not start the payment. Please try again." };
    }

    const rzpOrder = (await rzpRes.json()) as { id: string; amount: number };
    await supabaseAdmin.from("orders").update({ payment_id: rzpOrder.id }).eq("id", order.id);

    return {
      ok: true as const,
      orderNumber: order.order_number,
      payment: {
        keyId: razorpayKeyId!,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        name: settings["store_name"] || "Vyshnavi Collections",
        description: `Order ${order.order_number}`,
        prefill: {
          name: data.customer.name,
          contact: data.customer.phone,
          email: data.customer.email || "",
        },
      },
    };
  });

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

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        orderNumber: z.string().trim().min(4).max(40),
        razorpayOrderId: z.string().trim().max(120),
        razorpayPaymentId: z.string().trim().max(120),
        razorpaySignature: z.string().trim().max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const secret = process.env["RAZORPAY_KEY_SECRET"];
    if (!secret) return { ok: false as const, error: "Payment verification is unavailable." };

    const expected = await hmacSha256Hex(secret, `${data.razorpayOrderId}|${data.razorpayPaymentId}`);
    if (expected !== data.razorpaySignature) return { ok: false as const, error: "Payment could not be verified." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, payment_id, payment_status, order_items(product_id, quantity)")
      .eq("order_number", data.orderNumber.toUpperCase())
      .maybeSingle();

    if (!order || order.payment_id !== data.razorpayOrderId) {
      return { ok: false as const, error: "Payment could not be matched to your order." };
    }
    if (order.payment_status === "paid") return { ok: true as const, orderNumber: order.order_number };

    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "paid", order_status: "confirmed", payment_id: data.razorpayPaymentId })
      .eq("id", order.id);

    for (const item of order.order_items ?? []) {
      if (!item.product_id) continue;
      const { data: p } = await supabaseAdmin.from("products").select("stock").eq("id", item.product_id).maybeSingle();
      if (p) {
        await supabaseAdmin
          .from("products")
          .update({ stock: Math.max(0, p.stock - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    return { ok: true as const, orderNumber: order.order_number };
  });

export const cancelPendingPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ orderNumber: z.string().trim().min(4).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("orders")
      .update({ order_status: "cancelled" })
      .eq("order_number", data.orderNumber.toUpperCase())
      .eq("payment_status", "pending");
    return { ok: true as const };
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ orderNumber: z.string().trim().min(4).max(40), phone: z.string().trim().min(6).max(20) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const phone = data.phone.replace(/\D/g, "").slice(-10);
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, customer_name, phone, city, state, total, payment_method, payment_status, order_status, tracking_number, created_at, order_items(product_name, variant, quantity, price)",
      )
      .eq("order_number", data.orderNumber.trim().toUpperCase())
      .maybeSingle();

    if (!order || !order.phone.replace(/\D/g, "").endsWith(phone)) return null;
    const { phone: _hidden, ...safe } = order;
    return safe;
  });

export const getOrderByNumber = createServerFn({ method: "GET" })
  .inputValidator((d: { orderNumber: string }) => z.object({ orderNumber: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, customer_name, address, city, state, pincode, subtotal, shipping, cod_charge, total, payment_method, payment_status, order_status, created_at, order_items(product_name, variant, quantity, price)",
      )
      .eq("order_number", data.orderNumber.toUpperCase())
      .maybeSingle();
    return order;
  });
