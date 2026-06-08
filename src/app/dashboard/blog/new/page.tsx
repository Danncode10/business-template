import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { BlogEditorPage } from "@/components/dashboard/blog-editor-page";
import { QueryProvider } from "@/components/query-provider";

export const metadata = { title: "New Blog Post" };

async function getOrgId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  return profile?.organization_id ?? "";
}

export default async function NewBlogPostPage() {
  const orgId = await getOrgId();
  return (
    <QueryProvider>
      <BlogEditorPage post={null} orgId={orgId} />
    </QueryProvider>
  );
}
