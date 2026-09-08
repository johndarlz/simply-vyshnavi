import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Vyshnavi Collections" },
      { name: "description", content: "The terms that apply when you shop with Vyshnavi Collections." },
      { property: "og:title", content: "Terms & Conditions — Vyshnavi Collections" },
      { property: "og:description", content: "The terms that apply when you shop with us." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Terms & Conditions"
      paragraphs={[
        "Placing an order on this website or over WhatsApp constitutes an offer to purchase, which we confirm once stock and address are verified.",
        "Prices, charges and availability shown on the site may change without notice; the amount shown at checkout is the amount payable.",
        "Product colours may vary slightly from the photographs due to lighting and screen differences.",
        "Orders may be cancelled by the store if payment fails, stock is unavailable, or the delivery address is unserviceable.",
      ]}
    />
  ),
});
