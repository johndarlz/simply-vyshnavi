import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  notes: z.string().trim().max(6000).default(""),
  imageUrls: z.array(z.string().url()).max(3).default([]),
  categories: z.array(z.string()).max(50).default([]),
});

const Draft = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  sku: z.string(),
  price: z.number(),
  original_price: z.number(),
  material: z.string(),
  dimensions: z.string(),
  weight: z.string(),
  care_instructions: z.string(),
  delivery_info: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  variants: z
    .array(z.object({ type: z.string(), name: z.string() }))
    .max(12),
});

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > 6_000_000) return null;
    let binary = "";
    for (let i = 0; i < buf.length; i += 0x8000) {
      binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    }
    return `data:${type};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export const aiFillProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI is not configured yet." };

    if (!data.notes && data.imageUrls.length === 0) {
      return { ok: false as const, error: "Add a photo or paste some details first." };
    }

    const images = (await Promise.all(data.imageUrls.slice(0, 3).map(toDataUrl))).filter(
      (v): v is string => Boolean(v),
    );

    const content: any[] = [
      {
        type: "text",
        text: [
          "You write product listings for an Indian online boutique called Vyshnavi Collections.",
          "From the photo(s) and the pasted notes, produce clean, accurate, elegant listing content in English.",
          "Rules: never invent prices — if a price is not in the notes, return 0. Keep the description 40-90 words, warm and premium, no emojis, no ALL CAPS.",
          "seo_title max 60 chars, seo_description max 155 chars.",
          "Only suggest variants (like Size or Colour) if the notes or photo clearly imply them, otherwise return an empty list.",
          data.categories.length
            ? `Pick the best matching category from this list, or return "" if none fit: ${data.categories.join(", ")}.`
            : 'Return "" for category.',
          "",
          "Pasted details from the seller:",
          data.notes || "(none)",
        ].join("\n"),
      },
      ...images.map((url) => ({ type: "image_url", image_url: { url } })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "user", content }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_draft",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "name",
                "description",
                "category",
                "sku",
                "price",
                "original_price",
                "material",
                "dimensions",
                "weight",
                "care_instructions",
                "delivery_info",
                "seo_title",
                "seo_description",
                "variants",
              ],
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                sku: { type: "string" },
                price: { type: "number" },
                original_price: { type: "number" },
                material: { type: "string" },
                dimensions: { type: "string" },
                weight: { type: "string" },
                care_instructions: { type: "string" },
                delivery_info: { type: "string" },
                seo_title: { type: "string" },
                seo_description: { type: "string" },
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["type", "name"],
                    properties: { type: { type: "string" }, name: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      }),
    });

    if (res.status === 429) return { ok: false as const, error: "AI is busy right now. Please try again in a moment." };
    if (res.status === 402)
      return { ok: false as const, error: "AI credits are exhausted. Please add credits to continue." };
    if (!res.ok) return { ok: false as const, error: "AI could not read those details. Please try again." };

    try {
      const json: any = await res.json();
      const text = json?.choices?.[0]?.message?.content ?? "";
      const parsed = Draft.parse(JSON.parse(text));
      return { ok: true as const, draft: parsed };
    } catch {
      return { ok: false as const, error: "AI could not read those details. Please try again." };
    }
  });
