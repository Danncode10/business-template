"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart2, DollarSign, Loader2, ShoppingBag, TrendingUp } from "lucide-react";
import { getEventCountsByDay, getTopPages, getEventTypeBreakdown } from "@/services/analytics";
import { getSalesStats } from "@/services/sales";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";

export function AnalyticsTab() {
  const { data: salesMonth } = useQuery({
    queryKey: ["sales-stats", "month"],
    queryFn: () => getSalesStats("month"),
    staleTime: 60_000,
  });

  const { data: salesWeek } = useQuery({
    queryKey: ["sales-stats", "week"],
    queryFn: () => getSalesStats("week"),
    staleTime: 60_000,
  });

  const { data: byDay, isLoading: loadingDay } = useQuery({
    queryKey: ["analytics-by-day"],
    queryFn: () => getEventCountsByDay(14),
    staleTime: 60_000,
  });

  const { data: topPages, isLoading: loadingPages } = useQuery({
    queryKey: ["analytics-top-pages"],
    queryFn: () => getTopPages(8, 14),
    staleTime: 60_000,
  });

  const { data: byType, isLoading: loadingType } = useQuery({
    queryKey: ["analytics-by-type"],
    queryFn: () => getEventTypeBreakdown(14),
    staleTime: 60_000,
  });

  const maxDayCount = Math.max(1, ...(byDay ?? []).map((d) => d.count));
  const total14d = (byDay ?? []).reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Analytics</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Business performance and first-party site analytics in one place.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Business Performance</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <DollarSign className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Revenue · 30 Days</p>
            <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">${(salesMonth?.revenue ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">{salesMonth?.count ?? 0} direct sales</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <ShoppingBag className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Revenue · 7 Days</p>
            <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">${(salesWeek?.revenue ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">{salesWeek?.count ?? 0} direct sales</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <TrendingUp className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Average Sale</p>
            <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">${(salesMonth?.avgSale ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">30 day direct-sale average</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <BarChart2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Top Service</p>
            <p className="mt-2 truncate text-2xl font-bold text-foreground">{salesMonth?.topService ?? "None yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">by direct-sale count</p>
          </div>
        </div>
      </div>

      {salesMonth && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-[13px] font-semibold text-foreground">Revenue Trend · 30 Days</h3>
          {salesMonth.dailyRevenue.some((point) => point.revenue > 0) ? (
            <RevenueTrendChart points={salesMonth.dailyRevenue} period="month" />
          ) : (
            <div className="flex h-48 items-center justify-center text-[13px] text-muted-foreground">
              No revenue data for this period.
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Web Analytics · Last 14 Days</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl px-5 py-5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Total Events</p>
          <p className="text-3xl font-bold text-foreground tabular-nums mt-3">{total14d}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">across all event types</p>
        </div>
        <div className="bg-card border border-border rounded-2xl px-5 py-5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Page Views</p>
          <p className="text-3xl font-bold text-foreground tabular-nums mt-3">
            {(byType ?? []).find((t) => t.type === "page_view")?.count ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">14 day total</p>
        </div>
        <div className="bg-card border border-border rounded-2xl px-5 py-5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">CTA Clicks</p>
          <p className="text-3xl font-bold text-foreground tabular-nums mt-3">
            {(byType ?? []).find((t) => t.type === "cta_click")?.count ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">14 day total</p>
        </div>
      </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-[13px] font-semibold text-foreground">Events per day</h3>
        </div>
        <div className="p-5">
          {loadingDay ? (
            <Loader2 className="w-5 h-5 animate-spin inline" />
          ) : (byDay ?? []).length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No events yet. Add the tracker to your pages to start collecting data.
            </p>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {(byDay ?? []).map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </div>
                  <div
                    className="w-full bg-primary/70 hover:bg-primary rounded-t transition-colors"
                    style={{ height: `${(d.count / maxDayCount) * 100}%`, minHeight: 2 }}
                    title={`${d.day}: ${d.count}`}
                  />
                  <div className="text-[9px] text-muted-foreground -rotate-45 origin-top-left whitespace-nowrap">
                    {d.day.slice(5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-[13px] font-semibold text-foreground">Top pages</h3>
          </div>
          <div className="divide-y divide-border">
            {loadingPages ? (
              <div className="p-5"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
            ) : (topPages ?? []).length === 0 ? (
              <div className="p-5 text-[13px] text-muted-foreground">No page views recorded yet.</div>
            ) : (
              (topPages ?? []).map((p) => (
                <div key={p.path} className="px-5 py-3 flex items-center justify-between text-[13px]">
                  <code className="text-muted-foreground">{p.path}</code>
                  <span className="font-medium tabular-nums">{p.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-[13px] font-semibold text-foreground">Event types</h3>
          </div>
          <div className="divide-y divide-border">
            {loadingType ? (
              <div className="p-5"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
            ) : (byType ?? []).length === 0 ? (
              <div className="p-5 text-[13px] text-muted-foreground">No events tracked yet.</div>
            ) : (
              (byType ?? []).map((t) => (
                <div key={t.type} className="px-5 py-3 flex items-center justify-between text-[13px]">
                  <span className="text-foreground">{t.type}</span>
                  <span className="font-medium tabular-nums">{t.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
