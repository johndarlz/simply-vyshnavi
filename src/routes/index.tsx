import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, ShieldCheck, MessageCircle, Sparkles, BadgeIndianRupee } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductCard } from "@/components/store/ProductCard";
import { categoriesQuery, productsQuery, settingsQuery } from "@/lib/store-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vyshnavi Collections — Simple. Elegant. Yours." },
      {
        name: "description",
        content:
          "Discover kurtis, sarees, jewellery and accessories chosen for everyday elegance. Easy ordering on the website or over WhatsApp, with COD across India.",
      },
      { property: "og:title", content: "Vyshnavi Collections — Simple. Elegant. Yours." },
      {
        property: "og:description",
        content: "A small premium boutique of carefully selected pieces for everyday elegance.",
      },
    ],
  }),
  component: HomePage,
});

const trustPoints = [
  { icon: Sparkles, label: "Carefully selected products" },
  { icon: BadgeIndianRupee, label: "Easy ordering" },
  { icon: ShieldCheck, label: "Secure online payments" },
  { icon: Truck, label: "COD available" },
  { icon: MessageCircle, label: "WhatsApp support" },
];

function HomePage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  const featured = (products ?? []).filter((p) => p.featured).slice(0, 8);
  const newArrivals = (products ?? []).filter((p) => p.new_arrival).slice(0, 4);
  const hero = settings?.["hero_banner_url"] || "/images/hero.jpg";

  return (
    <StoreShell>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <p className="text-xs tracking-luxe text-primary">{settings?.["store_tagline"] ?? "Simple. Elegant. Yours."}</p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
              Discover something beautiful.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Explore our latest collection of carefully selected products, made for everyday elegance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Shop Now
              </Link>
              <Link
                to="/products"
                search={{ q: undefined, category: undefined, sort: "newest" }}
                className="rounded-md border border-foreground/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Explore Collections
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl bg-secondary">
            <img src={hero} alt="Vyshnavi Collections" width={1600} height={1100} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <Section title="Featured Collection" href="/products">
        <Grid>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Grid>
        {featured.length === 0 ? <Empty /> : null}
      </Section>

      {newArrivals.length > 0 ? (
        <Section title="New Arrivals" href="/products">
          <Grid>
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {categories && categories.length > 0 ? (
        <Section title="Shop by Category">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/products"
                search={{ q: undefined, category: c.slug, sort: undefined }}
                className="group overflow-hidden rounded-lg border border-border/70 bg-card shadow-soft"
              >
                <div className="aspect-square overflow-hidden bg-secondary">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="p-3 text-center font-display text-lg">{c.name}</p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-xl border border-border/70 bg-card p-8 text-center shadow-soft">
          <h2 className="font-display text-3xl">A boutique, not a marketplace</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {settings?.["store_description"] ??
              "A small premium boutique offering carefully selected pieces for everyday elegance."}
          </p>
        </div>
      </section>

      <Section title="Why Shop With Us">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {trustPoints.map((t) => (
            <div key={t.label} className="rounded-lg border border-border/70 bg-card p-5 text-center shadow-soft">
              <t.icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </StoreShell>
  );
}

function Section({ title, href, children }: { title: string; href?: "/products"; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
        {href ? (
          <Link to={href} className="text-sm text-primary hover:underline">
            View all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{children}</div>;
}

function Empty() {
  return (
    <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
      New collections are coming soon ✨
    </p>
  );
}
