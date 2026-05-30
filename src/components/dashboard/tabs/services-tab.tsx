"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Check, X, Eye, EyeOff, Pencil } from "lucide-react";
import { listServices, updateService } from "@/services/services";
import type { Tables } from "@/types/supabase";

type Service = Tables<"services">;

function EditableCell({
  value, onSave, type = "text", prefix,
}: {
  value: string | number | null;
  onSave: (val: string) => Promise<void>;
  type?: "text" | "number";
  prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value?.toString() ?? ""); setEditing(true); }}
        className="group inline-flex items-center gap-1.5 hover:text-primary transition-colors text-left"
      >
        <span>{prefix}{value ?? "—"}</span>
        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50" />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
        className="bg-background border border-border rounded px-2 py-1 text-[13px] w-24 focus:outline-none focus:ring-1 focus:ring-primary"
        disabled={saving}
      />
      <button
        onClick={async () => {
          setSaving(true);
          try { await onSave(draft); setEditing(false); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
          finally { setSaving(false); }
        }}
        className="p-1 text-emerald-500 hover:bg-muted rounded"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      </button>
      <button onClick={() => setEditing(false)} className="p-1 text-muted-foreground hover:bg-muted rounded">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export function ServicesTab() {
  const qc = useQueryClient();
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: listServices,
  });

  const mutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Service> }) => updateService(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["recent-activity"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const save = async (id: string, updates: Partial<Service>) => {
    await mutation.mutateAsync({ id, updates });
    toast.success("Saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Services</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Edit names, prices, and visibility. Changes go live immediately.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : (services ?? []).length === 0 ? (
          <div className="p-12 text-center text-[13px] text-muted-foreground">No services yet.</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3">Service</th>
                <th className="px-3 py-3">Price From</th>
                <th className="px-3 py-3">Price To</th>
                <th className="px-3 py-3">Duration</th>
                <th className="px-3 py-3">Published</th>
                <th className="px-3 py-3">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(services ?? []).map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <EditableCell value={s.name} onSave={(v) => save(s.id, { name: v })} />
                    {s.short_desc && <p className="text-[11px] text-muted-foreground mt-0.5">{s.short_desc}</p>}
                  </td>
                  <td className="px-3 py-3">
                    <EditableCell value={s.price_from} type="number" prefix="$" onSave={(v) => save(s.id, { price_from: v ? parseFloat(v) : null })} />
                  </td>
                  <td className="px-3 py-3">
                    <EditableCell value={s.price_to} type="number" prefix="$" onSave={(v) => save(s.id, { price_to: v ? parseFloat(v) : null })} />
                  </td>
                  <td className="px-3 py-3">
                    <EditableCell value={s.duration_minutes} type="number" onSave={(v) => save(s.id, { duration_minutes: v ? parseInt(v) : null })} />
                    <span className="text-[10px] text-muted-foreground ml-1">min</span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => save(s.id, { is_published: !s.is_published })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        s.is_published ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {s.is_published ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={!!s.is_featured}
                      onChange={() => save(s.id, { is_featured: !s.is_featured })}
                      className="accent-primary cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Tip: Click any field to edit. All changes are logged in <code>audit_logs</code>.
      </p>
    </div>
  );
}
