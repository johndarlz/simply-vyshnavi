import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";
import { uploadMedia } from "@/lib/upload";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const groups: { title: string; fields: { key: string; label: string; type?: "text" | "textarea" | "toggle" }[] }[] = [
  {
    title: "Store",
    fields: [
      { key: "store_name", label: "Store Name" },
      { key: "store_tagline", label: "Tagline" },
      { key: "store_description", label: "Store description", type: "textarea" },
      { key: "store_phone", label: "Phone" },
      { key: "store_email", label: "Email" },
      { key: "store_address", label: "Address", type: "textarea" },
    ],
  },
  { title: "WhatsApp", fields: [{ key: "whatsapp_number", label: "WhatsApp Business Number (with country code, digits only)" }] },
  {
    title: "Payment",
    fields: [
      { key: "online_payment_enabled", label: "Enable online payment", type: "toggle" },
      { key: "payment_mode", label: "Payment mode (test / live)" },
      { key: "razorpay_key_id", label: "Razorpay Key ID" },
    ],
  },
  {
    title: "Shipping & COD",
    fields: [
      { key: "shipping_standard", label: "Standard shipping (₹)" },
      { key: "free_shipping_threshold", label: "Free shipping above (₹)" },
      { key: "cod_enabled", label: "Enable Cash on Delivery", type: "toggle" },
      { key: "cod_default_charge", label: "Default COD charge (₹)" },
    ],
  },
  {
    title: "Website",
    fields: [
      { key: "announcement_enabled", label: "Show announcement bar", type: "toggle" },
      { key: "announcement_text", label: "Announcement text" },
      { key: "hero_banner_url", label: "Hero banner image URL" },
      { key: "logo_url", label: "Logo URL" },
    ],
  },
  {
    title: "Social Media",
    fields: [
      { key: "instagram_url", label: "Instagram" },
      { key: "facebook_url", label: "Facebook" },
      { key: "youtube_url", label: "YouTube" },
    ],
  },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => adminGetSettings() });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => adminSaveSettings({ data: { values } }),
    onSuccess: () => {
      toast.success("Settings saved");
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      void qc.invalidateQueries({ queryKey: ["store", "settings"] });
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const uploadBanner = async (key: string, file?: File) => {
    if (!file) return;
    try {
      set(key, await uploadMedia(file));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Please try a smaller file.");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="max-w-2xl space-y-5"
    >
      <h1 className="font-display text-3xl">Settings</h1>

      {groups.map((group) => (
        <section key={group.title} className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <p className="mb-3 text-xs tracking-luxe text-muted-foreground">{group.title.toUpperCase()}</p>
          <div className="space-y-3">
            {group.fields.map((field) => {
              const value = values[field.key] ?? "";
              if (field.type === "toggle") {
                return (
                  <label key={field.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value === "true"}
                      onChange={(e) => set(field.key, e.target.checked ? "true" : "false")}
                    />
                    {field.label}
                  </label>
                );
              }
              return (
                <label key={field.key} className="block text-sm">
                  <span className="mb-1 block text-xs text-muted-foreground">{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={value}
                      onChange={(e) => set(field.key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) => set(field.key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  )}
                  {field.key === "hero_banner_url" || field.key === "logo_url" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void uploadBanner(field.key, e.target.files?.[0])}
                      className="mt-1 text-xs"
                    />
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <button
        type="submit"
        disabled={save.isPending}
        className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
