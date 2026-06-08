"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Globe, EyeOff, Loader2,
  BookOpen, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  listBlogPosts, publishBlogPost, unpublishBlogPost, deleteBlogPost,
  cleanupOrphanedBlogImages,
} from "@/services/blog";
import type { BlogPost } from "@/services/blog";

// Run the orphaned-image sweep at most once an hour — opening the Blog tab
// is a frequent, low-stakes moment to self-heal storage without nagging the
// user or hammering the bucket's `list` endpoint on every render.
const GC_THROTTLE_KEY = "blog-image-gc-last-run";
const GC_THROTTLE_MS = 60 * 60 * 1000;

function maybeRunImageCleanup() {
  try {
    const last = Number(sessionStorage.getItem(GC_THROTTLE_KEY) ?? 0);
    if (Date.now() - last < GC_THROTTLE_MS) return;
    sessionStorage.setItem(GC_THROTTLE_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (e.g. private mode) — just run once per page life
  }

  cleanupOrphanedBlogImages()
    .then(({ deleted }) => {
      if (deleted > 0) {
        toast.success(`Cleaned up ${deleted} unused image${deleted === 1 ? "" : "s"} from storage`);
      }
    })
    .catch(() => {});
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Post Row ─────────────────────────────────────────────────────────────────

function PostRow({ post }: { post: BlogPost }) {
  const router = useRouter();
  const qc = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => post.is_published ? unpublishBlogPost(post.id) : publishBlogPost(post.id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success(updated.is_published ? "Post published" : "Post unpublished");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBlogPost(post.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-muted/20 transition-colors group">

      {/* Cover thumbnail */}
      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
        {post.cover_image_url
          ? <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <BookOpen className="w-4 h-4 text-muted-foreground/40" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/dashboard/blog/${post.id}`)}>
        <p className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {post.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn(
            "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            post.is_published
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border"
          )}>
            {post.is_published ? "Published" : "Draft"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {post.is_published && post.published_at
              ? formatDate(post.published_at)
              : `Created ${formatDate(post.created_at)}`}
          </span>
          <code className="text-[10px] text-muted-foreground/40 font-mono hidden sm:block">
            /blog/{post.slug}
          </code>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {post.is_published && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="View live"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
          title={post.is_published ? "Unpublish" : "Publish"}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {toggleMutation.isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : post.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />
          }
        </button>
        <button
          onClick={() => router.push(`/dashboard/blog/${post.id}`)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Edit post"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
            deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          title="Delete"
        >
          {deleteMutation.isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function BlogTab() {
  const router = useRouter();

  const postsQuery = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => listBlogPosts({ pageSize: 50 }),
  });

  useEffect(() => { maybeRunImageCleanup(); }, []);

  const posts = postsQuery.data?.data ?? [];
  const published = posts.filter(p => p.is_published).length;
  const drafts = posts.filter(p => !p.is_published).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Blog Posts</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Write and publish posts to improve your site's SEO.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/blog/new")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Stats */}
      {posts.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[12px] font-medium text-emerald-400">{published} published</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border">
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] font-medium text-muted-foreground">{drafts} draft{drafts !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {/* Post list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {postsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">No blog posts yet</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Create your first post to start building SEO.</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/blog/new")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Write First Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {posts.map(post => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
