import Link from "next/link";
import { CalendarDays, ArrowRight, Newspaper } from "lucide-react";
import { getLatestPublishedPosts } from "@/services/blog";
import type { BlogPost } from "@/services/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:bg-muted transition-all duration-300"
    >
      {/* Cover */}
      <div className="aspect-video bg-muted overflow-hidden">
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
        <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto">
          <CalendarDays className="w-3 h-3" />
          {formatDate(post.published_at ?? post.created_at)}
        </div>
      </div>
    </Link>
  );
}

export async function BlogPreview() {
  let posts: BlogPost[] = [];
  try {
    posts = await getLatestPublishedPosts(3);
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase mb-2">
              From the Blog
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Tips &amp; Insights
            </h2>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all posts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
