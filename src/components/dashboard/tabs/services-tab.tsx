"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Plus, Trash2, Loader2, Sparkles, X, Pencil, Star } from "lucide-react";
import { listServices, updateService, createService, deleteService } from "@/services/services";
import type { Tables } from "@/types/supabase";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PriceTier = { label: string; price: string };
type Service = Tables<"services"> & { features: string[]; pricing_tiers: PriceTier[] };

const asFeatures = (raw: unknown): string[] => (Array.isArray(raw) ? (raw as string[]) : []);
const asTiers    = (raw: unknown): PriceTier[] => (Array.isArray(raw) ? (raw as PriceTier[]) : []);

const MAIN_GROUPS = [
  { key: "exterior",  label: "Exterior"  },
  { key: "interior",  label: "Interior"  },
  { key: "exclusive", label: "Exclusive" },
] as const;

type MainGroup = (typeof MAIN_GROUPS)[number]["key"];

// ─── Inline text editor (used only in SimpleRow) ──────────────────────────────

function InlineText({
  value, onSave, className, placeholder, multiline,
}: {
  value: string; onSave: (v: string) => void;
  className?: string; placeholder?: string; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => { onSave(draft); setEditing(false); };

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className={cn("group inline-flex items-start gap-1 text-left", className)}
      >
        <span>{value || <span className="italic opacity-30">{placeholder}</span>}</span>
        <Pencil className="w-3 h-3 mt-0.5 opacity-0 group-hover:opacity-40 shrink-0 transition-opacity" />
      </button>
    );
  }

  const sharedClass = cn("bg-background/80 border border-primary/60 rounded px-2 py-0.5 focus:outline-none", className);
  return (
    <span className="inline-flex items-center gap-1">
      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          value={draft}
          rows={2}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
          className={cn(sharedClass, "resize-none w-full")}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className={sharedClass}
        />
      )}
      <button onClick={commit} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
      <button onClick={() => setEditing(false)} className="p-0.5 text-muted-foreground"><X className="w-3 h-3" /></button>
    </span>
  );
}

// ─── Edit Package Modal ───────────────────────────────────────────────────────

