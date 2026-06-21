"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { Tables, TablesInsert } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

type Period = "today" | "week" | "month";
type BookingRow = Tables<"bookings">;

function periodStart(period: Period): string {
  const date = new Date();
  if (period === "today") {
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }
  date.setDate(date.getDate() - (period === "week" ? 7 : 30));
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

async function getDashboardContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to manage sales.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("app_id", APP_ID)
    .eq("id", user.id)
    .single();

  if (error || !profile?.organization_id) {
    throw new Error("No organization membership found for this user.");
  }

  return { supabase, organizationId: profile.organization_id };
}

function saleRevenue(row: Pick<BookingRow, "price_paid" | "price_quoted">): number {
  return Number(row.price_paid) || Number(row.price_quoted) || 0;
}

export interface SalesStats {
  revenue: number;
  count: number;
  avgSale: number;
  topService: string | null;
  dailyRevenue: { date: string; revenue: number; count: number }[];
}

export async function getSalesStats(period: Period): Promise<SalesStats> {
  const { supabase, organizationId } = await getDashboardContext();
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("bookings")
    .select("service_name, price_paid, price_quoted, created_at")
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
    .eq("source", "direct")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const revenue = rows.reduce((sum, row) => sum + saleRevenue(row), 0);
  const count = rows.length;
  const avgSale = count ? Math.round(revenue / count) : 0;

  const serviceCounts = new Map<string, number>();
  for (const row of rows) {
    serviceCounts.set(row.service_name, (serviceCounts.get(row.service_name) ?? 0) + 1);
  }

  const topService = serviceCounts.size
    ? [...serviceCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const days = period === "today" ? 1 : period === "week" ? 7 : 30;
  const dailyRevenue = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const day = date.toISOString().split("T")[0];
    const dayRows = rows.filter((row) => row.created_at.startsWith(day));
    return {
      date: day,
      revenue: dayRows.reduce((sum, row) => sum + saleRevenue(row), 0),
      count: dayRows.length,
    };
  });

  return { revenue, count, avgSale, topService, dailyRevenue };
}

export interface ServicePopularity {
  service_name: string;
  count: number;
  revenue: number;
}

export async function getServicePopularity(period: Period): Promise<ServicePopularity[]> {
  const { supabase, organizationId } = await getDashboardContext();
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("bookings")
    .select("service_name, price_paid, price_quoted")
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
    .eq("source", "direct")
    .gte("created_at", since);

  if (error) throw error;

  const map = new Map<string, { count: number; revenue: number }>();
  for (const row of data ?? []) {
    const current = map.get(row.service_name) ?? { count: 0, revenue: 0 };
    map.set(row.service_name, {
      count: current.count + 1,
      revenue: current.revenue + saleRevenue(row),
    });
  }

  return [...map.entries()]
    .map(([service_name, value]) => ({ service_name, ...value }))
    .sort((a, b) => b.revenue - a.revenue || b.count - a.count);
}

export interface Sale {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string;
  service_name: string;
  price_quoted: number | null;
  price_paid: number | null;
  payment_status: string;
  payment_method: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  notes: string | null;
  created_at: string;
}

export interface SaleFilters {
  page: number;
  pageSize: number;
  search?: string;
  from?: string;
  to?: string;
}

export async function listSales(filters: SaleFilters): Promise<{ data: Sale[]; total: number }> {
  const { supabase, organizationId } = await getDashboardContext();
  const offset = (filters.page - 1) * filters.pageSize;

  let query = supabase
    .from("bookings")
    .select(
      "id, customer_name, customer_phone, customer_email, service_name, price_quoted, price_paid, payment_status, payment_method, confirmed_date, confirmed_time, notes, created_at",
      { count: "exact" }
    )
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
    .eq("source", "direct")
    .order("created_at", { ascending: false })
    .range(offset, offset + filters.pageSize - 1);

  if (filters.search) {
    query = query.or(`customer_name.ilike.%${filters.search}%,service_name.ilike.%${filters.search}%`);
  }
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data: (data ?? []) as Sale[], total: count ?? 0 };
}

export interface CreateSaleInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_id?: string;
  service_name: string;
  price_quoted: number;
  payment_status: "paid" | "unpaid";
  payment_method: "cash" | "card" | "bank_transfer" | "other";
  confirmed_date: string;
  confirmed_time: string;
  notes?: string;
}

export async function createSale(input: CreateSaleInput): Promise<void> {
  const { supabase, organizationId } = await getDashboardContext();

  const payload: TablesInsert<"bookings"> = {
    app_id: APP_ID,
    organization_id: organizationId,
    customer_name: input.customer_name,
    customer_email: input.customer_email,
    customer_phone: input.customer_phone ?? null,
    service_id: input.service_id ?? null,
    service_name: input.service_name,
    price_quoted: input.price_quoted,
    price_paid: input.payment_status === "paid" ? input.price_quoted : null,
    payment_status: input.payment_status,
    payment_method: input.payment_method,
    status: "completed",
    source: "direct",
    confirmed_date: input.confirmed_date,
    confirmed_time: input.confirmed_time,
    notes: input.notes ?? null,
  };

  const { error } = await supabase.from("bookings").insert(payload);
  if (error) throw error;

  revalidatePath("/dashboard");
}

export async function deleteSale(id: string): Promise<void> {
  const { supabase, organizationId } = await getDashboardContext();
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
    .eq("source", "direct")
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard");
}
