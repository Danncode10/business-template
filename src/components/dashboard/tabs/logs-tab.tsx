"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, X, Filter, RefreshCw,
} from "lucide-react";
import { listLogs, getLogDistinctValues } from "@/services/logs";
import type { AuditLog } from "@/services/logs";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function actionVerb(action: string): string {
  const [verb, ...rest] = action.split(".");
  const resource = rest.join(".").replace(/-/g, " ");
  return `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${resource}`;
}

function actionColor(action: string): string {
  if (action.startsWith("create")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (action.startsWith("delete")) return "bg-destructive/10 text-destructive border-destructive/20";
  if (action.startsWith("update")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-muted text-muted-foreground border-border";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function DiffBadge({ diff }: { diff: unknown }) {
  if (!diff || typeof diff !== "object") return null;
  const entries = Object.entries(diff as Record<string, { old: unknown; new: unknown }>);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {entries.map(([field, change]) => (
        <span key={field} className="inline-flex items-center gap-1 text-[10px] bg-muted/60 border border-border rounded-md px-1.5 py-0.5">
          <span className="text-muted-foreground font-medium">{field}:</span>
          {change.old !== undefined && (
            <span className="text-destructive/80 line-through max-w-[80px] truncate">
              {String(change.old)}
            </span>
          )}
          <span className="text-emerald-400 max-w-[80px] truncate">
            {String(change.new ?? "—")}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface Filters {
  from: string;
  to: string;
  action: string;
  resourceType: string;
  search: string;
}

function FilterBar({
  filters, onChange, actions, resourceTypes, onReset, isLoading,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  actions: string[];
  resourceTypes: string[];
  onReset: () => void;
  isLoading: boolean;
}) {
  const hasActive = filters.from || filters.to || filters.action !== "all" || filters.resourceType !== "all" || filters.search;

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

        {/* Date from */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-muted-foreground whitespace-nowrap">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={e => onChange({ from: e.target.value })}
            className="bg-background border border-border rounded-lg px-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          />
        </div>

        {/* Date to */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-muted-foreground whitespace-nowrap">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={e => onChange({ to: e.target.value })}
            className="bg-background border border-border rounded-lg px-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          />
        </div>

        {/* Action */}
        <select
          value={filters.action}
          onChange={e => onChange({ action: e.target.value })}
          className="bg-background border border-border rounded-lg px-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="all">All actions</option>
          {actions.map(a => (
            <option key={a} value={a}>{actionVerb(a)}</option>
          ))}
        </select>

        {/* Resource type */}
        <select
          value={filters.resourceType}
          onChange={e => onChange({ resourceType: e.target.value })}
          className="bg-background border border-border rounded-lg px-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="all">All types</option>
          {resourceTypes.map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={e => onChange({ search: e.target.value })}
            placeholder="Search actor or ID…"
            className="bg-background border border-border rounded-lg pl-6 pr-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary/50 w-44"
          />
          {filters.search && (
            <button onClick={() => onChange({ search: "" })} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          {hasActive && (
            <button onClick={onReset}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({ log }: { log: AuditLog }) {
  const { date, time } = formatDate(log.created_at);
  const [expanded, setExpanded] = useState(false);
  const hasDiff = log.diff && typeof log.diff === "object" && Object.keys(log.diff).length > 0;

  return (
    <div
      onClick={() => hasDiff && setExpanded(v => !v)}
      className={cn(
        "flex items-start gap-4 py-3 px-4 rounded-xl transition-colors",
        hasDiff ? "cursor-pointer hover:bg-muted/40" : "",
      )}>

      {/* Timestamp */}
      <div className="shrink-0 text-right min-w-[90px]">
        <p className="text-[11px] text-foreground font-medium">{date}</p>
        <p className="text-[10px] text-muted-foreground">{time}</p>
      </div>

      {/* Action badge */}
      <div className="shrink-0 pt-0.5">
        <span className={cn(
          "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border",
          actionColor(log.action)
        )}>
          {actionVerb(log.action)}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-muted-foreground capitalize">{log.resource_type}</span>
          {log.resource_id && (
            <code className="text-[10px] text-muted-foreground/60 bg-muted/60 px-1.5 py-0.5 rounded font-mono truncate max-w-[160px]">
              {log.resource_id}
            </code>
          )}
          {log.actor_email && (
            <span className="text-[11px] text-muted-foreground">· {log.actor_email}</span>
          )}
        </div>
        {expanded && hasDiff && <DiffBadge diff={log.diff} />}
        {hasDiff && !expanded && (
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
            {Object.keys(log.diff as object).length} field{Object.keys(log.diff as object).length !== 1 ? "s" : ""} changed — click to expand
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-3 border-t border-border">
      <p className="text-[12px] text-muted-foreground">
        {total === 0 ? "No results" : `${from}–${to} of ${total} entries`}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(1)} disabled={page === 1}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={cn(
                "w-7 h-7 rounded-lg text-[12px] transition-colors",
                page === p ? "bg-primary text-white font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
              {p}
            </button>
          );
        })}

        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onChange(totalPages)} disabled={page === totalPages}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = { from: "", to: "", action: "all", resourceType: "all", search: "" };

export function LogsTab() {
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const updateFilter = useCallback((f: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...f }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  // Build the to-date as end-of-day
  const toEndOfDay = filters.to ? `${filters.to}T23:59:59.999Z` : undefined;

  const logsQuery = useQuery({
    queryKey: ["audit-logs", page, filters],
    queryFn: () => listLogs({
      page,
      pageSize: PAGE_SIZE,
      from: filters.from ? new Date(filters.from).toISOString() : undefined,
      to: toEndOfDay,
      action: filters.action !== "all" ? filters.action : undefined,
      resourceType: filters.resourceType !== "all" ? filters.resourceType : undefined,
    }),
    placeholderData: prev => prev,
  });

  const metaQuery = useQuery({
    queryKey: ["audit-logs-meta"],
    queryFn: getLogDistinctValues,
    staleTime: 5 * 60 * 1000,
  });

  const logs    = logsQuery.data?.data ?? [];
  const total   = logsQuery.data?.total ?? 0;
  const actions = metaQuery.data?.actions ?? [];
  const resTypes = metaQuery.data?.resourceTypes ?? [];

  // Client-side search filter (on actor_email + resource_id)
  const visible = filters.search
    ? logs.filter(l =>
        l.actor_email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        l.resource_id?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Activity Logs</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Full audit trail of all changes. Click any row to expand diff.
          </p>
        </div>
        <button
          onClick={() => logsQuery.refetch()}
          disabled={logsQuery.isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] text-muted-foreground border border-border hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-3.5 h-3.5", logsQuery.isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={updateFilter}
        actions={actions}
        resourceTypes={resTypes}
        onReset={resetFilters}
        isLoading={logsQuery.isFetching}
      />

      {/* Stats strip */}
      <div className="flex items-center gap-6 text-[12px] text-muted-foreground">
        <span><span className="font-semibold text-foreground">{total}</span> total entries</span>
        {filters.from || filters.to ? (
          <span>
            Filtered: <span className="font-semibold text-foreground">
              {filters.from && new Date(filters.from).toLocaleDateString("en-AU", { day: "2-digit", month: "short" })}
              {filters.from && filters.to ? " – " : ""}
              {filters.to && new Date(filters.to).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </span>
        ) : null}
      </div>

      {/* Log list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {logsQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : logsQuery.isError ? (
          <div className="py-12 text-center text-[13px] text-destructive">
            Failed to load logs. Check your connection and try again.
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-muted-foreground">No log entries found.</p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {visible.map((log, i) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!filters.search && (
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      )}
    </div>
  );
}
