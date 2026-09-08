import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductCard } from "@/components/store/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/store-data";

type Search = { q?: string | undefined; category?: string | undefined; sort?: string | undefined };

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Collections — Vyshnavi Collections" },
      {
        name: "description",
        content: "Browse every piece in the Vyshnavi Collections boutique — kurtis, sarees, jewellery and accessories.",
      },
      { property: "og:title", content: "All Collections — Vyshnavi Collections" },
      { property: "og:description", content: "Browse every piece in the Vyshnavi Collections boutique." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const { data: products, isPending } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  const setSearch = (patch: Partial<Search>) =>
    navigate({ search: (prev: Search) => ({ ...prev, ...patch }) });

  const term = (search.q ?? "").toLowerCase().trim();
  const categoryId = categories?.find((c) => c.slug === search.category)?.id;

  let list = (products ?? []).filter((p) => {
    if (categoryId && p.category_id !== categoryId) return false;
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      (p.sku ?? "").toLowerCase().includes(term) ||
      (categories?.find((c) => c.id === p.category_id)?.name.toLowerCase().includes(term) ?? false)
    );
  });

  const sort = search.sort ?? "newest";
  list = [...list].sort((a, b) => {
    if (sort === "price_asc") return Number(a.price) - Number(b.price);
    if (sort === "price_desc") return Number(b.price) - Number(a.price);
    if (sort === "popular") return Number(b.bestseller) - Number(a.bestseller);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <StoreShell>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl">All Collections</h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything currently available in the boutique.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <input
            value={search.q ?? ""}
            onChange={(e) => setSearch({ q: e.target.value || undefined })}
            placeholder="Search by name, SKU or category"
            className="rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary sm:col-span-1"
          />
          <select
            value={search.category ?? ""}
            onChange={(e) => setSearch({ category: e.target.value || undefined })}
            className="rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSearch({ sort: e.target.value })}
            className="rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {!isPending && list.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
            New collections are coming soon ✨
          </p>
        ) : null}
      </div>
    </StoreShell>
  );
}
