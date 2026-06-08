"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/types/supabase";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";

export type BlogPost = Tables<"blog_posts">;

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  seo_title?: string;
  seo_description?: string;
};

export interface BlogListResult {
  data: BlogPost[];
  total: number;
}

export async function listBlogPosts(opts: {
  page?: number;
  pageSize?: number;
  publishedOnly?: boolean;
}): Promise<BlogListResult> {
  const { page = 1, pageSize = 20, publishedOnly = false } = opts;
  // Public reads (publishedOnly) use admin client to avoid cookie/auth issues.
  // Dashboard reads use the session client so RLS still applies for write ops.
  const supabase = publishedOnly ? createAdminClient() : await createClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as BlogPost[], total: count ?? 0 };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("slug", slug)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

// Public reads use the admin client (no cookies, bypasses RLS).
// Safe because we always filter by app_id + is_published.

export async function getPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function getLatestPublishedPosts(limit = 3): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("app_id", APP_ID)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

// Safe to call from generateStaticParams at build time (no cookies).
export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("app_id", APP_ID)
    .eq("is_published", true);

  if (error) throw error;
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

export async function createBlogPost(
  input: BlogPostInput,
  organizationId: string
): Promise<BlogPost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...input,
      app_id: APP_ID,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/blog");
  return data as BlogPost;
}

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>
): Promise<BlogPost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/blog");
  if ((data as BlogPost).slug) revalidatePath(`/blog/${(data as BlogPost).slug}`);
  return data as BlogPost;
}

export async function publishBlogPost(id: string): Promise<BlogPost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/blog");
  revalidatePath(`/blog/${(data as BlogPost).slug}`);
  revalidatePath("/");
  return data as BlogPost;
}

export async function unpublishBlogPost(id: string): Promise<BlogPost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ is_published: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/blog");
  revalidatePath(`/blog/${(data as BlogPost).slug}`);
  revalidatePath("/");
  return data as BlogPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/blog");
  if (data?.slug) revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/");
}
