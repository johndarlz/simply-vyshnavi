import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Vyshnavi Collections" },
      { name: "description", content: "Shipping, delivery and Cash on Delivery policy for Vyshnavi Collections." },
      { property: "og:title", content: "Shipping Policy — Vyshnavi Collections" },
      { property: "og:description", content: "Shipping, delivery and Cash on Delivery policy for Vyshnavi Collections." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Shipping Policy"
      intro="We deliver across India through trusted courier partners. This page explains our shipping process, timelines and charges."
      lastUpdated="9 September 2026"
      sections={[
        {
          heading: "1. Processing time",
          paragraphs: [
            "Orders are processed within 1 to 2 business days after confirmation. Orders placed on weekends or public holidays begin processing on the next working day.",
          ],
        },
        {
          heading: "2. Delivery timelines",
          paragraphs: [
            "Most metro deliveries arrive within 3 to 5 business days. Tier-2 and tier-3 cities may take 5 to 8 business days. Remote locations may take longer depending on courier connectivity.",
            "Delivery timelines are estimates and may be affected by weather, courier capacity or local restrictions.",
          ],
        },
        {
          heading: "3. Shipping charges",
          paragraphs: [
            "Shipping charges, if any, are calculated at checkout based on your delivery location and order value. Free shipping may be offered on orders above the threshold set by the store.",
          ],
        },
        {
          heading: "4. Cash on Delivery",
          paragraphs: [
            "Cash on Delivery may be available for select locations and order values. A COD handling fee, if applicable, will be shown at checkout before you confirm the order.",
          ],
        },
        {
          heading: "5. Order tracking",
          paragraphs: [
            "Once your order is dispatched, you can track it using the Track Order page and the order number sent to your phone or email.",
          ],
        },
        {
          heading: "6. Delivery issues",
          paragraphs: [
            "If your order is delayed, damaged in transit or delivered to the wrong address, please contact us on WhatsApp with your order number and we will coordinate with the courier partner to resolve it.",
          ],
        },
      ]}
    />
  ),
});
