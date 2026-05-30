"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Trash2 } from "lucide-react";
import { listLeads, updateLeadStatus, deleteLead } from "@/services/leads";

const STATUSES = ["all", "new", "contacted", "booked", "closed"] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-500/10 text-amber-500",
  contacted: "bg-blue-500/10 text-blue-500",
  booked: "bg-emerald-500/10 text-emerald-500",
  closed: "bg-muted text-muted-foreground",
};

export function LeadsTab() {
  const [filter, setFilter] = useState<string>("all");
  const qc = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", filter],
    queryFn: () => listLeads(filter),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLeadStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Status updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Lead deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Leads</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Contact form submissions. Click status to change.
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors capitalize ${
                filter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : (leads ?? []).length === 0 ? (
          <div className="p-12 text-center text-[13px] text-muted-foreground">
            No leads yet. Once your contact form is wired up, they'll appear here.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(leads ?? []).map((l) => {
              const style = STATUS_STYLES[l.status] ?? STATUS_STYLES.new;
              return (
                <div key={l.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-foreground">{l.name}</p>
                        <select
                          value={l.status}
                          onChange={(e) => updateMutation.mutate({ id: l.id, status: e.target.value })}
                          className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 border-0 focus:ring-1 focus:ring-primary cursor-pointer ${style}`}
                        >
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="booked">booked</option>
                          <option value="closed">closed</option>
                        </select>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                        <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                          <Mail className="w-3 h-3" /> {l.email}
                        </a>
                        {l.phone && (
                          <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                            <Phone className="w-3 h-3" /> {l.phone}
                          </a>
                        )}
                        {l.service_interest && (
                          <span className="px-2 py-0.5 bg-muted rounded">Interested: {l.service_interest}</span>
                        )}
                      </div>
                      {l.message && (
                        <p className="mt-2 text-[13px] text-foreground/80 whitespace-pre-wrap">{l.message}</p>
                      )}
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        via {l.source} · {new Date(l.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete lead from ${l.name}?`)) deleteMutation.mutate(l.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
