import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/store/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Vyshnavi Collections" },
      { name: "description", content: "The terms and conditions that apply when you shop with Vyshnavi Collections." },
      { property: "og:title", content: "Terms & Conditions — Vyshnavi Collections" },
      { property: "og:description", content: "The terms and conditions that apply when you shop with Vyshnavi Collections." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Terms & Conditions"
      intro="These Terms & Conditions govern your use of the Vyshnavi Collections website and every order you place with us. Please read them carefully before making a purchase."
      lastUpdated="9 September 2026"
      sections={[
        {
          heading: "1. Acceptance of terms",
          paragraphs: [
            "By accessing or using our website, placing an order on the website or ordering through WhatsApp, you agree to be bound by these Terms & Conditions and our Privacy Policy.",
            "If you do not agree with any part of these terms, please do not use our services.",
          ],
        },
        {
          heading: "2. Ordering process",
          paragraphs: [
            "Placing an order on the website or over WhatsApp constitutes an offer to purchase. We reserve the right to accept or decline any order for any reason, including stock unavailability, pricing errors or an unserviceable delivery address.",
            "An order is confirmed only when you receive an order confirmation with a unique order number and the payment status is marked as successful or Cash on Delivery is accepted.",
          ],
        },
        {
          heading: "3. Pricing and payments",
          paragraphs: [
            "All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.",
            "Prices, shipping charges, Cash on Delivery fees and availability may change without notice. The amount shown at checkout is the amount payable for that transaction.",
            "Online payments are processed through Razorpay. You agree to comply with their terms while using their payment interface.",
          ],
        },
        {
          heading: "4. Shipping and delivery",
          paragraphs: [
            "We aim to dispatch orders within the timeframe mentioned on our Shipping Policy page. Delivery timelines are estimates and depend on the courier partner and destination.",
            "You are responsible for providing an accurate and complete delivery address. We are not liable for delays or failed delivery caused by incorrect address details.",
          ],
        },
        {
          heading: "5. Cancellation",
          paragraphs: [
            "We may cancel an order if payment fails, the product is out of stock, the delivery address is unserviceable, or we suspect fraudulent activity. In such cases, any amount paid will be refunded to the original payment method.",
            "Customers may request cancellation before dispatch by contacting us on WhatsApp. Once an order has been shipped, cancellation is no longer possible and the return process may apply.",
          ],
        },
        {
          heading: "6. Returns and refunds",
          paragraphs: [
            "Returns and refunds are handled according to our Return & Refund Policy. Please review that policy for eligibility, timelines and process details.",
          ],
        },
        {
          heading: "7. Product representations",
          paragraphs: [
            "We make every effort to display product colours, textures and details accurately. However, minor variations may occur due to lighting, photography and screen settings. Such variations do not qualify as defects.",
            "Product measurements and weights are approximate and provided for guidance only.",
          ],
        },
        {
          heading: "8. Limitation of liability",
          paragraphs: [
            "Vyshnavi Collections is not liable for any indirect, incidental or consequential damages arising from the use of our website or products beyond the value of the order placed.",
            "Our total liability for any claim shall not exceed the amount paid by you for the specific order in question.",
          ],
        },
        {
          heading: "9. Governing law and disputes",
          paragraphs: [
            "These Terms & Conditions are governed by the laws of India. Any dispute arising from your use of the website or purchase from us shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.",
            "We encourage you to contact us first so we can resolve any concern amicably.",
          ],
        },
        {
          heading: "10. Changes to these terms",
          paragraphs: [
            "We may update these Terms & Conditions at any time. Continued use of the website after changes means you accept the revised terms.",
          ],
        },
        {
          heading: "11. Contact us",
          paragraphs: [
            "For any questions about these terms, please visit our Contact page or message us on WhatsApp.",
          ],
        },
      ]}
    />
  ),
});
