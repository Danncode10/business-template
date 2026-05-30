"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

export async function listNotifications(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("app_id", APP_ID)
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("app_id", APP_ID)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("app_id", APP_ID)
    .eq("is_read", false);
  if (error) throw error;
  revalidatePath("/dashboard");
}
