import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreShell } from "@/components/store/StoreShell";
import { settingsQuery } from "@/lib/store-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Vyshnavi Collections" },
      { name: "description", content: "Vyshnavi Collections is a small premium boutique built on carefully selected pieces and simple, honest service." },
      { property: "og:title", content: "About Us — Vyshnavi Collections" },
      { property: "og:description", content: "A small premium boutique built on carefully selected pieces and honest service." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery(settingsQuery);
  return (
    <StoreShell>
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <h1 className="font-display text-4xl">About Us</h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          {settings?.["store_description"] ??
            "A small premium boutique offering carefully selected pieces for everyday elegance."}
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Every piece in the collection is chosen by hand. We keep the range small so that quality stays high, and we
          keep ordering simple — buy on the website, or send us a message on WhatsApp and we will take it from there.
        </p>
        <p className="mt-8 font-display text-2xl">{settings?.["store_tagline"] ?? "Simple. Elegant. Yours."}</p>
      </div>
    </StoreShell>
  );
}
