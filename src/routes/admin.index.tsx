import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminSummary } from "@/lib/admin.functions";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "summary"], queryFn: () => adminSummary() });

  const cards: [string, string][] = data
    ? [
        ["Total Orders", String(data.totalOrders)],
        ["Today's Orders", String(data.todayOrders)],
        ["Pending", String(data.pendingOrders)],
        ["Confirmed", String(data.confirmedOrders)],
        ["Delivered", String(data.deliveredOrders)],
        ["Products", String(data.totalProducts)],
        ["Low Stock", String(data.lowStock)],
        ["Revenue", inr(data.revenue)],
        ["Today's Revenue", inr(data.todayRevenue)],
        ["This Month", inr(data.monthRevenue)],
        ["Avg Order Value", inr(data.averageOrderValue)],
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-soft">
              <p className="text-xs tracking-luxe text-muted-foreground">{label.toUpperCase()}</p>
              <p className="mt-1 font-display text-2xl">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
