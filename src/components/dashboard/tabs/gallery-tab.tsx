"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Eye, EyeOff, Trash2, X } from "lucide-react";
import {
  listGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem,
} from "@/services/gallery";
import type { Tables } from "@/types/supabase";

type GalleryItem = Tables<"gallery_items">;

export function GalleryTab() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: listGalleryItems,
  });

  const createMut = useMutation({
    mutationFn: createGalleryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Added");
      setShowAdd(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GalleryItem> }) => updateGalleryItem(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Removed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Gallery</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Before/after photos for the website gallery section.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {showAdd && <AddGalleryForm onSubmit={(d) => createMut.mutate(d)} onClose={() => setShowAdd(false)} loading={createMut.isPending} />}

      {isLoading ? (
        <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
      ) : (items ?? []).length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center text-[13px] text-muted-foreground">
          No gallery items yet. Click "Add Image" to upload one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items ?? []).map((it) => (
            <div key={it.id} className="bg-card border border-border rounded-2xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image_url} alt={it.title ?? ""} className="w-full h-48 object-cover" />
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{it.title ?? "Untitled"}</p>
                    {it.caption && <p className="text-[11px] text-muted-foreground truncate">{it.caption}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => updateMut.mutate({ id: it.id, updates: { is_published: !it.is_published } })}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      it.is_published ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {it.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {it.is_published ? "Live" : "Hidden"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this image?")) deleteMut.mutate(it.id); }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddGalleryForm({
  onSubmit, onClose, loading,
}: {
  onSubmit: (data: { image_url: string; title?: string | null; caption?: string | null; service_tag?: string | null; is_published?: boolean }) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-foreground">Add Gallery Image</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded"><X className="w-4 h-4" /></button>
      </div>
      <input
        placeholder="Image URL (e.g. https://...) or /local-path.jpg"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px]"
      />
      <input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px]"
      />
      <input
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px]"
      />
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          disabled={!imageUrl || loading}
          onClick={() => onSubmit({ image_url: imageUrl, title: title || null, caption: caption || null, is_published: true })}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Tip: For now, host images on Supabase Storage or Cloudinary and paste the URL.
      </p>
    </div>
  );
}
