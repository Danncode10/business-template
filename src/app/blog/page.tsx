import type { Metadata } from "next";
import Link from "next/link";
import { listBlogPosts } from "@/services/blog";
import { siteConfig } from "@/lib/config";
import { CalendarDays, Clock, Newspaper } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: `Tips, guides, and news from ${siteConfig.name}.`,
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: `Tips, guides, and news from ${siteConfig.name}.`,
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage() {
  // Best-effort fetch — page still builds (empty state) when the DB is
  // unreachable, e.g. CI builds with placeholder Supabase env. ISR
  // (revalidate above) repopulates it at runtime.
  let posts: Awaited<ReturnType<typeof listBlogPosts>>["data"] = [];
  try {
    ({ data: posts } = await listBlogPosts({ publishedOnly: true, pageSize: 50 }));
  } catch {
    // ignore — blog table may be unreachable at build time
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
          Our Blog
        </h1>
        <p className="text-[16px] text-muted-foreground max-w-xl mx-auto">
          Tips, guides, and news from the team at {siteConfig.name}.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[15px] text-muted-foreground">No posts published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
            >
              {/* Cover */}
              <div className="aspect-video bg-muted/40 overflow-hidden">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h2 className="text-[15px] font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(post.published_at ?? post.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readingTime(post.content)} min read
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
