"use server";

import { createClient } from "@/utils/supabase/server";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

export async function getEventCountsByDay(days = 14) {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("created_at, event_type")
    .eq("app_id", APP_ID)
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (error) return [];

  const buckets = new Map<string, number>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return Array.from(buckets, ([day, count]) => ({ day, count }));
}

export async function getTopPages(limit = 5, days = 14) {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data } = await supabase
    .from("analytics_events")
    .select("page_path")
    .eq("app_id", APP_ID)
    .eq("event_type", "page_view")
    .gte("created_at", since)
    .not("page_path", "is", null);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.page_path) continue;
    counts.set(row.page_path, (counts.get(row.page_path) ?? 0) + 1);
  }
  return Array.from(counts, ([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getEventTypeBreakdown(days = 14) {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data } = await supabase
    .from("analytics_events")
    .select("event_type")
    .eq("app_id", APP_ID)
    .gte("created_at", since);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.event_type, (counts.get(row.event_type) ?? 0) + 1);
  }
  return Array.from(counts, ([type, count]) => ({ type, count }));
}

export async function trackEvent(input: {
  event_type: string;
  page_path?: string;
  referrer?: string;
  properties?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("app_id", APP_ID)
    .single();
  if (!org) return;

  await supabase.from("analytics_events").insert({
    app_id: APP_ID,
    organization_id: org.id,
    event_type: input.event_type,
    page_path: input.page_path ?? null,
    referrer: input.referrer ?? null,
    properties: (input.properties ?? {}) as never,
  });
}