function EditPackageModal({ service, onSave, onClose }: {
  service: Service;
  onSave: (updates: Partial<Service & { features: string[]; pricing_tiers: PriceTier[] }>) => void;
  onClose: () => void;
}) {
  const [name, setName]           = useState(service.name);
  const [badge, setBadge]         = useState(service.badge ?? "");
  const [features, setFeatures]   = useState(asFeatures(service.features));
  const [tiers, setTiers]         = useState(asTiers(service.pricing_tiers));
  const [isPublished, setIsPublished] = useState(service.is_published ?? true);
  const [isPopular, setIsPopular] = useState(service.is_featured ?? false);
  const [newFeature, setNewFeature] = useState("");
  const [newLabel, setNewLabel]   = useState("");
  const [newPrice, setNewPrice]   = useState("");

  const handleSave = () => {
    // Auto-commit any in-progress inputs so the user doesn't have to click ✓ first
    const finalFeatures = newFeature.trim() ? [...features, newFeature.trim()] : features;
    const finalTiers    = newPrice.trim()   ? [...tiers, { label: newLabel.trim(), price: newPrice.trim() }] : tiers;
    onSave({
      name: name.trim() || service.name,
      badge: badge.trim() || null,
      features: finalFeatures as unknown as Service["features"],
      pricing_tiers: finalTiers as unknown as Service["pricing_tiers"],
      is_published: isPublished,
      is_featured: isPopular,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Edit Package</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Package Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              placeholder="Package name"
            />
          </div>

          {/* Badge */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Badge Text</label>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. Popular, New, Best Value"
            />
          </div>

          {/* Toggles: Popular + Published */}
          <div className="space-y-3">
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Settings</label>

            {/* Popular */}
            <button
              type="button"
              onClick={() => setIsPopular(!isPopular)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                isPopular
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground"
              )}>
              <div className="flex items-center gap-2.5">
                <Star className={cn("w-4 h-4", isPopular ? "text-primary fill-primary" : "text-muted-foreground")} />
                <div className="text-left">
                  <p className="text-sm font-medium">Popular</p>
                  <p className="text-[11px] opacity-60">Highlights this card with a featured border</p>
                </div>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full relative transition-colors shrink-0",
                isPopular ? "bg-primary" : "bg-muted"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                  isPopular ? "left-5" : "left-0.5"
                )} />
              </div>
            </button>

            {/* Published */}
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                isPublished
                  ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                  : "border-border bg-background text-muted-foreground"
              )}>
              <div className="flex items-center gap-2.5">
                <div className={cn("w-2 h-2 rounded-full shrink-0", isPublished ? "bg-emerald-400" : "bg-muted-foreground/50")} />
                <div className="text-left">
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-[11px] opacity-60">Visible on the public website</p>
                </div>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full relative transition-colors shrink-0",
                isPublished ? "bg-emerald-500" : "bg-muted"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                  isPublished ? "left-5" : "left-0.5"
                )} />
              </div>
            </button>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Features</label>
            <div className="space-y-1.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <input
                    value={f}
                    onChange={(e) => setFeatures(features.map((x, j) => j === i ? e.target.value : x))}
                    className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFeature.trim()) { setFeatures([...features, newFeature.trim()]); setNewFeature(""); }
                  }}
                  placeholder="Add feature…"
                  className="flex-1 bg-background border border-dashed border-border rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground focus:outline-none focus:border-primary/50 focus:text-foreground"
                />
                {newFeature.trim() && (
                  <button onClick={() => { setFeatures([...features, newFeature.trim()]); setNewFeature(""); }}
                    className="p-1 text-emerald-400 shrink-0"><Check className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Pricing Tiers</label>
            <div className="space-y-1.5">
              {tiers.map((t, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <input
                    value={t.label}
                    onChange={(e) => setTiers(tiers.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                    placeholder="Label (e.g. SUV)"
                    className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <input
                    value={t.price}
                    onChange={(e) => setTiers(tiers.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                    placeholder="$0"
                    className="w-24 bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button onClick={() => setTiers(tiers.filter((_, j) => j !== i))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label (e.g. Sedan)"
                  className="flex-1 bg-background border border-dashed border-border rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground focus:outline-none focus:border-primary/50 focus:text-foreground"
                />
                <input
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPrice.trim()) { setTiers([...tiers, { label: newLabel, price: newPrice }]); setNewLabel(""); setNewPrice(""); }
                  }}
                  placeholder="$0"
                  className="w-24 bg-background border border-dashed border-border rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground focus:outline-none focus:border-primary/50 focus:text-foreground"
                />
                {newPrice.trim() && (
                  <button onClick={() => { setTiers([...tiers, { label: newLabel, price: newPrice }]); setNewLabel(""); setNewPrice(""); }}
                    className="p-1 text-emerald-400 shrink-0"><Check className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package card ─────────────────────────────────────────────────────────────

function PackageCard({ service, onUpdate, onDelete }: {
  service: Service;
  onUpdate: (u: Partial<Service & { features: string[]; pricing_tiers: PriceTier[] }>) => void;
  onDelete: () => void;
}) {
  const features = asFeatures(service.features);
  const tiers    = asTiers(service.pricing_tiers);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className={cn(
        "rounded-3xl p-px flex flex-col",
        service.is_featured
          ? "bg-gradient-to-br from-primary via-primary/40 to-primary/10"
          : "bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent",
      )}>
        {/* Card body */}
        <div className={cn(
          "rounded-3xl p-6 flex flex-col gap-5 h-full",
          service.is_featured ? "bg-card/95" : "bg-card",
        )}>

          {/* Top bar: badge + controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Badge / Popular / Hidden */}
            <div className="flex items-center gap-2 min-w-0">
              {service.is_featured ? (
                <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-semibold flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-white" />
                  Popular
                </span>
              ) : service.badge ? (
                <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  {service.badge}
                </span>
              ) : null}
              {!service.is_published && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium shrink-0">
                  Hidden
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-1 shrink-0">
              <button
                title="Edit package"
                onClick={() => setEditOpen(true)}
                className="p-1.5 rounded-lg text-muted-foreground bg-muted hover:text-foreground hover:bg-muted/80 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                title="Delete"
                onClick={() => confirm(`Delete "${service.name}"?`) && onDelete()}
                className="p-1.5 rounded-lg text-muted-foreground bg-muted hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Name */}
          <p className={cn("font-bold text-xl leading-tight", service.is_featured ? "text-primary" : "text-white")}>
            {service.name}
          </p>

          {/* Features list */}
          <ul className="space-y-2 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>

          {/* Pricing tiers */}
          {tiers.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className={cn(
                "grid gap-2",
                tiers.length === 3 ? "grid-cols-3" : tiers.length === 2 ? "grid-cols-2" : "grid-cols-1"
              )}>
                {tiers.map((t, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">{t.label}</p>
                    <p className={cn("font-bold", service.is_featured ? "text-primary text-lg" : "text-white text-base")}>
                      {t.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <EditPackageModal
          service={service}
          onSave={(u) => onUpdate(u)}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

// ─── Simple row (Paint Correction & Add-ons) ──────────────────────────────────

function SimpleRow({ service, onUpdate, onDelete }: {
  service: Service;
  onUpdate: (u: Partial<Service>) => void;
  onDelete: () => void;
}) {
  const tiers = asTiers(service.pricing_tiers);
  const price = tiers[0]?.price ?? "";
  const setPrice = (v: string) =>
    onUpdate({ pricing_tiers: [{ label: "", price: v }, ...tiers.slice(1)] as unknown as Service["pricing_tiers"] });

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 group">
      <InlineText value={service.name} onSave={(v) => onUpdate({ name: v })}
        className="text-sm text-white flex-1 mr-4" placeholder="Item name" />
      <div className="flex items-center gap-3 shrink-0">
        <InlineText value={price} onSave={setPrice}
          className="text-sm font-bold text-primary min-w-[60px] text-right justify-end"
          placeholder="$0" />
        <button onClick={() => confirm(`Delete "${service.name}"?`) && onDelete()}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Add package / Add row forms ──────────────────────────────────────────────

function AddPackageCard({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="rounded-3xl border-2 border-dashed border-border hover:border-primary/30 min-h-[200px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors w-full">
        <Plus className="w-6 h-6" />
        <span className="text-[13px]">Add package</span>
      </button>
    );
  }
  return (
    <div className="rounded-3xl border-2 border-dashed border-primary/30 p-6 flex flex-col gap-3 min-h-[200px]">
      <p className="text-[13px] font-semibold text-foreground">New package</p>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Package name"
        onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) { onAdd(name.trim()); setName(""); setOpen(false); } if (e.key === "Escape") setOpen(false); }}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
      <div className="flex gap-2 mt-auto">
        <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-[13px] text-muted-foreground">Cancel</button>
        <button disabled={!name.trim()}
          onClick={() => { onAdd(name.trim()); setName(""); setOpen(false); }}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium disabled:opacity-50">
          Add
        </button>
      </div>
    </div>
  );
}

function AddRowButton({ onAdd, placeholder }: { onAdd: (name: string, price: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 mt-2 text-[13px] text-muted-foreground hover:text-primary transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add item
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 mt-3">
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 min-w-0" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$0"
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) { onAdd(name.trim(), price.trim()); setName(""); setPrice(""); setOpen(false); }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 shrink-0" />
      <button onClick={() => { if (name.trim()) { onAdd(name.trim(), price.trim()); setName(""); setPrice(""); } setOpen(false); }}
        className="text-emerald-400 shrink-0"><Check className="w-4 h-4" /></button>
      <button onClick={() => setOpen(false)} className="text-muted-foreground shrink-0"><X className="w-4 h-4" /></button>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function ServicesTab() {
  const [activeGroup, setActiveGroup] = useState<MainGroup>("exterior");
  const qc = useQueryClient();

  const { data: allServices, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: listServices,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) => updateService(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["recent-activity"] });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const createMut = useMutation({
    mutationFn: async (input: { name: string; category: string; features?: string[]; pricing_tiers?: PriceTier[]; display_order?: number }) => {
      const orgId = ((allServices ?? []) as Service[])[0]?.organization_id;
      if (!orgId) throw new Error("No existing services to derive organization — add at least one service first.");
      return createService({
        name: input.name,
        slug: `${input.category}-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        category: input.category,
        features: (input.features ?? []) as unknown as never,
        pricing_tiers: (input.pricing_tiers ?? []) as unknown as never,
        organization_id: orgId,
        is_published: true,
        is_featured: false,
        display_order: input.display_order ?? 99,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Added");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const save = (id: string, updates: Record<string, unknown>) => {
    updateMut.mutate({ id, updates });
  };

  const byGroup = (cat: string) =>
    ((allServices ?? []) as Service[])
      .filter(s => s.category === cat)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const mainServices   = byGroup(activeGroup);
  const paintServices  = byGroup("paint-correction");
  const addonServices  = byGroup("addons");

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Services & Packages</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Click the <Pencil className="inline w-3 h-3 mb-0.5" /> icon on any card to edit it.
        </p>
      </div>

      {/* ── Main packages (Exterior / Interior / Exclusive) ── */}
      <div className="space-y-5">
        {/* Tabs — scrollable on small screens */}
        <div className="flex overflow-x-auto pb-1 -mb-1">
          <div className="flex gap-1 bg-muted/60 rounded-2xl p-1 border border-border shrink-0">
            {MAIN_GROUPS.map(({ key, label }) => {
              const count = byGroup(key).length;
              return (
                <button key={key} onClick={() => setActiveGroup(key)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    activeGroup === key
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-white"
                  )}>
                  {label}
                  <span className={cn(
                    "ml-1.5 text-[10px] font-bold",
                    activeGroup === key ? "opacity-80" : "opacity-50"
                  )}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : (
          <div className={cn(
            "grid gap-5",
            mainServices.length <= 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {mainServices.map(s => (
              <PackageCard key={s.id} service={s}
                onUpdate={(u) => save(s.id, u as Record<string, unknown>)}
                onDelete={() => deleteMut.mutate(s.id)} />
            ))}
            <AddPackageCard onAdd={(name) => createMut.mutate({ name, category: activeGroup })} />
          </div>
        )}
      </div>

      {/* ── Paint Correction + Add-ons side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-border">

        {/* Paint Correction */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-xl">Paint Correction</h3>
          <div className="rounded-3xl p-px bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent">
            <div className="bg-card rounded-3xl px-6 py-4">
              <div className="text-[10px] text-muted-foreground mb-3 flex justify-between pr-8">
                <span>Service</span><span>Price</span>
              </div>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : paintServices.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">No items yet.</p>
              ) : (
                paintServices.map(s => (
                  <SimpleRow key={s.id} service={s}
                    onUpdate={(u) => save(s.id, u as Record<string, unknown>)}
                    onDelete={() => deleteMut.mutate(s.id)} />
                ))
              )}
              <AddRowButton placeholder="e.g. Single Stage Polish"
                onAdd={(name, price) => createMut.mutate({
                  name, category: "paint-correction",
                  pricing_tiers: price ? [{ label: "", price }] : [],
                  display_order: (paintServices.at(-1)?.display_order ?? 0) + 10,
                })} />
            </div>
          </div>
        </div>

        {/* Add-ons */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-xl">Add-ons</h3>
          <div className="rounded-3xl p-px bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent">
            <div className="bg-card rounded-3xl px-6 py-4">
              <div className="text-[10px] text-muted-foreground mb-3 flex justify-between pr-8">
                <span>Service</span><span>Price</span>
              </div>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : addonServices.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">No items yet.</p>
              ) : (
                addonServices.map(s => (
                  <SimpleRow key={s.id} service={s}
                    onUpdate={(u) => save(s.id, u as Record<string, unknown>)}
                    onDelete={() => deleteMut.mutate(s.id)} />
                ))
              )}
              <AddRowButton placeholder="e.g. Ceramic Coating"
                onAdd={(name, price) => createMut.mutate({
                  name, category: "addons",
                  pricing_tiers: price ? [{ label: "", price }] : [],
                  display_order: (addonServices.at(-1)?.display_order ?? 0) + 10,
                })} />
            </div>
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {(updateMut.isPending || createMut.isPending || deleteMut.isPending) && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg text-[13px] text-muted-foreground z-50">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
        </div>
      )}
    </div>
  );
}
