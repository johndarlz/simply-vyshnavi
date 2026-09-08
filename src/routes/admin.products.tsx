import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminSaveProduct,
  adminSetProductActive,
  type AdminProduct,
} from "@/lib/admin.functions";
import { inr, slugify } from "@/lib/format";
import { uploadMedia } from "@/lib/upload";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type VariantDraft = { type: string; name: string; price_adjustment: number; stock: number; sku: string };
type Draft = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string;
  price: number;
  original_price: number | null;
  cod_charge: number;
  stock: number;
  low_stock_threshold: number;
  material: string;
  dimensions: string;
  weight: string;
  care_instructions: string;
  delivery_info: string;
  seo_title: string;
  seo_description: string;
  featured: boolean;
  new_arrival: boolean;
  bestseller: boolean;
  active: boolean;
  allow_website_order: boolean;
  allow_whatsapp_order: boolean;
  images: string[];
  videoUrl: string;
  variants: VariantDraft[];
};

const blank: Draft = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  category_id: "",
  price: 0,
  original_price: null,
  cod_charge: 0,
  stock: 0,
  low_stock_threshold: 3,
  material: "",
  dimensions: "",
  weight: "",
  care_instructions: "",
  delivery_info: "",
  seo_title: "",
  seo_description: "",
  featured: false,
  new_arrival: true,
  bestseller: false,
  active: true,
  allow_website_order: true,
  allow_whatsapp_order: true,
  images: [],
  videoUrl: "",
  variants: [],
};

function toDraft(p: AdminProduct): Draft {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? "",
    description: p.description ?? "",
    category_id: p.category_id ?? "",
    price: Number(p.price),
    original_price: p.original_price === null ? null : Number(p.original_price),
    cod_charge: Number(p.cod_charge ?? 0),
    stock: Number(p.stock ?? 0),
    low_stock_threshold: Number(p.low_stock_threshold ?? 0),
    material: p.material ?? "",
    dimensions: p.dimensions ?? "",
    weight: p.weight ?? "",
    care_instructions: p.care_instructions ?? "",
    delivery_info: p.delivery_info ?? "",
    seo_title: p.seo_title ?? "",
    seo_description: p.seo_description ?? "",
    featured: p.featured,
    new_arrival: p.new_arrival,
    bestseller: p.bestseller,
    active: p.active,
    allow_website_order: p.allow_website_order,
    allow_whatsapp_order: p.allow_whatsapp_order,
    images: [...(p.product_images ?? [])]
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
      .map((i) => i.image_url),
    videoUrl: p.product_videos?.[0]?.video_url ?? "",
    variants: [...(p.product_variants ?? [])]
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
      .map((v) => ({
        type: v.type,
        name: v.name,
        price_adjustment: Number(v.price_adjustment ?? 0),
        stock: Number(v.stock ?? 0),
        sku: v.sku ?? "",
      })),
  };
}

function ProductsPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: products = [] } = useQuery({ queryKey: ["admin", "products"], queryFn: () => adminListProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => adminListCategories() });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const refresh = () => void qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      refresh();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => adminSetProductActive({ data: v }),
    onSuccess: refresh,
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  if (draft) {
    return (
      <ProductForm
        draft={draft}
        categories={categories}
        onCancel={() => setDraft(null)}
        onSaved={() => {
          setDraft(null);
          refresh();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Products</h1>
        <button
          type="button"
          onClick={() => setDraft(blank)}
          className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground"
        >
          + Add Product
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or SKU"
        className="mt-4 w-full max-w-sm rounded-md border border-input bg-card px-3 py-2 text-sm"
      />

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs tracking-luxe text-muted-foreground">
            <tr>
              <th className="p-3">PRODUCT</th>
              <th className="p-3">PRICE</th>
              <th className="p-3">COD</th>
              <th className="p-3">STOCK</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <span className="font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.sku ?? "—"}</span>
                </td>
                <td className="p-3">{inr(Number(p.price))}</td>
                <td className="p-3">{inr(Number(p.cod_charge ?? 0))}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.active ? "Active" : "Hidden"}</td>
                <td className="space-x-3 p-3 whitespace-nowrap">
                  <button type="button" className="text-primary underline" onClick={() => setDraft(toDraft(p))}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => toggle.mutate({ id: p.id, active: !p.active })}
                  >
                    {p.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      const copy = toDraft(p);
                      delete copy.id;
                      setDraft({ ...copy, name: `${copy.name} (Copy)`, slug: `${copy.slug}-copy`, sku: "" });
                    }}
                  >
                    Duplicate
                  </button>
                  <button type="button" className="text-destructive underline" onClick={() => remove.mutate(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({
  draft: initial,
  categories,
  onCancel,
  onSaved,
}: {
  draft: Draft;
  categories: { id: string; name: string }[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      adminSaveProduct({
        data: {
          ...(draft.id ? { id: draft.id } : {}),
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          sku: draft.sku,
          description: draft.description,
          category_id: draft.category_id || null,
          price: Number(draft.price),
          original_price: draft.original_price === null ? null : Number(draft.original_price),
          cod_charge: Number(draft.cod_charge),
          stock: Number(draft.stock),
          low_stock_threshold: Number(draft.low_stock_threshold),
          material: draft.material,
          dimensions: draft.dimensions,
          weight: draft.weight,
          care_instructions: draft.care_instructions,
          delivery_info: draft.delivery_info,
          seo_title: draft.seo_title,
          seo_description: draft.seo_description,
          featured: draft.featured,
          new_arrival: draft.new_arrival,
          bestseller: draft.bestseller,
          active: draft.active,
          allow_website_order: draft.allow_website_order,
          allow_whatsapp_order: draft.allow_whatsapp_order,
          images: draft.images,
          videoUrl: draft.videoUrl,
          variants: draft.variants.map((v) => ({
            type: v.type,
            name: v.name,
            price_adjustment: Number(v.price_adjustment),
            stock: Number(v.stock),
            sku: v.sku,
          })),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Product published successfully.");
      onSaved();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleFiles = async (files: FileList | null, kind: "image" | "video") => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadMedia(file));
      if (kind === "image") setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
      else setDraft((d) => ({ ...d, videoUrl: urls[0] ?? d.videoUrl }));
      toast.success("Upload complete");
    } catch {
      toast.error("Upload failed. Please try a smaller file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="max-w-3xl space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{draft.id ? "Edit Product" : "Add Product"}</h1>
        <button type="button" onClick={onCancel} className="text-sm underline">
          Back
        </button>
      </div>

      <Card title="Product Media">
        <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files, "image")} className="text-sm" />
        {draft.images.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {draft.images.map((url, i) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-24 w-20 rounded-md object-cover" />
                {i === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[10px] text-primary-foreground">
                    Primary
                  </span>
                ) : null}
                <div className="mt-1 flex gap-1 text-[11px]">
                  {i > 0 ? (
                    <button
                      type="button"
                      className="underline"
                      onClick={() =>
                        setDraft((d) => {
                          const next = [...d.images];
                          const item = next.splice(i, 1)[0]!;
                          next.splice(i - 1, 0, item);
                          return { ...d, images: next };
                        })
                      }
                    >
                      ←
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-destructive underline"
                    onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((u) => u !== url) }))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Product video (optional)</p>
          <input type="file" accept="video/*" onChange={(e) => handleFiles(e.target.files, "video")} className="mt-1 text-sm" />
          {draft.videoUrl ? (
            <p className="mt-1 text-xs">
              Video added ·{" "}
              <button type="button" className="text-destructive underline" onClick={() => set("videoUrl", "")}>
                Remove
              </button>
            </p>
          ) : null}
        </div>
        {uploading ? <p className="mt-2 text-xs text-muted-foreground">Uploading…</p> : null}
      </Card>

      <Card title="Basic Information">
        <Grid>
          <Text label="Product Name" required value={draft.name} onChange={(v) => set("name", v)} />
          <Text label="Slug (auto)" value={draft.slug} onChange={(v) => set("slug", v)} placeholder={slugify(draft.name)} />
          <Text label="Product ID / SKU" value={draft.sku} onChange={(v) => set("sku", v)} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">Category</span>
            <select
              value={draft.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </Grid>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-xs text-muted-foreground">Description</span>
          <textarea
            rows={4}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
      </Card>

      <Card title="Pricing & Inventory">
        <Grid>
          <Num label="Selling Price (₹)" value={draft.price} onChange={(v) => set("price", v)} />
          <Num
            label="Original Price (₹)"
            value={draft.original_price ?? 0}
            onChange={(v) => set("original_price", v || null)}
          />
          <Num label="COD Extra Charge (₹)" value={draft.cod_charge} onChange={(v) => set("cod_charge", v)} />
          <Num label="Stock Quantity" value={draft.stock} onChange={(v) => set("stock", v)} />
          <Num label="Low Stock Alert" value={draft.low_stock_threshold} onChange={(v) => set("low_stock_threshold", v)} />
        </Grid>
      </Card>

      <Card title="Variants">
        {draft.variants.map((v, i) => (
          <div key={i} className="mb-2 grid gap-2 sm:grid-cols-6">
            <input
              value={v.type}
              onChange={(e) =>
                setDraft((d) => ({ ...d, variants: d.variants.map((x, j) => (i === j ? { ...x, type: e.target.value } : x)) }))
              }
              placeholder="Type (Color)"
              className="rounded-md border border-input px-2 py-1.5 text-sm"
            />
            <input
              value={v.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, variants: d.variants.map((x, j) => (i === j ? { ...x, name: e.target.value } : x)) }))
              }
              placeholder="Value (Pink)"
              className="rounded-md border border-input px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              value={v.price_adjustment}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  variants: d.variants.map((x, j) => (i === j ? { ...x, price_adjustment: Number(e.target.value) } : x)),
                }))
              }
              placeholder="± ₹"
              className="rounded-md border border-input px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              value={v.stock}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  variants: d.variants.map((x, j) => (i === j ? { ...x, stock: Number(e.target.value) } : x)),
                }))
              }
              placeholder="Stock"
              className="rounded-md border border-input px-2 py-1.5 text-sm"
            />
            <input
              value={v.sku}
              onChange={(e) =>
                setDraft((d) => ({ ...d, variants: d.variants.map((x, j) => (i === j ? { ...x, sku: e.target.value } : x)) }))
              }
              placeholder="SKU"
              className="rounded-md border border-input px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              className="text-sm text-destructive underline"
              onClick={() => setDraft((d) => ({ ...d, variants: d.variants.filter((_, j) => j !== i) }))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              variants: [...d.variants, { type: "Size", name: "", price_adjustment: 0, stock: 0, sku: "" }],
            }))
          }
        >
          + Add Variant
        </button>
      </Card>

      <Card title="Product Details (optional)">
        <Grid>
          <Text label="Material" value={draft.material} onChange={(v) => set("material", v)} />
          <Text label="Dimensions" value={draft.dimensions} onChange={(v) => set("dimensions", v)} />
          <Text label="Weight" value={draft.weight} onChange={(v) => set("weight", v)} />
          <Text label="Care Instructions" value={draft.care_instructions} onChange={(v) => set("care_instructions", v)} />
          <Text label="Delivery Information" value={draft.delivery_info} onChange={(v) => set("delivery_info", v)} />
          <Text label="SEO Title" value={draft.seo_title} onChange={(v) => set("seo_title", v)} />
          <Text label="SEO Description" value={draft.seo_description} onChange={(v) => set("seo_description", v)} />
        </Grid>
      </Card>

      <Card title="Settings">
        <div className="grid gap-2 sm:grid-cols-2">
          <Check label="Featured Product" checked={draft.featured} onChange={(v) => set("featured", v)} />
          <Check label="New Arrival" checked={draft.new_arrival} onChange={(v) => set("new_arrival", v)} />
          <Check label="Bestseller" checked={draft.bestseller} onChange={(v) => set("bestseller", v)} />
          <Check label="Active" checked={draft.active} onChange={(v) => set("active", v)} />
          <Check label="Allow Website Orders" checked={draft.allow_website_order} onChange={(v) => set("allow_website_order", v)} />
          <Check label="Allow WhatsApp Orders" checked={draft.allow_whatsapp_order} onChange={(v) => set("allow_whatsapp_order", v)} />
        </div>
      </Card>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={save.isPending || uploading}
          className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Publish Product"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-border px-6 py-3 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <p className="mb-3 text-xs tracking-luxe text-muted-foreground">{title.toUpperCase()}</p>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Text({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        required={required ?? false}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
