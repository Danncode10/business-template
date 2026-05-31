"use server";

import { createClient } from "@/utils/supabase/server";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID!;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function dailyCounts<T extends { created_at: string }>(rows: T[], days: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const day = d.toISOString().split("T")[0];
    return rows.filter(r => r.created_at.startsWith(day)).length;
  });
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

export interface KpiData {
  leadsThisWeek: number;
  leadsLastWeek: number;
  bookingsThisWeek: number;
  bookingsLastWeek: number;
  revenueThisWeek: number;
  revenueLastWeek: number;
  conversionRate: number;
  leadsSparkline: number[];
  bookingsSparkline: number[];
  revenueSparkline: number[];
}

export async function getKpis(): Promise<KpiData> {
  const supabase = await createClient();

  const [l7, lp7, b7, bp7, l30, b30] = await Promise.all([
    supabase.from("leads").select("created_at").eq("app_id", APP_ID).gte("created_at", daysAgo(7)),
    supabase.from("leads").select("created_at").eq("app_id", APP_ID).gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
    supabase.from("bookings").select("created_at, price_quoted, status").eq("app_id", APP_ID).gte("created_at", daysAgo(7)),
    supabase.from("bookings").select("created_at, price_quoted, status").eq("app_id", APP_ID).gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
    supabase.from("leads").select("status").eq("app_id", APP_ID).gte("created_at", daysAgo(30)),
    supabase.from("bookings").select("status").eq("app_id", APP_ID).gte("created_at", daysAgo(30)),
  ]);

  const leads7   = l7.data   ?? [];
  const leadsPrev = lp7.data ?? [];
  const bk7       = b7.data  ?? [];
  const bkPrev    = bp7.data ?? [];
  const leads30   = l30.data ?? [];
  const bk30      = b30.data ?? [];

  const revenueForRows = (rows: { price_quoted: number | null; status: string | null }[]) =>
    rows.filter(r => ["confirmed", "completed"].includes(r.status ?? ""))
        .reduce((s, r) => s + (Number(r.price_quoted) || 0), 0);

  const leadsSparkline    = dailyCounts(leads7, 7);
  const bookingsSparkline = dailyCounts(bk7, 7);
  const revenueSparkline  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toISOString().split("T")[0];
    return revenueForRows(bk7.filter(r => r.created_at.startsWith(day)));
  });

  return {
    leadsThisWeek:    leads7.length,
    leadsLastWeek:    leadsPrev.length,
    bookingsThisWeek: bk7.length,
    bookingsLastWeek: bkPrev.length,
    revenueThisWeek:  revenueForRows(bk7),
    revenueLastWeek:  revenueForRows(bkPrev),
    conversionRate:   leads30.length ? Math.round((bk30.length / leads30.length) * 100) : 0,
    leadsSparkline,
    bookingsSparkline,
    revenueSparkline,
  };
}

// ── Attention items ────────────────────────────────────────────────────────────

export type AttentionSeverity = "red" | "amber" | "blue";

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  message: string;
  action: string;
  tab: "leads" | "bookings" | "gallery";
  count?: number;
}

export async function getAttentionItems(): Promise<AttentionItem[]> {
  const supabase = await createClient();
  const today = todayStr();

  const [newLeads, pendingBk, lastGallery] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).eq("status", "new"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).eq("status", "pending").gte("preferred_date", today),
    supabase.from("gallery_items").select("created_at").eq("app_id", APP_ID).order("created_at", { ascending: false }).limit(1),
  ]);

  const items: AttentionItem[] = [];

  const nl = newLeads.count ?? 0;
  if (nl > 0) items.push({ id: "new-leads", severity: "amber", count: nl, tab: "leads", action: "View leads", message: `${nl} new lead${nl > 1 ? "s" : ""} waiting for a reply` });

  const pb = pendingBk.count ?? 0;
  if (pb > 0) items.push({ id: "pending-bk", severity: "red", count: pb, tab: "bookings", action: "Review", message: `${pb} booking${pb > 1 ? "s" : ""} need${pb === 1 ? "s" : ""} confirmation` });

  const lastGal = lastGallery.data?.[0]?.created_at;
  if (lastGal) {
    const daysSince = Math.floor((Date.now() - new Date(lastGal).getTime()) / 86_400_000);
    if (daysSince > 30) items.push({ id: "stale-gallery", severity: "blue", tab: "gallery", action: "Add photos", message: `Gallery last updated ${daysSince} days ago` });
  }

  return items;
}

