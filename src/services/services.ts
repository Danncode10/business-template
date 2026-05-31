"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate, TablesInsert, Tables } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

function revalidateAll() {
  // Landing page + dashboard both show services. Revalidate both on every write.
  revalidatePath("/");
  revalidateAll();
}

export async function listServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("app_id", APP_ID)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

// Public landing-page fetch. Only returns published services.
export async function listPublishedServices(): Promise<Tables<"services">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  if (error) {
    console.warn("listPublishedServices error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function updateService(id: string, updates: TablesUpdate<"services">) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("app_id", APP_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateAll();
  return data;
}

export async function createService(input: TablesInsert<"services">) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert({ ...input, app_id: APP_ID })
    .select()
    .single();
  if (error) throw error;
  revalidateAll();
  return data;
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("app_id", APP_ID)
    .eq("id", id);
  if (error) throw error;
  revalidateAll();
}
