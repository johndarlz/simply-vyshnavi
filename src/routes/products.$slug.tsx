import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, MessageCircle, Share2 } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { getProduct } from "@/lib/shop.functions";
import { settingsQuery } from "@/lib/store-data";
import { discountPercent, inr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { productOrderMessage, productUrl, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => getProduct({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — Vyshnavi Collections" }, { name: "robots", content: "noindex" }] };
    }
    const title = loaderData.seo_title || `${loaderData.name} — Vyshnavi Collections`;
    const description =
      loaderData.seo_description || (loaderData.description ?? "").slice(0, 155) || "Shop at Vyshnavi Collections.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  errorComponent: () => (
    <StoreShell>
      <p className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">
        Something went wrong. Please try again.
      </p>
    </StoreShell>
  ),
  notFoundComponent: () => (
    <StoreShell>
      <p className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">This product is unavailable.</p>
    </StoreShell>
  ),
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { data: settings } = useQuery(settingsQuery);
  const { add } = useCart();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeMedia, setActiveMedia] = useState(0);

  const media = useMemo(() => {
    if (!product) return [] as { type: "image" | "video"; url: string }[];
    const images = [...(product.product_images ?? [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((i) => ({ type: "image" as const, url: i.image_url }));
    const videos = (product.product_videos ?? []).map((v) => ({ type: "video" as const, url: v.video_url }));
    return [...images, ...videos];
  }, [product]);

  const variantGroups = useMemo(() => {
    type Variant = NonNullable<typeof product>["product_variants"][number];
    const groups: Record<string, Variant[]> = {};
    for (const v of product?.product_variants ?? []) {
      groups[v.type] = [...(groups[v.type] ?? []), v];
    }
    return groups;
  }, [product]);

  if (!product) {
    return (
      <StoreShell>
        <p className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">This product is unavailable.</p>
      </StoreShell>
    );
  }

  const price = Number(product.price);
  const original = product.original_price ? Number(product.original_price) : null;
  const off = discountPercent(price, original);
  const inStock = product.stock > 0;
  const variantTypes = Object.keys(variantGroups);
  const variantLabel = variantTypes
    .map((t) => (selected[t] ? `${t}: ${selected[t]}` : null))
    .filter(Boolean)
    .join(", ");
  const allVariantsChosen = variantTypes.every((t) => selected[t]);

  const requireVariants = () => {
    if (!allVariantsChosen) {
      toast.error("Please select " + variantTypes.filter((t) => !selected[t]).join(" and "));
      return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!requireVariants()) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: media[0]?.url ?? null,
      price,
      codCharge: Number(product.cod_charge),
      variant: variantLabel,
      quantity,
    });
    toast.success("Added to cart");
  };

  const buyNow = () => {
    if (!requireVariants()) return;
    addToCart();
    navigate({ to: "/checkout" });
  };

  const waMessage = productOrderMessage({
    storeName: settings?.["store_name"] ?? "Vyshnavi Collections",
    productName: product.name,
    productId: product.sku ?? product.slug,
    variant: variantLabel,
    quantity,
    price,
    url: productUrl(product.slug),
  });

  const info: [string, string | null | undefined][] = [
    ["Category", product.categories?.name],
    ["SKU", product.sku],
    ["Material", product.material],
    ["Dimensions", product.dimensions],
    ["Weight", product.weight],
    ["Care", product.care_instructions],
    ["Delivery", product.delivery_info],
  ];

  return (
    <StoreShell>
      <article className="mx-auto max-w-6xl px-4 py-6 md:py-12">
        <nav className="mb-4 text-xs text-muted-foreground">
          <Link to="/products" className="hover:text-foreground">
            Collections
          </Link>{" "}
          / {product.name}
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-secondary">
              {media[activeMedia]?.type === "video" ? (
                <video src={media[activeMedia]!.url} controls muted playsInline preload="none" className="w-full" />
              ) : media[activeMedia] ? (
                <img
                  src={media[activeMedia]!.url}
                  alt={product.name}
                  width={800}
                  height={1000}
                  className="aspect-[4/5] w-full cursor-zoom-in object-cover"
                  onClick={() => window.open(media[activeMedia]!.url, "_blank")}
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
            {media.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {media.map((m, i) => (
                  <button
                    key={m.url + i}
                    type="button"
                    onClick={() => setActiveMedia(i)}
                    className={`h-20 w-16 shrink-0 overflow-hidden rounded-md border ${i === activeMedia ? "border-primary" : "border-border"}`}
                  >
                    {m.type === "video" ? (
                      <span className="flex h-full items-center justify-center bg-secondary text-[10px]">Video</span>
                    ) : (
                      <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl md:text-4xl">{product.name}</h1>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-semibold">{inr(price)}</span>
                {original ? <span className="text-muted-foreground line-through">{inr(original)}</span> : null}
                {off ? <span className="text-sm font-medium text-primary">{off}% OFF</span> : null}
              </div>
              <p className={`mt-2 text-sm ${inStock ? "text-muted-foreground" : "text-destructive"}`}>
                {inStock ? `In stock · ${product.stock} available` : "Out of Stock"}
              </p>
            </div>

            {product.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            ) : null}

            {variantTypes.map((type) => (
              <div key={type}>
                <p className="mb-2 text-xs tracking-luxe text-muted-foreground">{type}</p>
                <div className="flex flex-wrap gap-2">
                  {(variantGroups[type] ?? []).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelected((s) => ({ ...s, [type]: v.name }))}
                      className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                        selected[type] === v.name
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <span className="text-xs tracking-luxe text-muted-foreground">Qty</span>
              <div className="flex items-center rounded-md border border-border">
                <button type="button" className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="hidden gap-3 md:flex">
              <OrderButtons
                inStock={inStock}
                allowWebsite={product.allow_website_order}
                allowWhatsapp={product.allow_whatsapp_order}
                whatsappHref={whatsappLink(settings?.["whatsapp_number"] ?? "", waMessage)}
                onBuy={buyNow}
                onAdd={addToCart}
              />
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-4 text-sm shadow-soft">
              <p className="mb-3 text-xs tracking-luxe text-muted-foreground">Product Information</p>
              <dl className="space-y-2">
                {info
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                {Number(product.cod_charge) > 0 ? (
                  <div className="flex gap-3">
                    <dt className="w-28 shrink-0 text-muted-foreground">COD charge</dt>
                    <dd>{inr(product.cod_charge)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <ShareRow
              name={product.name}
              url={productUrl(product.slug)}
              whatsappNumber={settings?.["whatsapp_number"] ?? ""}
            />
          </div>
        </div>
      </article>

      <div className="fixed inset-x-0 bottom-16 z-30 flex gap-2 border-t border-border/70 bg-background/98 p-3 backdrop-blur md:hidden">
        <OrderButtons
          inStock={inStock}
          allowWebsite={product.allow_website_order}
          allowWhatsapp={product.allow_whatsapp_order}
          whatsappHref={whatsappLink(settings?.["whatsapp_number"] ?? "", waMessage)}
          onBuy={buyNow}
          onAdd={addToCart}
        />
      </div>
    </StoreShell>
  );
}

function OrderButtons({
  inStock,
  allowWebsite,
  allowWhatsapp,
  whatsappHref,
  onBuy,
  onAdd,
}: {
  inStock: boolean;
  allowWebsite: boolean;
  allowWhatsapp: boolean;
  whatsappHref: string;
  onBuy: () => void;
  onAdd: () => void;
}) {
  return (
    <>
      {allowWebsite ? (
        <>
          <button
            type="button"
            onClick={onBuy}
            disabled={!inStock}
            className="flex-1 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {inStock ? "Order Now" : "Out of Stock"}
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={!inStock}
            className="hidden rounded-md border border-foreground/20 px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-40 md:block"
          >
            Add to Cart
          </button>
        </>
      ) : null}
      {allowWhatsapp ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-medium text-whatsapp-foreground transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" /> Order on WhatsApp
        </a>
      ) : null}
    </>
  );
}

function ShareRow({ name, url, whatsappNumber }: { name: string; url: string; whatsappNumber: string }) {
  const [copied, setCopied] = useState(false);
  void whatsappNumber;
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-xs tracking-luxe text-muted-foreground">Share</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${name}\n${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title: name, url });
              return;
            } catch {
              /* fall through to copy */
            }
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Link copied");
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Copied" : "Share link"}
      </button>
    </div>
  );
}
