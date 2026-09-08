import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { settingsQuery } from "@/lib/store-data";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Vyshnavi Collections" },
      { name: "description", content: "Call, email or message Vyshnavi Collections on WhatsApp for orders and enquiries." },
      { property: "og:title", content: "Contact — Vyshnavi Collections" },
      { property: "og:description", content: "Call, email or message us on WhatsApp for orders and enquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);
  const phone = settings?.["store_phone"] ?? "";
  const wa = settings?.["whatsapp_number"] ?? "";

  return (
    <StoreShell>
      <div className="mx-auto max-w-xl px-4 py-12 md:py-20">
        <h1 className="font-display text-4xl">{settings?.["store_name"] ?? "Vyshnavi Collections"}</h1>
        <p className="mt-2 text-muted-foreground">We usually reply within a few hours.</p>

        <div className="mt-8 space-y-4 rounded-lg border border-border/70 bg-card p-6 text-sm shadow-soft">
          <p className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary" /> {phone}
          </p>
          <p className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4 text-primary" /> +{wa}
          </p>
          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary" /> {settings?.["store_email"]}
          </p>
          <p className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" /> {settings?.["store_address"]}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappLink(wa, `Hello ${settings?.["store_name"] ?? "Vyshnavi Collections"} 👋`)}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-whatsapp px-6 py-3 text-sm font-medium text-whatsapp-foreground"
          >
            Chat on WhatsApp
          </a>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="rounded-md border border-foreground/20 px-6 py-3 text-sm">
            Call Us
          </a>
        </div>
      </div>
    </StoreShell>
  );
}
