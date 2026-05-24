"use server";

import { createClient } from '@/utils/supabase/server';
import { verifyRateLimit } from '@/lib/ratelimit';


export async function getAllProfiles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Regular users can only see their own profile
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id);
    return profiles || [];
  }

  // Admin can see everything
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*');
  return profiles || [];
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return profile;
}

export async function updateProfile(updates: {
  full_name?: string;
  age?: number;
  birthday?: string;
  gender?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { success } = await verifyRateLimit(user.id);
  if (!success) throw new Error("Rate limit exceeded. Try again in 10 seconds.");

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
