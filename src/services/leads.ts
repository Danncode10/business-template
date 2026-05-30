"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

export async function listLeads(statusFilter?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("leads")
    .select("*")
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createLead(input: Omit<TablesInsert<"leads">, "organization_id" | "app_id">) {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("app_id", APP_ID)
    .single();
  if (!org) throw new Error("Organization not found");

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, app_id: APP_ID, organization_id: org.id })
    .select()
    .single();
  if (error) throw error;

  // Fire a notification
  await supabase.from("notifications").insert({
    app_id: APP_ID,
    organization_id: org.id,
    type: "new_lead",
    title: "New lead",
    body: `${input.name} (${input.email})`,
    link: "/dashboard?tab=leads",
  });

  return data;
}

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (notes !== undefined) updates.notes = notes;
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("app_id", APP_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/dashboard");
  return data;
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("app_id", APP_ID)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
}
