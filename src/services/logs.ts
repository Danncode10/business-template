"use server";

import { createClient } from "@/utils/supabase/server";
import type { Tables } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID!;

export type AuditLog = Pick<
  Tables<"audit_logs">,
  "id" | "action" | "resource_type" | "resource_id" | "actor_email" | "diff" | "created_at" | "ip_address"
>;

export interface LogFilters {
  page: number;       // 1-based
  pageSize: number;
  from?: string;      // ISO date string
  to?: string;        // ISO date string
  action?: string;    // e.g. "update.service"
  resourceType?: string;
}

export interface LogsResult {
  data: AuditLog[];
  total: number;
}

export async function listLogs(filters: LogFilters): Promise<LogsResult> {
  const supabase = await createClient();
  const { page, pageSize, from, to, action, resourceType } = filters;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, actor_email, diff, created_at, ip_address", { count: "exact" })
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (from) query = query.gte("created_at", from);
  if (to)   query = query.lte("created_at", to);
  if (action && action !== "all")       query = query.eq("action", action);
  if (resourceType && resourceType !== "all") query = query.eq("resource_type", resourceType);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as AuditLog[], total: count ?? 0 };
}

export async function getLogDistinctValues(): Promise<{ actions: string[]; resourceTypes: string[] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("action, resource_type")
    .eq("app_id", APP_ID);

  if (!data) return { actions: [], resourceTypes: [] };
  const actions      = [...new Set(data.map(r => r.action))].sort();
  const resourceTypes = [...new Set(data.map(r => r.resource_type))].sort();
  return { actions, resourceTypes };
}
