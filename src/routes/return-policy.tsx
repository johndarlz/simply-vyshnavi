import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy — Vyshnavi Collections" },
      { name: "description", content: "Return, refund and exchange policy for Vyshnavi Collections." },
      { property: "og:title", content: "Return & Refund Policy — Vyshnavi Collections" },
      { property: "og:description", content: "Return, refund and exchange policy for Vyshnavi Collections." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Return & Refund Policy"
      intro="We want you to be happy with your purchase. This policy explains when and how you can return a product or request a refund."
      lastUpdated="9 September 2026"
      sections={[
        {
          heading: "1. Return eligibility",
          paragraphs: [
            "Returns are accepted only for defective, damaged or incorrect items. Products must be unused, unworn and in their original packaging with tags attached.",
            "Personal care items, jewellery and intimate apparel cannot be returned for hygiene reasons unless they arrive damaged or defective.",
          ],
        },
        {
          heading: "2. How to request a return",
          paragraphs: [
            "Contact us on WhatsApp or email within 48 hours of delivery with your order number and clear photos of the issue. We will review your request and confirm the next steps.",
            "Please do not ship anything back unless we have approved the return and provided a return address or pickup arrangement.",
          ],
        },
        {
          heading: "3. Refunds",
          paragraphs: [
            "Approved refunds are processed to the original payment method within 5 to 10 business days after we receive and inspect the returned item.",
            "Cash on Delivery refunds are issued via UPI or bank transfer to the account details you provide.",
          ],
        },
        {
          heading: "4. Exchanges",
          paragraphs: [
            "Exchanges are subject to stock availability. If the requested replacement is unavailable, we will offer a refund or store credit as agreed with you.",
          ],
        },
        {
          heading: "5. Non-returnable situations",
          paragraphs: [
            "We cannot accept returns for change of mind, minor colour differences due to screen settings, or products that have been used, washed or altered after delivery.",
          ],
        },
      ]}
    />
  ),
});
