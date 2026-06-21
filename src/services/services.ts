"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate, TablesInsert, Tables } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

function revalidateAll() {
  // Landing page + dashboard both show services. Revalidate both on every write.
  revalidatePath("/");
  revalidatePath("/dashboard");
}

type ServiceInsertInput = Omit<TablesInsert<"services">, "organization_id"> & {
  organization_id?: string;
};

async function getDashboardContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to manage services.");
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

export async function listServices() {
  const { supabase, organizationId } = await getDashboardContext();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
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
  const { supabase, organizationId } = await getDashboardContext();
  const { data, error } = await supabase
    .from("services")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateAll();
  return data;
}

export async function createService(input: ServiceInsertInput) {
  const { supabase, organizationId } = await getDashboardContext();
  const { data, error } = await supabase
    .from("services")
    .insert({ ...input, app_id: APP_ID, organization_id: input.organization_id ?? organizationId })
    .select()
    .single();
  if (error) throw error;
  revalidateAll();
  return data;
}

export async function deleteService(id: string) {
  const { supabase, organizationId } = await getDashboardContext();
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("app_id", APP_ID)
    .eq("organization_id", organizationId)
    .eq("id", id);
  if (error) throw error;
  revalidateAll();
}
