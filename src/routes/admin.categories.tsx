import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminDeleteCategory, adminListCategories, adminSaveCategory } from "@/lib/admin.functions";
import { slugify } from "@/lib/format";
import { uploadMedia } from "@/lib/upload";


export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Draft = { id?: string; name: string; slug: string; image_url: string; active: boolean };
const blank: Draft = { name: "", slug: "", image_url: "", active: true };

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminListCategories(),
  });
  const [draft, setDraft] = useState<Draft>(blank);
  const [uploading, setUploading] = useState(false);


  const save = useMutation({
    mutationFn: () =>
      adminSaveCategory({
        data: {
          ...(draft.id ? { id: draft.id } : {}),
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          image_url: draft.image_url,
          active: draft.active,
        },
      }),
    onSuccess: () => {
      toast.success("Category saved");
      setDraft(blank);
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteCategory({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Categories</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="mt-6 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-soft sm:grid-cols-2"
      >
        <input
          required
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Category name"
          className="rounded-md border border-input px-3 py-2 text-sm"
        />
        <input
          value={draft.slug}
          onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          placeholder="Slug (auto)"
          className="rounded-md border border-input px-3 py-2 text-sm"
        />
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Category photo (optional)</label>
          <div className="mt-2 flex items-center gap-3">
            {draft.image_url ? (
              <img src={draft.image_url} alt="Category" className="h-16 w-16 rounded-md object-cover" />
            ) : null}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setUploading(true);
                try {
                  const url = await uploadMedia(file);
                  setDraft((d) => ({ ...d, image_url: url }));
                  toast.success("Photo uploaded");
                } catch {
                  toast.error("Could not upload that photo. Please try again.");
                } finally {
                  setUploading(false);
                }
              }}
              className="text-sm"
            />
            {draft.image_url ? (
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, image_url: "" }))}
                className="text-sm text-destructive underline"
              >
                Remove
              </button>
            ) : null}
          </div>
          {uploading ? <p className="mt-2 text-xs text-muted-foreground">Uploading…</p> : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          Active
        </label>
        <div className="flex gap-2 sm:justify-end">
          {draft.id ? (
            <button type="button" onClick={() => setDraft(blank)} className="rounded-md border border-border px-4 py-2 text-sm">
              Cancel
            </button>
          ) : null}
          <button type="submit" className="rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">
            {draft.id ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 p-3 text-sm">
            <span className="flex-1">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.active ? "Active" : "Hidden"}</span>
            <button
              type="button"
              className="text-primary underline"
              onClick={() =>
                setDraft({ id: c.id, name: c.name, slug: c.slug, image_url: c.image_url ?? "", active: c.active })
              }
            >
              Edit
            </button>
            <button type="button" className="text-destructive underline" onClick={() => remove.mutate(c.id)}>
              Delete
            </button>
          </li>
        ))}
        {categories.length === 0 ? <li className="p-6 text-center text-sm text-muted-foreground">No categories yet.</li> : null}
      </ul>
    </div>
  );
}
