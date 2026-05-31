"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, Minus,
  Calendar, DollarSign, BarChart2,
  AlertCircle, CheckCircle2, ChevronRight,
  Clock, Car, Wrench, Users,
} from "lucide-react";
import {
  getKpis, getAttentionItems, getTodayJobs,
  getFunnelData, getTrendData,
  type TrendMetric,
} from "@/services/overview";
import { getRecentActivity } from "@/services/dashboard-stats";
import type { DashboardTabId } from "@/lib/dashboard-features";
import { cn } from "@/lib/utils";

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (!values || values.length < 2) return <div className="h-8 w-16 rounded bg-muted/20" />;
  const max = Math.max(...values, 1);
  const W = 64, H = 28;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - 4 - (v / max) * (H - 8),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg width={W} height={H} className="shrink-0 overflow-visible">
      <path d={area} fill={color} fillOpacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function delta(curr: number, prev: number) {
  const diff = curr - prev;
  if (diff === 0) return null;
  return { diff, up: diff > 0 };
}

function KpiCard({
  label, value, prev, unit, prefix, sparkline, color, icon: Icon, featured,
}: {
  label: string; value: number; prev: number; unit?: string; prefix?: string;
  sparkline: number[]; color: string; icon: React.ElementType; featured?: boolean;
}) {
  const d = delta(value, prev);
  const display = prefix ? `${prefix}${value.toLocaleString()}` : value.toLocaleString();
  const prevDisplay = prefix ? `${prefix}${prev.toLocaleString()}` : prev.toLocaleString();

  return (
    <div className={cn(
      "rounded-2xl p-5 flex flex-col gap-4 border transition-shadow",
      featured
        ? "bg-primary/5 border-primary/20"
        : "bg-card border-border",
    )}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", featured ? "bg-primary/10" : "bg-muted")}>
          <Icon className={cn("h-4 w-4", featured ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-3xl font-bold tabular-nums text-foreground leading-none">
            {display}
            {unit && <span className="text-base font-medium text-muted-foreground ml-1">{unit}</span>}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            {d === null ? (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Minus className="w-3 h-3" /> Same as last week
              </span>
            ) : d.up ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <TrendingUp className="w-3 h-3" /> +{Math.abs(d.diff).toLocaleString()} vs last wk
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-destructive">
                <TrendingDown className="w-3 h-3" /> −{Math.abs(d.diff).toLocaleString()} vs last wk
              </span>
            )}
          </div>
        </div>
        <Sparkline values={sparkline} color={color} />
      </div>
    </div>
  );
}

// ─── Attention strip ──────────────────────────────────────────────────────────

const SEV_STYLES = {
  red:   "bg-destructive/10 border-destructive/25 text-destructive",
  amber: "bg-amber-500/10 border-amber-500/25 text-amber-400",
  blue:  "bg-blue-500/10 border-blue-500/25 text-blue-400",
};

function AttentionStrip({
  items, setTab,
}: {
  items: ReturnType<typeof getAttentionItems> extends Promise<infer T> ? T : never;
  setTab: (t: DashboardTabId) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-[13px] text-emerald-400 font-medium">You&apos;re all caught up — nothing needs attention right now.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mb-1">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setTab(item.tab as DashboardTabId)}
          className={cn(
            "flex items-start gap-3 px-4 py-3.5 rounded-2xl border shrink-0 text-left transition-opacity hover:opacity-80",
            SEV_STYLES[item.severity],
          )}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium leading-snug">{item.message}</p>
            <p className="text-[11px] opacity-70 mt-0.5 flex items-center gap-0.5">{item.action} <ChevronRight className="w-3 h-3" /></p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Today's jobs ─────────────────────────────────────────────────────────────

const JOB_STATUS: Record<string, string> = {
  confirmed:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending:    "bg-amber-500/10  text-amber-400  border-amber-500/20",
  completed:  "bg-blue-500/10  text-blue-400  border-blue-500/20",
};

function TodayJobsList({
  jobs, setTab,
}: {
  jobs: Awaited<ReturnType<typeof getTodayJobs>>;
  setTab: (t: DashboardTabId) => void;
}) {
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Today&apos;s Jobs</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{today}</p>
        </div>
        <button onClick={() => setTab("bookings")} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
          All bookings <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
          <Calendar className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-[13px] text-muted-foreground">No jobs scheduled today</p>
          <button onClick={() => setTab("bookings")} className="text-[12px] text-primary hover:underline mt-1">
            View all bookings →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-y-auto max-h-72">
          {jobs.map(job => {
            const time = job.confirmed_time ?? job.preferred_time;
            const status = job.status ?? "pending";
            const vehicle = [job.vehicle_make, job.vehicle_model].filter(Boolean).join(" ") || job.vehicle_type || "Vehicle";
            return (
              <div key={job.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                <div className="shrink-0 w-14 text-right">
                  {time ? (
                    <p className="text-[12px] font-semibold text-foreground tabular-nums">{time}</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">TBD</p>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium text-foreground">{job.customer_name}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", JOB_STATUS[status] ?? JOB_STATUS.pending)}>
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                    {job.service_name && (
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3 h-3" />{job.service_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" />{vehicle}
                    </span>
                  </div>
                </div>
                {job.price_quoted && (
                  <p className="shrink-0 text-[13px] font-bold text-primary tabular-nums">
                    ${Number(job.price_quoted).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

function FunnelPanel({ data }: { data: Awaited<ReturnType<typeof getFunnelData>> }) {
  const stages = [
    { label: "Leads in",    value: data.leadsTotal,     color: "bg-amber-500" },
    { label: "Contacted",   value: data.leadsContacted,  color: "bg-orange-500" },
    { label: "Booked",      value: data.booked,          color: "bg-blue-500" },
    { label: "Completed",   value: data.completed,       color: "bg-emerald-500" },
  ];
  const max = Math.max(data.leadsTotal, 1);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-[13px] font-semibold text-foreground">30-Day Pipeline</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Lead → Job conversion funnel</p>
      </div>
      <div className="px-5 py-5 space-y-4">
        {stages.map((stage, i) => {
          const pct = Math.round((stage.value / max) * 100);
          const convPct = i > 0 && stages[i - 1].value > 0
            ? Math.round((stage.value / stages[i - 1].value) * 100)
            : null;
          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", stage.color)} />
                  <span className="text-[12px] text-muted-foreground">{stage.label}</span>
                  {convPct !== null && (
                    <span className="text-[10px] text-muted-foreground/50">({convPct}% of prev)</span>
                  )}
                </div>
                <span className="text-[13px] font-bold text-foreground tabular-nums">{stage.value}</span>
              </div>
              <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", stage.color, "opacity-70")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="pt-2 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Overall conversion:{" "}
            <span className="font-bold text-foreground">
              {data.leadsTotal > 0 ? Math.round((data.completed / data.leadsTotal) * 100) : 0}%
            </span>{" "}
            lead → completed job
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Trend chart (CSS bars) ───────────────────────────────────────────────────

const METRIC_CONFIG: Record<TrendMetric, { label: string; color: string; prefix: string }> = {
  leads:    { label: "Leads",    color: "bg-amber-500",   prefix: "" },
  bookings: { label: "Bookings", color: "bg-blue-500",    prefix: "" },
  revenue:  { label: "Revenue",  color: "bg-emerald-500", prefix: "$" },
};

function TrendChart({ data }: { data: Awaited<ReturnType<typeof getTrendData>> }) {
  const [metric, setMetric] = useState<TrendMetric>("leads");
  const [period, setPeriod] = useState<7 | 30>(30);

  const points = data[metric].slice(-(period));
  const max    = Math.max(...points.map(p => p.value), 1);
  const cfg    = METRIC_CONFIG[metric];
  const total  = points.reduce((s, p) => s + p.value, 0);

  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    if (period === 7) return d.toLocaleDateString("en-AU", { weekday: "short" });
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  // Show only a subset of x-axis labels to avoid crowding
  const labelStep = period <= 7 ? 1 : period <= 14 ? 2 : 7;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border flex-wrap">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Performance Trend</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {cfg.prefix}{total.toLocaleString()} {cfg.label.toLowerCase()} in the last {period} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Metric switcher */}
          <div className="flex gap-0.5 bg-muted/60 rounded-lg p-0.5 border border-border">
            {(["leads", "bookings", "revenue"] as TrendMetric[]).map(m => (
              <button key={m} onClick={() => setMetric(m)}
                className={cn("px-3 py-1 rounded-md text-[11px] font-medium transition-all",
                  metric === m ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {METRIC_CONFIG[m].label}
              </button>
            ))}
          </div>
          {/* Period switcher */}
          <div className="flex gap-0.5 bg-muted/60 rounded-lg p-0.5 border border-border">
            {([7, 30] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3 py-1 rounded-md text-[11px] font-medium transition-all",
                  period === p ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {p}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 pt-5 pb-2">
        {total === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-[13px] text-muted-foreground">No {cfg.label.toLowerCase()} in this period</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-0.5 h-32">
              {points.map((p, i) => {
                const heightPct = (p.value / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative">
                    {/* Tooltip */}
                    {p.value > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        <div className="bg-popover border border-border rounded-md px-2 py-1 text-[10px] font-medium text-foreground whitespace-nowrap shadow-md">
                          {cfg.prefix}{p.value.toLocaleString()}
                        </div>
                      </div>
                    )}
                    <div
                      className={cn("rounded-t-sm transition-all", cfg.color, p.value === 0 ? "opacity-10 h-0.5" : "opacity-70 hover:opacity-100")}
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div className="flex gap-0.5 mt-1">
              {points.map((p, i) => (
                <div key={i} className="flex-1 text-center">
                  {i % labelStep === 0 && (
                    <span className="text-[9px] text-muted-foreground/50">{formatLabel(p.date)}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

function describe(action: string, diff: unknown): string {
  if (action === "create.service") return "Added a new service";
  if (action === "delete.service") return "Deleted a service";
  if (action === "update.service" && diff && typeof diff === "object") {
    const fields = Object.keys(diff as object);
    return `Updated service: ${fields.join(", ")}`;
  }
  const [verb, ...rest] = action.split(".");
  return `${verb.charAt(0).toUpperCase() + verb.slice(1)}d ${rest.join(" ").replace(/-/g, " ")}`;
}

function ActivityFeed({
  activity, setTab,
}: {
  activity: Awaited<ReturnType<typeof getRecentActivity>>;
  setTab: (t: DashboardTabId) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-[13px] font-semibold text-foreground">Recent Activity</h3>
        <button onClick={() => setTab("logs")} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {activity.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-muted-foreground">No activity yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
          {activity.map(a => {
            const isCreate = a.action.startsWith("create");
            const isDelete = a.action.startsWith("delete");
            const dotColor = isCreate ? "bg-emerald-400" : isDelete ? "bg-destructive" : "bg-blue-400";
            return (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex flex-col items-center gap-1 pt-1.5 shrink-0">
                  <div className={cn("w-2 h-2 rounded-full", dotColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground leading-snug">{describe(a.action, a.diff)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(a.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {a.actor_email && ` · ${a.actor_email}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted/40", className)} />;
}

function KpiSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
      <div><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-3 w-28" /></div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  displayName: string;
  setTab: (tab: DashboardTabId) => void;
}

export function OverviewTab({ displayName, setTab }: OverviewTabProps) {
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const kpisQ      = useQuery({ queryKey: ["overview-kpis"],      queryFn: getKpis,            staleTime: 60_000 });
  const attentionQ = useQuery({ queryKey: ["overview-attention"],  queryFn: getAttentionItems,  staleTime: 30_000 });
  const todayQ     = useQuery({ queryKey: ["overview-today"],      queryFn: getTodayJobs,       staleTime: 30_000 });
  const funnelQ    = useQuery({ queryKey: ["overview-funnel"],     queryFn: getFunnelData,      staleTime: 60_000 });
  const trendQ     = useQuery({ queryKey: ["overview-trend"],      queryFn: () => getTrendData(30), staleTime: 60_000 });
  const activityQ  = useQuery({ queryKey: ["recent-activity"],     queryFn: () => getRecentActivity(6), staleTime: 30_000 });

  const kpis = kpisQ.data;

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Good day, {displayName}.</h2>
        <p className="text-[13px] text-muted-foreground mt-1">{today}</p>
      </div>

      {/* ── Zone 1: KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpisQ.isLoading ? (
          <>{[0,1,2,3].map(i => <KpiSkeleton key={i} />)}</>
        ) : kpis ? (
          <>
            <KpiCard
              label="Revenue (7d)" value={kpis.revenueThisWeek} prev={kpis.revenueLastWeek}
              prefix="$" sparkline={kpis.revenueSparkline} color="#10b981"
              icon={DollarSign} featured />
            <KpiCard
              label="New Leads (7d)" value={kpis.leadsThisWeek} prev={kpis.leadsLastWeek}
              sparkline={kpis.leadsSparkline} color="#f59e0b"
              icon={Users} />
            <KpiCard
              label="Bookings (7d)" value={kpis.bookingsThisWeek} prev={kpis.bookingsLastWeek}
              sparkline={kpis.bookingsSparkline} color="#3b82f6"
              icon={Calendar} />
            <KpiCard
              label="Conversion (30d)" value={kpis.conversionRate} prev={kpis.conversionRate}
              unit="%" sparkline={[0, 0, 0, 0, 0, 0, kpis.conversionRate]}
              color="#8b5cf6" icon={BarChart2} />
          </>
        ) : null}
      </div>

      {/* ── Zone 2: Attention strip ── */}
      {attentionQ.data && (
        <AttentionStrip items={attentionQ.data} setTab={setTab} />
      )}

      {/* ── Zone 3: Today's Jobs + Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {todayQ.isLoading
          ? <Skeleton className="h-64 rounded-2xl" />
          : <TodayJobsList jobs={todayQ.data ?? []} setTab={setTab} />}
        {funnelQ.isLoading
          ? <Skeleton className="h-64 rounded-2xl" />
          : funnelQ.data && <FunnelPanel data={funnelQ.data} />}
      </div>

      {/* ── Zone 4: Trend chart ── */}
      {trendQ.isLoading
        ? <Skeleton className="h-52 rounded-2xl" />
        : trendQ.data && <TrendChart data={trendQ.data} />}

      {/* ── Zone 5: Activity ── */}
      {activityQ.isLoading
        ? <Skeleton className="h-64 rounded-2xl" />
        : <ActivityFeed activity={activityQ.data ?? []} setTab={setTab} />}

    </div>
  );
}
