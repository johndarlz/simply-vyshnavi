import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Vyshnavi Collections" },
      { name: "description", content: "Shipping timelines, charges and coverage for Vyshnavi Collections orders." },
      { property: "og:title", content: "Shipping Policy — Vyshnavi Collections" },
      { property: "og:description", content: "Shipping timelines, charges and coverage for our orders." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Shipping Policy"
      paragraphs={[
        "Orders are packed within 1–2 working days of confirmation and delivered in 3–7 working days depending on your location.",
        "Shipping charges are shown at checkout. Orders above the free-shipping threshold set by the store ship free.",
        "Cash on Delivery is available across India; a handling charge may apply and is shown before you place the order.",
        "Once your parcel is dispatched, the tracking number appears on the Track Order page.",
      ]}
    />
  ),
});
