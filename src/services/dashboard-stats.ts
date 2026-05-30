"use server";

import { createClient } from "@/utils/supabase/server";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

export async function getDashboardStats() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [
    publishedServicesRes,
    todayLeadsRes,
    totalBookingsRes,
    pendingBookingsRes,
    newLeadsRes,
    galleryPublishedRes,
  ] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).eq("is_published", true),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).gte("created_at", todayIso),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("app_id", APP_ID),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).eq("status", "pending"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).eq("status", "new"),
    supabase.from("gallery_items").select("*", { count: "exact", head: true }).eq("app_id", APP_ID).eq("is_published", true),
  ]);

  return {
    publishedServices: publishedServicesRes.count ?? 0,
    todayLeads: todayLeadsRes.count ?? 0,
    totalBookings: totalBookingsRes.count ?? 0,
    pendingBookings: pendingBookingsRes.count ?? 0,
    newLeads: newLeadsRes.count ?? 0,
    galleryPublished: galleryPublishedRes.count ?? 0,
  };
}

export async function getRecentActivity(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, actor_email, diff, created_at")
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}
