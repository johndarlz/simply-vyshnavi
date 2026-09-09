import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vyshnavi Collections" },
      { name: "description", content: "How Vyshnavi Collections collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Vyshnavi Collections" },
      { property: "og:description", content: "How Vyshnavi Collections collects, uses and protects your personal information." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      intro="This Privacy Policy explains how Vyshnavi Collections collects, uses, stores and protects your personal information when you browse our website, place an order or contact us. By using our website, you agree to the practices described here."
      lastUpdated="9 September 2026"
      sections={[
        {
          heading: "1. Information we collect",
          paragraphs: [
            "We collect only the information needed to process and deliver your order: your name, phone number, delivery address, email address (if provided), and the products you purchase.",
            "We also collect non-personal usage data such as your IP address, browser type, device information and pages visited, which helps us improve the shopping experience.",
          ],
        },
        {
          heading: "2. How we use your information",
          paragraphs: [
            "Your contact and address details are used to confirm orders, arrange shipping, communicate delivery updates and provide customer support.",
            "We may use your email or phone number to send order-related updates. We do not send promotional messages unless you have explicitly opted in.",
          ],
        },
        {
          heading: "3. Payments",
          paragraphs: [
            "We never store your card, UPI, net banking or wallet credentials. Online payments are processed directly by Razorpay, our licensed payment gateway, under their own privacy and security standards.",
            "For Cash on Delivery orders, we only record the order value and delivery details required to fulfil the shipment.",
          ],
        },
        {
          heading: "4. Sharing with third parties",
          paragraphs: [
            "We share your delivery details with trusted courier and logistics partners solely for the purpose of shipping your order.",
            "We do not sell, rent or trade your personal information to any other third party for marketing purposes.",
          ],
        },
        {
          heading: "5. Data storage and security",
          paragraphs: [
            "Your information is stored on secure cloud infrastructure with access limited to authorised personnel. We use industry-standard encryption for data in transit.",
            "While we take reasonable steps to protect your data, no online service can guarantee absolute security. Please keep your order confirmation details confidential.",
          ],
        },
        {
          heading: "6. Cookies and tracking",
          paragraphs: [
            "Our website uses essential cookies to keep your cart and session working. We do not use tracking cookies for advertising or behavioural profiling.",
            "You can disable cookies in your browser, but some features such as the shopping cart may not work correctly.",
          ],
        },
        {
          heading: "7. Your rights",
          paragraphs: [
            "You may request access to, correction of, or deletion of your personal information by contacting us on WhatsApp or email. We will respond within a reasonable time and may ask you to verify your identity.",
          ],
        },
        {
          heading: "8. Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time. The latest version will always be available on this page with the updated date.",
          ],
        },
        {
          heading: "9. Contact us",
          paragraphs: [
            "If you have any questions about this Privacy Policy or how your data is handled, please reach out through the Contact page or message us on WhatsApp.",
          ],
        },
      ]}
    />
  ),
});
