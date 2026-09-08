import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy — Vyshnavi Collections" },
      { name: "description", content: "How returns, exchanges and refunds work at Vyshnavi Collections." },
      { property: "og:title", content: "Return & Refund Policy — Vyshnavi Collections" },
      { property: "og:description", content: "How returns, exchanges and refunds work at our boutique." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Return & Refund Policy"
      paragraphs={[
        "If a product arrives damaged or is not what you ordered, message us on WhatsApp within 48 hours of delivery with a photo and your order ID.",
        "Approved returns should be sent back unused, unwashed and with original packaging.",
        "Refunds for prepaid orders are processed to the original payment method within 5–7 working days of the return reaching us.",
        "Jewellery and accessories are eligible for replacement only in case of damage in transit.",
      ]}
    />
  ),
});
