import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminWhoami = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(isAdmin) };
  });

export const adminSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const [{ data: orders }, { data: products }] = await Promise.all([
      db.from("orders").select("total, order_status, payment_status, created_at"),
      db.from("products").select("id, stock, low_stock_threshold, active"),
    ]);
    const list = orders ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    const paid = list.filter((o) => o.payment_status === "paid" || o.order_status === "delivered");
    const sum = (rows: typeof list) => rows.reduce((s, o) => s + Number(o.total ?? 0), 0);
    const byStatus = (s: string) => list.filter((o) => o.order_status === s).length;
    return {
      totalOrders: list.length,
      todayOrders: list.filter((o) => String(o.created_at).startsWith(today)).length,
      pendingOrders: byStatus("pending"),
      confirmedOrders: byStatus("confirmed"),
      deliveredOrders: byStatus("delivered"),
      totalProducts: (products ?? []).length,
      lowStock: (products ?? []).filter((p) => Number(p.stock) <= Number(p.low_stock_threshold ?? 0)).length,
      revenue: sum(paid),
      todayRevenue: sum(list.filter((o) => String(o.created_at).startsWith(today))),
      monthRevenue: sum(list.filter((o) => String(o.created_at).startsWith(month))),
      averageOrderValue: list.length ? Math.round(sum(list) / list.length) : 0,
    };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data } = await db
      .from("products")
      .select(
        "*, categories(name), product_images(id, image_url, is_primary, sort_order), product_videos(id, video_url), product_variants(id, type, name, price_adjustment, stock, sku, sort_order)",
      )
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export type AdminProduct = Awaited<ReturnType<typeof adminListProducts>>[number];

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  category_id: z.string().uuid().nullable().optional(),
  price: z.number().min(0),
  original_price: z.number().min(0).nullable().optional(),
  cod_charge: z.number().min(0),
  stock: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0),
  material: z.string().max(200).optional().or(z.literal("")),
  dimensions: z.string().max(200).optional().or(z.literal("")),
  weight: z.string().max(100).optional().or(z.literal("")),
  care_instructions: z.string().max(500).optional().or(z.literal("")),
  delivery_info: z.string().max(500).optional().or(z.literal("")),
  seo_title: z.string().max(200).optional().or(z.literal("")),
  seo_description: z.string().max(400).optional().or(z.literal("")),
  featured: z.boolean(),
  new_arrival: z.boolean(),
  bestseller: z.boolean(),
  active: z.boolean(),
  allow_website_order: z.boolean(),
  allow_whatsapp_order: z.boolean(),
  images: z.array(z.string().url().max(1000)).max(12),
  videoUrl: z.string().max(1000).optional().or(z.literal("")),
  variants: z
    .array(
      z.object({
        type: z.string().trim().min(1).max(40),
        name: z.string().trim().min(1).max(60),
        price_adjustment: z.number().min(-100000),
        stock: z.number().int().min(0),
        sku: z.string().max(60).optional().or(z.literal("")),
      }),
    )
    .max(40),
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productSchema.parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { images, videoUrl, variants, id, ...fields } = data;
    const row = {
      ...fields,
      sku: fields.sku || null,
      description: fields.description || null,
      category_id: fields.category_id || null,
      original_price: fields.original_price ?? null,
      material: fields.material || null,
      dimensions: fields.dimensions || null,
      weight: fields.weight || null,
      care_instructions: fields.care_instructions || null,
      delivery_info: fields.delivery_info || null,
      seo_title: fields.seo_title || null,
      seo_description: fields.seo_description || null,
    };

    let productId = id;
    if (productId) {
      const { error } = await db.from("products").update(row).eq("id", productId);
      if (error) return { ok: false as const, error: "Could not save the product." };
    } else {
      const { data: inserted, error } = await db.from("products").insert(row).select("id").single();
      if (error || !inserted) return { ok: false as const, error: "Could not create the product." };
      productId = inserted.id;
    }

    await db.from("product_images").delete().eq("product_id", productId!);
    if (images.length) {
      await db.from("product_images").insert(
        images.map((image_url, i) => ({
          product_id: productId!,
          image_url,
          sort_order: i,
          is_primary: i === 0,
        })),
      );
    }

    await db.from("product_videos").delete().eq("product_id", productId!);
    if (videoUrl) {
      await db.from("product_videos").insert({ product_id: productId!, video_url: videoUrl });
    }

    await db.from("product_variants").delete().eq("product_id", productId!);
    if (variants.length) {
      await db.from("product_variants").insert(
        variants.map((v, i) => ({
          product_id: productId!,
          type: v.type,
          name: v.name,
          price_adjustment: v.price_adjustment,
          stock: v.stock,
          sku: v.sku || null,
          sort_order: i,
        })),
      );
    }

    return { ok: true as const, id: productId! };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    await db.from("products").delete().eq("id", data.id);
    return { ok: true as const };
  });

export const adminSetProductActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; active: boolean }) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    await db.from("products").update({ active: data.active }).eq("id", data.id);
    return { ok: true as const };
  });

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data } = await db.from("categories").select("*").order("sort_order");
    return data ?? [];
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(2).max(80),
        slug: z.string().trim().min(2).max(80),
        image_url: z.string().max(1000).optional().or(z.literal("")),
        active: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const row = { name: data.name, slug: data.slug, image_url: data.image_url || null, active: data.active };
    if (data.id) await db.from("categories").update(row).eq("id", data.id);
    else await db.from("categories").insert(row);
    return { ok: true as const };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    await db.from("categories").delete().eq("id", data.id);
    return { ok: true as const };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data } = await db
      .from("orders")
      .select("*, order_items(id, product_name, sku, variant, quantity, price)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export type AdminOrder = Awaited<ReturnType<typeof adminListOrders>>[number];

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        order_status: z.string().max(40).optional(),
        payment_status: z.string().max(40).optional(),
        tracking_number: z.string().max(120).optional().or(z.literal("")),
        admin_notes: z.string().max(2000).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const { id, ...rest } = data;
    await db.from("orders").update(rest).eq("id", id);
    return { ok: true as const };
  });

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data } = await db.from("settings").select("key, value");
    const out: Record<string, string> = {};
    for (const row of data ?? []) out[row.key] = row.value ?? "";
    return out;
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ values: z.record(z.string(), z.string().max(2000)) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminDb(context);
    const rows = Object.entries(data.values).map(([key, value]) => ({ key, value }));
    if (rows.length) await db.from("settings").upsert(rows, { onConflict: "key" });
    return { ok: true as const };
  });