// ── Today's jobs ───────────────────────────────────────────────────────────────

export interface TodayJob {
  id: string;
  customer_name: string;
  service_name: string | null;
  vehicle_type: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  status: string | null;
  price_quoted: number | null;
}

export async function getTodayJobs(): Promise<TodayJob[]> {
  const supabase = await createClient();
  const today = todayStr();
  const { data } = await supabase
    .from("bookings")
    .select("id, customer_name, service_name, vehicle_type, vehicle_make, vehicle_model, preferred_date, preferred_time, confirmed_date, confirmed_time, status, price_quoted")
    .eq("app_id", APP_ID)
    .or(`confirmed_date.eq.${today},preferred_date.eq.${today}`)
    .neq("status", "cancelled")
    .order("confirmed_time", { ascending: true, nullsFirst: false });
  return (data ?? []) as TodayJob[];
}

// ── Funnel ─────────────────────────────────────────────────────────────────────

export interface FunnelData {
  leadsTotal: number;
  leadsContacted: number;
  booked: number;
  completed: number;
}

export async function getFunnelData(): Promise<FunnelData> {
  const supabase = await createClient();

  const [leads30, bk30] = await Promise.all([
    supabase.from("leads").select("status").eq("app_id", APP_ID).gte("created_at", daysAgo(30)),
    supabase.from("bookings").select("status").eq("app_id", APP_ID).gte("created_at", daysAgo(30)),
  ]);

  const leads   = leads30.data ?? [];
  const bk      = bk30.data   ?? [];

  return {
    leadsTotal:      leads.length,
    leadsContacted:  leads.filter(l => l.status !== "new").length,
    booked:          bk.length,
    completed:       bk.filter(b => b.status === "completed").length,
  };
}

// ── Trend data ─────────────────────────────────────────────────────────────────

export interface TrendPoint { date: string; value: number; }
export type TrendMetric = "leads" | "bookings" | "revenue";

export async function getTrendData(period: 7 | 30): Promise<{
  leads: TrendPoint[];
  bookings: TrendPoint[];
  revenue: TrendPoint[];
}> {
  const supabase = await createClient();

  const [lRes, bRes] = await Promise.all([
    supabase.from("leads").select("created_at").eq("app_id", APP_ID).gte("created_at", daysAgo(period)),
    supabase.from("bookings").select("created_at, price_quoted, status").eq("app_id", APP_ID).gte("created_at", daysAgo(period)),
  ]);

  const leads = lRes.data ?? [];
  const bks   = bRes.data ?? [];

  const days = Array.from({ length: period }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (period - 1 - i));
    return d.toISOString().split("T")[0];
  });

  return {
    leads:    days.map(day => ({ date: day, value: leads.filter(r => r.created_at.startsWith(day)).length })),
    bookings: days.map(day => ({ date: day, value: bks.filter(r => r.created_at.startsWith(day)).length })),
    revenue:  days.map(day => ({
      date: day,
      value: bks
        .filter(r => r.created_at.startsWith(day) && ["confirmed", "completed"].includes(r.status ?? ""))
        .reduce((s, r) => s + (Number(r.price_quoted) || 0), 0),
    })),
  };
}

// ── Top customers ──────────────────────────────────────────────────────────────

export interface TopCustomer {
  name: string;
  email: string;
  jobs: number;
  totalSpent: number;
  lastJob: string;
}

export async function getTopCustomers(): Promise<TopCustomer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("customer_name, customer_email, price_paid, price_quoted, status, created_at")
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false });

  if (!data) return [];

  const map = new Map<string, TopCustomer>();
  for (const b of data) {
    const key = b.customer_email || b.customer_name;
    const spent = Number(b.price_paid) || Number(b.price_quoted) || 0;
    const existing = map.get(key);
    if (existing) {
      existing.jobs++;
      existing.totalSpent += spent;
    } else {
      map.set(key, { name: b.customer_name, email: b.customer_email ?? "", jobs: 1, totalSpent: spent, lastJob: b.created_at });
    }
  }

  return [...map.values()].sort((a, b) => b.jobs - a.jobs || b.totalSpent - a.totalSpent).slice(0, 5);
}
