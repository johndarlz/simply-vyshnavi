import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Menu, Search, ShoppingBag, X, Instagram, Facebook, MessageCircle, LayoutGrid } from "lucide-react";
import { settingsQuery } from "@/lib/store-data";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/whatsapp";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function AnnouncementBar() {
  const { data: settings } = useQuery(settingsQuery);
  if (settings?.["announcement_enabled"] !== "true" || !settings?.["announcement_text"]) return null;
  return (
    <div className="bg-primary px-4 py-2 text-center text-[11px] tracking-luxe text-primary-foreground sm:text-xs">
      {settings["announcement_text"]}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { count } = useCart();
  const { data: settings } = useQuery(settingsQuery);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setOpen(false);
    navigate({ to: "/products", search: { q: term || undefined, category: undefined, sort: undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <button
          type="button"
          className="-ml-2 p-2 md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-display text-lg leading-none sm:text-xl">
          {settings?.["store_name"] ?? "Vyshnavi Collections"}
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link to="/track" className="text-muted-foreground transition-colors hover:text-foreground">
            Track Order
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button type="button" aria-label="Search" className="p-2" onClick={() => setSearchOpen((v) => !v)}>
            <Search className="h-5 w-5" />
          </button>
          <Link to="/cart" aria-label="Cart" className="relative p-2">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <form onSubmit={submitSearch} className="border-t border-border/70 px-4 py-3">
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products, categories…"
            className="mx-auto block w-full max-w-6xl rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </form>
      ) : null}

      {open ? (
        <nav className="border-t border-border/70 px-4 py-3 md:hidden">
          {[...navLinks, { to: "/track", label: "Track Order" } as const].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border/50 py-3 text-sm last:border-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function MobileTabBar() {
  const { count } = useCart();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border/70 bg-background/98 backdrop-blur md:hidden">
      <Link to="/" className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] text-muted-foreground">
        <Home className="h-5 w-5" /> Home
      </Link>
      <Link to="/products" className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] text-muted-foreground">
        <LayoutGrid className="h-5 w-5" /> Shop
      </Link>
      <Link
        to="/products"
        search={{ q: undefined, category: undefined, sort: undefined }}
        className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] text-muted-foreground"
      >
        <Search className="h-5 w-5" /> Search
      </Link>
      <Link to="/cart" className="relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] text-muted-foreground">
        <ShoppingBag className="h-5 w-5" /> Cart
        {count > 0 ? (
          <span className="absolute right-6 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
            {count}
          </span>
        ) : null}
      </Link>
    </nav>
  );
}

function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const wa = settings?.["whatsapp_number"] ?? "";
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <p className="font-display text-xl">{settings?.["store_name"] ?? "Vyshnavi Collections"}</p>
          <p className="text-sm text-muted-foreground">{settings?.["store_tagline"] ?? "Simple. Elegant. Yours."}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs tracking-luxe text-muted-foreground">Shop</p>
          <Link to="/" className="block text-muted-foreground hover:text-foreground">Home</Link>
          <Link to="/products" className="block text-muted-foreground hover:text-foreground">Collections</Link>
          <Link to="/track" className="block text-muted-foreground hover:text-foreground">Track Order</Link>
          <Link to="/contact" className="block text-muted-foreground hover:text-foreground">Contact</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs tracking-luxe text-muted-foreground">Policies</p>
          <Link to="/shipping-policy" className="block text-muted-foreground hover:text-foreground">Shipping Policy</Link>
          <Link to="/return-policy" className="block text-muted-foreground hover:text-foreground">Return &amp; Refund</Link>
          <Link to="/privacy-policy" className="block text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="block text-muted-foreground hover:text-foreground">Terms &amp; Conditions</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-luxe text-muted-foreground">Reach us</p>
          <p className="text-muted-foreground">{settings?.["store_phone"]}</p>
          <p className="text-muted-foreground">{settings?.["store_email"]}</p>
          <div className="flex gap-3 pt-1">
            {settings?.["instagram_url"] ? (
              <a href={settings["instagram_url"]} aria-label="Instagram" target="_blank" rel="noreferrer">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            ) : null}
            {settings?.["facebook_url"] ? (
              <a href={settings["facebook_url"]} aria-label="Facebook" target="_blank" rel="noreferrer">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            ) : null}
            {wa ? (
              <a href={whatsappLink(wa, "Hello!")} aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <p className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings?.["store_name"] ?? "Vyshnavi Collections"}. All rights reserved.
      </p>
    </footer>
  );
}

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
