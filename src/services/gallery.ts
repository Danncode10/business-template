"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

export async function listGalleryItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("app_id", APP_ID)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createGalleryItem(input: Omit<TablesInsert<"gallery_items">, "organization_id" | "app_id">) {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("app_id", APP_ID)
    .single();
  if (!org) throw new Error("Organization not found");

  const { data, error } = await supabase
    .from("gallery_items")
    .insert({ ...input, app_id: APP_ID, organization_id: org.id })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/dashboard");
  return data;
}

export async function updateGalleryItem(id: string, updates: TablesUpdate<"gallery_items">) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("app_id", APP_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/dashboard");
  return data;
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_items")
    .delete()
    .eq("app_id", APP_ID)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
}
