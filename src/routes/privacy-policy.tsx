import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vyshnavi Collections" },
      { name: "description", content: "How Vyshnavi Collections collects and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Vyshnavi Collections" },
      { property: "og:description", content: "How we collect and protect your personal information." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      paragraphs={[
        "We collect only the details needed to deliver your order: name, phone number, delivery address and, optionally, your email.",
        "We never store card or UPI credentials. Online payments are handled entirely by the payment gateway.",
        "Your details are never sold or shared with third parties, except with delivery partners for shipping your order.",
        "To have your details removed from our records, message us on WhatsApp or email the store.",
      ]}
    />
  ),
});
