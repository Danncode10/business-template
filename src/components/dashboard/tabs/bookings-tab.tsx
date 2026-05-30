"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Car, Trash2, Calendar } from "lucide-react";
import { listBookings, updateBooking, deleteBooking } from "@/services/bookings";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  confirmed: "bg-blue-500/10 text-blue-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-rose-500/10 text-rose-500",
};

const PAYMENT_STYLES: Record<string, string> = {
  unpaid: "bg-rose-500/10 text-rose-500",
  deposit: "bg-amber-500/10 text-amber-500",
  paid: "bg-emerald-500/10 text-emerald-500",
};

export function BookingsTab() {
  const [filter, setFilter] = useState<string>("all");
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", filter],
    queryFn: () => listBookings(filter),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) => updateBooking(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Booking updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Booking deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Bookings</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Appointment requests. Update status and payment as work progresses.
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 flex-wrap">
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
        ) : (bookings ?? []).length === 0 ? (
          <div className="p-12 text-center text-[13px] text-muted-foreground">
            No bookings yet. Booking form coming soon — for now, you can add them directly from the website.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(bookings ?? []).map((b) => {
              const statusStyle = STATUS_STYLES[b.status] ?? STATUS_STYLES.pending;
              const payStyle = PAYMENT_STYLES[b.payment_status] ?? PAYMENT_STYLES.unpaid;
              const vehicle = [b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(" ");

              return (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-foreground">{b.customer_name}</p>
                        <span className="text-[12px] text-primary font-medium">{b.service_name}</span>
                        <select
                          value={b.status}
                          onChange={(e) => updateMut.mutate({ id: b.id, updates: { status: e.target.value } })}
                          className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 border-0 focus:ring-1 focus:ring-primary cursor-pointer ${statusStyle}`}
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        <select
                          value={b.payment_status}
                          onChange={(e) => updateMut.mutate({ id: b.id, updates: { payment_status: e.target.value } })}
                          className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 border-0 focus:ring-1 focus:ring-primary cursor-pointer ${payStyle}`}
                        >
                          <option value="unpaid">unpaid</option>
                          <option value="deposit">deposit</option>
                          <option value="paid">paid</option>
                        </select>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                        <a href={`mailto:${b.customer_email}`} className="inline-flex items-center gap-1 hover:text-primary">
                          <Mail className="w-3 h-3" /> {b.customer_email}
                        </a>
                        {b.customer_phone && (
                          <a href={`tel:${b.customer_phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                            <Phone className="w-3 h-3" /> {b.customer_phone}
                          </a>
                        )}
                        {vehicle && (
                          <span className="inline-flex items-center gap-1">
                            <Car className="w-3 h-3" /> {vehicle}
                          </span>
                        )}
                        {(b.confirmed_date || b.preferred_date) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {b.confirmed_date ?? b.preferred_date}
                            {b.confirmed_time && ` @ ${b.confirmed_time}`}
                          </span>
                        )}
                        {b.price_quoted && (
                          <span className="px-2 py-0.5 bg-muted rounded">Quote: ${b.price_quoted}</span>
                        )}
                      </div>

                      {b.notes && <p className="mt-2 text-[13px] text-foreground/80 whitespace-pre-wrap">{b.notes}</p>}
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        via {b.source} · {new Date(b.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete booking from ${b.customer_name}?`)) deleteMut.mutate(b.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
