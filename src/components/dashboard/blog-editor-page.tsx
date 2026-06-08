"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft, Settings2, Globe, FileText, Loader2,
  Bold, Italic, Code, List, ListOrdered, Quote, AlignLeft,
  Heading1, Heading2, Heading3, ImageIcon, PlayCircle,
  EyeOff, Check, X, Upload, Table2, ChevronDown,
  Undo2, Redo2, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadBlogImage, deleteBlogImage } from "@/lib/blog-image-upload";
import {
  createBlogPost, updateBlogPost, publishBlogPost, unpublishBlogPost,
} from "@/services/blog";
import type { BlogPost, BlogPostInput } from "@/services/blog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Cover Upload ─────────────────────────────────────────────────────────────

interface CoverUploadProps {
  url: string;
  storagePath: string;
  onChange: (url: string, storagePath: string) => void;
  compact?: boolean; // true = sidebar chip, false = full inline zone
}

function CoverUpload({ url, storagePath, onChange, compact = false }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("File too large — max 20 MB before compression"); return; }

    setUploading(true);
    setProgress(0);
    try {
      // Delete old image from storage if replacing
      if (storagePath) await deleteBlogImage(storagePath).catch(() => null);

      const result = await uploadBlogImage(file, pct => setProgress(pct));
      onChange(result.url, result.path);
      toast.success(`Cover uploaded — ${result.sizeKb} KB after compression`);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [storagePath, onChange]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = ""; // allow re-selecting same file
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemove = async () => {
    if (storagePath) await deleteBlogImage(storagePath).catch(() => null);
    onChange("", "");
  };

  // ── Compact (sidebar) ──────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
        {url ? (
          <div className="relative group rounded-lg overflow-hidden aspect-video bg-muted">
            <img src={url} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur-sm">
              <button onClick={() => inputRef.current?.click()} className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-foreground text-[11px] hover:bg-muted transition-colors">Replace</button>
              <button onClick={handleRemove} className="p-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-ring transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[11px]">Uploading… {progress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-[11px]">Click to upload</span>
                <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP · compressed automatically</span>
              </>
            )}
          </button>
        )}
        {uploading && (
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-200 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    );
  }

  // ── Inline / full (document sheet top) ────────────────────────────────────
  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      {url ? (
        <div
          className="relative group aspect-[2.4/1] overflow-hidden cursor-pointer"
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <img src={url} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-muted via-transparent to-transparent" />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-[12px]">
              <Upload className="w-3.5 h-3.5" /> Replace cover
            </div>
            <button
              onClick={e => { e.stopPropagation(); handleRemove(); }}
              className="p-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Upload progress bar */}
          {uploading && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-muted">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-2 py-5 border-b border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer select-none"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[12px]">Uploading… {progress}%</span>
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              <span className="text-[12px]">Add cover image</span>
              <span className="text-[11px] text-muted-foreground">— drag & drop or click · auto-compressed</span>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Hover delete overlay ─────────────────────────────────────────────────────

const DELETABLE_SELECTOR = 'img, table, blockquote, pre, h1, h2, h3, iframe';

function HoverDeleteButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [target, setTarget] = useState<Element | null>(null);
  const [rect,   setRect  ] = useState<DOMRect   | null>(null);
  const btnWrapRef = useRef<HTMLDivElement>(null);
  const targetRef  = useRef<Element | null>(null);

  const apply = useCallback((el: Element | null) => {
    targetRef.current = el;
    setTarget(el);
    setRect(el ? el.getBoundingClientRect() : null);
  }, []);

  // Timer-free hover tracking: a block stays "active" while the cursor is over
  // either the block itself OR the floating delete button (they visually overlap,
  // so there is never a dead gap to cross).
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const node = e.target as Element;

      // Over the delete button → keep current target, do nothing.
      if (btnWrapRef.current?.contains(node)) return;

      const pm = document.querySelector('.ProseMirror');
      if (!pm) return;

      const el = node.closest(DELETABLE_SELECTOR);
      if (el && pm.contains(el)) {
        if (el !== targetRef.current) apply(el);   // only re-render when block changes
      } else if (targetRef.current) {
        apply(null);                                // left a block → hide immediately
      }
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [apply]);

  // Keep rect in sync with scroll / resize while a target is active
  useEffect(() => {
    if (!target) return;
    const sync = () => setRect(target.getBoundingClientRect());
    window.addEventListener('scroll', sync, true);
    window.addEventListener('resize', sync);
    return () => { window.removeEventListener('scroll', sync, true); window.removeEventListener('resize', sync); };
  }, [target]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = targetRef.current;
    if (!el || !editor) return;
    const view = editor.view;
    try {
      const tag = el.tagName.toLowerCase();
      if (tag === 'table') {
        const cell = el.querySelector('td, th');
        if (cell) {
          const pos = view.posAtDOM(cell, 0);
          editor.chain().focus().setTextSelection(pos).deleteTable().run();
        }
      } else if (tag === 'img') {
        const pos = view.posAtDOM(el, 0);
        const node = view.state.doc.nodeAt(pos);
        if (node) editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      } else {
        const innerPos = view.posAtDOM(el, 0);
        const blockPos = Math.max(0, innerPos - 1);
        const node = view.state.doc.nodeAt(blockPos);
        if (node && node.nodeSize > 0) {
          editor.chain().focus().deleteRange({ from: blockPos, to: blockPos + node.nodeSize }).run();
        }
      }
    } catch (err) {
      console.warn('Block delete failed:', err);
    }
    apply(null);
  };

  if (!rect || !target) return null;

  const label = (() => {
    const t = target.tagName.toLowerCase();
    if (/^h[1-6]$/.test(t)) return 'heading';
    if (t === 'pre') return 'code block';
    if (t === 'img') return 'image';
    if (t === 'iframe') return 'video';
    return t; // table, blockquote
  })();

  // Anchor inside the block's top-right corner so there's no gap to cross.
  return (
    <div
      ref={btnWrapRef}
      style={{
        position: 'fixed',
        top: rect.top + 8,
        left: rect.right - 8,
        transform: 'translateX(-100%)',
        zIndex: 200,
      }}
    >
      <button
        type="button"
        onMouseDown={handleDelete}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-destructive text-primary-foreground text-[11px] font-semibold shadow-lg hover:brightness-110 cursor-pointer"
      >
        <Trash2 className="w-3 h-3" />
        Delete {label}
      </button>
    </div>
  );
}

// ─── Table dropdown ───────────────────────────────────────────────────────────

function TableMenu({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click — proper listener so Safari behaves
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!editor) return null;
  const inTable = editor.isActive("table");

  // Plain onClick (not onMouseDown+preventDefault) — works reliably in Safari
  const runAction = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  const actions = inTable ? [
    { label: "Add row above",    fn: () => runAction(() => editor.chain().focus().addRowBefore().run()) },
    { label: "Add row below",    fn: () => runAction(() => editor.chain().focus().addRowAfter().run()) },
    { label: "Delete row",       fn: () => runAction(() => editor.chain().focus().deleteRow().run()), danger: true },
    null, // separator
    { label: "Add column left",  fn: () => runAction(() => editor.chain().focus().addColumnBefore().run()) },
    { label: "Add column right", fn: () => runAction(() => editor.chain().focus().addColumnAfter().run()) },
    { label: "Delete column",    fn: () => runAction(() => editor.chain().focus().deleteColumn().run()), danger: true },
    null,
    { label: "Toggle header row",fn: () => runAction(() => editor.chain().focus().toggleHeaderRow().run()) },
    { label: "Delete table",     fn: () => runAction(() => editor.chain().focus().deleteTable().run()), danger: true },
  ] : [
    { label: "Insert 2 × 2",    fn: () => runAction(() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()) },
    { label: "Insert 3 × 3",    fn: () => runAction(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()) },
    { label: "Insert 4 × 4",    fn: () => runAction(() => editor.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run()) },
    { label: "Insert 3 × 5",    fn: () => runAction(() => editor.chain().focus().insertTable({ rows: 3, cols: 5, withHeaderRow: true }).run()) },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        title="Table"
        className={cn(
          "flex items-center gap-0.5 p-1.5 rounded-md text-[13px] transition-colors",
          inTable || open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Table2 className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[170px] bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            {inTable ? "Table options" : "Insert table"}
          </p>
          {actions.map((a, i) =>
            a === null ? (
              <div key={i} className="my-1 border-t border-border" />
            ) : (
              <button
                key={a.label}
                onClick={a.fn}
                className={cn(
                  "w-full text-left px-3 py-2 text-[13px] transition-colors hover:bg-muted",
                  (a as { danger?: boolean }).danger ? "text-destructive" : "text-foreground"
                )}
              >
                {a.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ToolBtn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        "p-1.5 rounded-md text-[13px] transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const imgInputRef = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);

  const handleInlineImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImgUploading(true);
    try {
      const result = await uploadBlogImage(file);
      editor.chain().focus().setImage({ src: result.url }).run();
      toast.success(`Image inserted — ${result.sizeKb} KB`);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const addYoutube = () => {
    const url = window.prompt("Paste YouTube URL:");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url, width: 720, height: 405 }).run();
  };

  return (
    <div className="sticky top-[57px] z-10 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Hidden file input for inline image upload */}
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInlineImageFile}
      />
      <div className="max-w-3xl mx-auto flex items-center flex-wrap gap-0.5 px-4 sm:px-6 py-2">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)" active={false}><Undo2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)" active={false}><Redo2 className="w-4 h-4" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="w-4 h-4" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code"><Code className="w-4 h-4" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List"><ListOrdered className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block"><AlignLeft className="w-4 h-4" /></ToolBtn>
        <Sep />
        {/* Image — triggers file upload, compresses, inserts into editor */}
        <ToolBtn
          onClick={() => imgInputRef.current?.click()}
          title="Insert Image (upload & compress)"
          active={imgUploading}
        >
          {imgUploading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ImageIcon className="w-4 h-4" />
          }
        </ToolBtn>
        <ToolBtn onClick={addYoutube} title="Embed YouTube"><PlayCircle className="w-4 h-4" /></ToolBtn>
        <Sep />
        <TableMenu editor={editor} />
      </div>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({
  form, onChange, isPublished, wordCount,
}: {
  form: FormState;
  onChange: (f: Partial<FormState>) => void;
  isPublished: boolean;
  wordCount: number;
}) {
  const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors resize-none";

  return (
    <div className="flex flex-col gap-0 divide-y divide-border">

      {/* Status */}
      <div className="p-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Status</p>
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium border border-border",
          isPublished ? "bg-muted text-emerald-400" : "bg-muted text-muted-foreground"
        )}>
          {isPublished ? <Globe className="w-3.5 h-3.5 shrink-0" /> : <FileText className="w-3.5 h-3.5 shrink-0" />}
          {isPublished ? "Published" : "Draft"}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">{wordCount} words</p>
      </div>

      {/* Slug */}
      <div className="p-4">
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">URL Slug</label>
        <div className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-2">
          <span className="text-[11px] text-muted-foreground shrink-0">/blog/</span>
          <input
            value={form.slug}
            onChange={e => onChange({ slug: slugify(e.target.value), slugManual: true })}
            className="flex-1 bg-transparent text-[12px] text-foreground font-mono focus:outline-none min-w-0"
            placeholder="your-slug"
          />
        </div>
      </div>

      {/* Cover image */}
      <div className="p-4">
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Cover Image</label>
        <CoverUpload
          compact
          url={form.cover_image_url}
          storagePath={form.cover_storage_path}
          onChange={(url, path) => onChange({ cover_image_url: url, cover_storage_path: path })}
        />
      </div>

      {/* Excerpt */}
      <div className="p-4">
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={e => onChange({ excerpt: e.target.value })}
          rows={3}
          placeholder="Short summary shown on blog index and landing page…"
          className={inputCls}
        />
      </div>

      {/* SEO */}
      <div className="p-4 space-y-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">SEO</p>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1.5">SEO Title</label>
          <input
            value={form.seo_title}
            onChange={e => onChange({ seo_title: e.target.value })}
            placeholder="Defaults to post title"
            maxLength={60}
            className={inputCls}
          />
          <div className="flex justify-end mt-1">
            <span className={cn("text-[10px]", form.seo_title.length > 55 ? "text-amber-400" : "text-muted-foreground")}>
              {form.seo_title.length}/60
            </span>
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1.5">Meta Description</label>
          <textarea
            value={form.seo_description}
            onChange={e => onChange({ seo_description: e.target.value })}
            rows={3}
            placeholder="Shown in Google results (150–160 chars)"
            maxLength={160}
            className={inputCls}
          />
          <div className="flex justify-end mt-1">
            <span className={cn("text-[10px]", form.seo_description.length > 150 ? "text-emerald-400" : form.seo_description.length > 0 ? "text-amber-400" : "text-muted-foreground")}>
              {form.seo_description.length}/160
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  slug: string;
  slugManual: boolean;
  excerpt: string;
  cover_image_url: string;
  cover_storage_path: string; // storage path for deletion on replace/remove
  content: string;
  seo_title: string;
  seo_description: string;
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

interface BlogEditorPageProps {
  post?: BlogPost | null;
  orgId: string;
}

export function BlogEditorPage({ post, orgId }: BlogEditorPageProps) {
  const router = useRouter();
  const isEdit = !!post;
  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<FormState>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    slugManual: isEdit,
    excerpt: post?.excerpt ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    cover_storage_path: "",  // existing posts: path unknown; deletion handled on replace
    content: post?.content ?? "",
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
  });

  const updateForm = useCallback((f: Partial<FormState>) => {
    setForm(prev => {
      const next = { ...prev, ...f };
      if (!next.slugManual && f.title !== undefined) {
        next.slug = slugify(f.title);
      }
      return next;
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ controls: true, nocookie: true }),
      Placeholder.configure({
        placeholder: ({ node }: { node: { type: { name: string } } }) =>
          node.type.name === 'heading' ? 'Type a heading…' : 'Start writing your blog post…',
      }),
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      updateForm({ content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[60vh] leading-relaxed",
      },
    },
  });

  const wordCount = form.content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  // ── Build payload ──────────────────────────────────────────────────────────

  const buildPayload = (): BlogPostInput => ({
    title: form.title || "Untitled",
    slug: form.slug || slugify(form.title || "untitled"),
    excerpt: form.excerpt || undefined,
    content: form.content,
    cover_image_url: form.cover_image_url || undefined,
    seo_title: form.seo_title || undefined,
    seo_description: form.seo_description || undefined,
  });

  // ── Save draft ─────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (postId) {
        return updateBlogPost(postId, payload);
      } else {
        const created = await createBlogPost(payload, orgId);
        setPostId(created.id);
        window.history.replaceState({}, "", `/dashboard/blog/${created.id}`);
        return created;
      }
    },
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveStatus("idle"), 2500);
    },
    onError: (e: Error) => {
      setSaveStatus("idle");
      toast.error(e.message);
    },
  });

  // ── Publish / Unpublish ────────────────────────────────────────────────────

  const publishMutation = useMutation({
    mutationFn: async () => {
      let id = postId;
      if (!id) {
        const created = await createBlogPost(buildPayload(), orgId);
        id = created.id;
        setPostId(created.id);
        window.history.replaceState({}, "", `/dashboard/blog/${created.id}`);
      } else {
        await updateBlogPost(id, buildPayload());
      }
      if (isPublished) {
        await unpublishBlogPost(id);
        setIsPublished(false);
        toast.success("Post unpublished");
      } else {
        await publishBlogPost(id);
        setIsPublished(true);
        toast.success("Post published — now live at /blog/" + (form.slug || "untitled"));
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isBusy = saveMutation.isPending || publishMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 h-[57px] flex items-center justify-between gap-4 px-4 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard?tab=blog")}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </button>
          <div className="w-px h-4 bg-border" />
          <span className="text-[13px] text-muted-foreground truncate max-w-[180px] sm:max-w-xs">
            {form.title || "Untitled post"}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Save status */}
          <span className={cn(
            "text-[11px] transition-all duration-300 hidden sm:flex items-center gap-1",
            saveStatus === "saving" ? "text-muted-foreground" :
            saveStatus === "saved"  ? "text-emerald-400" : "text-transparent"
          )}>
            {saveStatus === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
            {saveStatus === "saved"  && <Check className="w-3 h-3" />}
            {saveStatus === "saving" ? "Saving…" : "Saved"}
          </span>

          {/* Save draft */}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Publish / Unpublish */}
          <button
            onClick={() => publishMutation.mutate()}
            disabled={isBusy || !form.title}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50 border",
              isPublished
                ? "bg-muted text-muted-foreground hover:text-foreground border-border"
                : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
            )}
          >
            {publishMutation.isPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : isPublished
                ? <EyeOff className="w-3.5 h-3.5" />
                : <Globe className="w-3.5 h-3.5" />
            }
            {isPublished ? "Unpublish" : "Publish"}
          </button>

          {/* Settings toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            title="Toggle settings"
            className={cn(
              "p-2 rounded-lg transition-colors border",
              sidebarOpen
                ? "bg-muted text-foreground border-border"
                : "text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 bg-background">

        {/* Editor column */}
        <div className="flex-1 min-w-0 flex flex-col">

          <Toolbar editor={editor} />

          {/* Writing area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">

              {/* Document sheet */}
              <div className="rounded-2xl border border-border bg-muted shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">

                {/* Cover zone */}
                <CoverUpload
                  url={form.cover_image_url}
                  storagePath={form.cover_storage_path}
                  onChange={(url, path) => updateForm({ cover_image_url: url, cover_storage_path: path })}
                />

                {/* Inner padding */}
                <div className="px-6 sm:px-10 py-8 sm:py-10">

                  {/* Title */}
                  <input
                    value={form.title}
                    onChange={e => updateForm({ title: e.target.value })}
                    placeholder="Post title"
                    className="w-full bg-transparent text-3xl sm:text-[2.5rem] font-bold text-foreground placeholder:text-muted-foreground focus:outline-none mb-3 leading-[1.15] tracking-tight"
                  />

                  {/* Slug preview */}
                  <div className="flex items-center gap-2 mb-8 pb-6 border-b border-border">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      /blog/<span className="text-foreground">{form.slug || slugify(form.title) || "your-slug"}</span>
                    </span>
                  </div>

                  {/* Hover-delete overlay — rendered once, works globally in editor */}
                  {editor && <HoverDeleteButton editor={editor} />}

                  {/* TipTap — all prose styles live in globals.css .ProseMirror rules */}
                  <div className="blog-editor-prose">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              {/* Footer meta */}
              <p className="text-center text-[11px] text-muted-foreground mt-4">
                {wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read
              </p>
            </div>
          </div>
        </div>

        {/* ── Settings sidebar ────────────────────────────────────────────── */}
        <aside className={cn(
          "shrink-0 border-l border-border bg-card overflow-y-auto transition-all duration-200",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden border-l-0"
        )}>
          {sidebarOpen && (
            <SettingsPanel
              form={form}
              onChange={updateForm}
              isPublished={isPublished}
              wordCount={wordCount}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
