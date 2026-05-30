"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate, TablesInsert } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

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
  revalidatePath("/dashboard");
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
  revalidatePath("/dashboard");
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
  revalidatePath("/dashboard");
}
