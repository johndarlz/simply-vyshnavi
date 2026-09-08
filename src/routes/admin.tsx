import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminExists, adminWhoami, bootstrapAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Vyshnavi Collections" },
      { name: "description", content: "Store management for Vyshnavi Collections." },
      { property: "og:title", content: "Admin — Vyshnavi Collections" },
      { property: "og:description", content: "Store management for Vyshnavi Collections." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin" as const, label: "Dashboard" },
  { to: "/admin/products" as const, label: "Products" },
  { to: "/admin/categories" as const, label: "Categories" },
  { to: "/admin/orders" as const, label: "Orders" },
  { to: "/admin/settings" as const, label: "Settings" },
];

function AdminLayout() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "out" | "in" | "denied">("loading");

  const check = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setState("out");
    try {
      const res = await adminWhoami();
      setState(res.isAdmin ? "in" : "denied");
    } catch {
      setState("denied");
    }
  };

  useEffect(() => {
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void check();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (state !== "in") {
    return <AdminLogin denied={state === "denied"} onSignedIn={() => void check()} />;
  }

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card p-4 md:block">
        <p className="font-display text-xl">Vyshnavi</p>
        <p className="mb-6 text-xs tracking-luxe text-muted-foreground">ADMIN</p>
        <nav className="space-y-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/admin" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="block rounded-md px-3 py-2 hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.invalidate();
            }}
            className="mt-4 block w-full rounded-md px-3 py-2 text-left text-muted-foreground hover:bg-secondary"
          >
            Logout
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 text-sm md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/admin" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="whitespace-nowrap rounded-md px-3 py-1.5"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLogin({ denied, onSignedIn }: { denied: boolean; onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    void adminExists()
      .then((r) => setNeedsSetup(!r.exists))
      .catch(() => setNeedsSetup(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (needsSetup) {
      const res = await bootstrapAdmin({ data: { email, password } }).catch(() => null);
      if (!res?.ok) {
        setBusy(false);
        toast.error(res?.error ?? "Could not create the admin account.");
        return;
      }
      setNeedsSetup(false);
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Incorrect email or password.");
      return;
    }
    onSignedIn();
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-soft">
        <p className="font-display text-2xl">{needsSetup ? "Create Admin Account" : "Admin Login"}</p>
        <p className="mt-1 text-xs tracking-luxe text-muted-foreground">VYSHNAVI COLLECTIONS</p>
        {needsSetup ? (
          <p className="mt-4 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
            No admin exists yet. Choose the email and password you will use to manage the store (at least 8
            characters).
          </p>
        ) : null}
        {denied ? (
          <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            This account does not have admin access.
          </p>
        ) : null}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
        {denied ? (
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-3 w-full text-xs text-muted-foreground underline"
          >
            Sign out
          </button>
        ) : null}
      </form>
    </div>
  );
}
