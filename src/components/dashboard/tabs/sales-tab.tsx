"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { createSale, deleteSale, getSalesStats, listSales, type CreateSaleInput } from "@/services/sales";
import { listServices } from "@/services/services";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import type { Tables } from "@/types/supabase";
import { cn } from "@/lib/utils";

type Period = "today" | "week" | "month";
type PaymentMethod = CreateSaleInput["payment_method"];
type PaymentStatus = CreateSaleInput["payment_status"];
type Service = Tables<"services">;

const PAGE_SIZE = 8;
const periods: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "7 Days" },
  { value: "month", label: "30 Days" },
];

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
];

const inputClass =
  "min-h-12 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString()}`;
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function SalesForm() {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useQuery({ queryKey: ["services"], queryFn: listServices });
  const serviceOptions = (services ?? []) as Service[];
  const [serviceId, setServiceId] = useState("");
  const [customServiceName, setCustomServiceName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [price, setPrice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [confirmedDate, setConfirmedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [confirmedTime, setConfirmedTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState("");

  const selectedService = serviceOptions.find((service) => service.id === serviceId);
  const serviceName = selectedService?.name ?? customServiceName.trim();
  const saleTotal = Number(price) || Number(selectedService?.price_from) || 0;

  const createMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Sale recorded");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomServiceName("");
      setServiceId("");
      setPrice("");
      setNotes("");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not record sale"),
  });

  const submit = () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!customerEmail.trim()) {
      toast.error("Customer email is required");
      return;
    }
    if (!serviceName) {
      toast.error("Choose or enter a service");
      return;
    }
    if (!saleTotal || saleTotal < 0) {
      toast.error("Enter a valid sale total");
      return;
    }

    createMutation.mutate({
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim() || undefined,
      service_id: selectedService?.id,
      service_name: serviceName,
      price_quoted: saleTotal,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      confirmed_date: confirmedDate,
      confirmed_time: confirmedTime,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground">Point of Sale</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Record direct sales for any service business.</p>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Customer name</label>
            <input className={inputClass} value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Customer email</label>
            <input className={inputClass} type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input className={inputClass} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Service</label>
            <select
              className={inputClass}
              value={serviceId}
              onChange={(event) => {
                const nextId = event.target.value;
                setServiceId(nextId);
                const nextService = serviceOptions.find((service) => service.id === nextId);
                if (nextService?.price_from) setPrice(String(nextService.price_from));
              }}
              disabled={isLoading}
            >
              <option value="">Custom service</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          {!selectedService && (
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Custom service name</label>
              <input className={inputClass} value={customServiceName} onChange={(event) => setCustomServiceName(event.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sale total</label>
            <input className={inputClass} inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Payment status</label>
            <select className={inputClass} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Payment method</label>
            <select className={inputClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sale date</label>
            <input className={inputClass} type="date" value={confirmedDate} onChange={(event) => setConfirmedDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sale time</label>
            <input className={inputClass} type="time" value={confirmedTime} onChange={(event) => setConfirmedTime(event.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              className={cn(inputClass, "min-h-24 py-3")}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Receipt</p>
          <div className="mt-4 flex-1 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Customer</span>
              <span className="text-right text-foreground">{customerName || "Not set"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Service</span>
              <span className="text-right text-foreground">{serviceName || "Not set"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Payment</span>
              <span className="text-right capitalize text-foreground">{paymentStatus.replace("_", " ")}</span>
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-end justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-3xl font-semibold text-foreground tabular-nums">{money(saleTotal)}</span>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={createMutation.isPending}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Record sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesTable({ period }: { period: Period }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["sales", page, search],
    queryFn: () => listSales({ page, pageSize: PAGE_SIZE, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales-stats"] });
      toast.success("Sale deleted");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete sale"),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent Sales</h3>
          <p className="text-sm text-muted-foreground">Direct transactions entered from the dashboard.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={cn(inputClass, "pl-9")}
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search sales"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">
          <Loader2 className="inline h-5 w-5 animate-spin" />
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-foreground">No direct sales yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Recorded POS sales will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {(data?.data ?? []).map((sale) => (
            <div key={sale.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{sale.customer_name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{sale.customer_email}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{sale.service_name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {sale.confirmed_date ?? sale.created_at.slice(0, 10)} {sale.confirmed_time ?? ""}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 md:justify-end">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{money(sale.price_paid ?? sale.price_quoted)}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {sale.payment_status} · {(sale.payment_method ?? "other").replace("_", " ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete sale for ${sale.customer_name}?`)) deleteMutation.mutate(sale.id);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  aria-label="Delete sale"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border p-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {period === "today" ? "Today" : period === "week" ? "Last 7 days" : "Last 30 days"} stats above
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="min-h-12 rounded-lg border border-border px-4 text-sm text-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="min-h-12 rounded-lg border border-border px-4 text-sm text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function SalesTab() {
  const [period, setPeriod] = useState<Period>("today");
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["sales-stats", period],
    queryFn: () => getSalesStats(period),
    staleTime: 60_000,
  });

  const activeDays = useMemo(
    () => (stats?.dailyRevenue ?? []).filter((point) => point.revenue > 0).length,
    [stats?.dailyRevenue]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sales</h2>
          <p className="mt-1 text-sm text-muted-foreground">A reusable POS workflow for service-based businesses.</p>
        </div>
        <div className="flex rounded-lg border border-border bg-muted p-1">
          {periods.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              className={cn(
                "min-h-12 rounded-md px-4 text-sm font-medium transition-colors",
                period === item.value ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={statsLoading ? "..." : money(stats?.revenue)} detail={`${stats?.count ?? 0} direct sales`} icon={DollarSign} />
        <StatCard label="Sales" value={statsLoading ? "..." : String(stats?.count ?? 0)} detail="completed from POS" icon={ShoppingBag} />
        <StatCard label="Average Sale" value={statsLoading ? "..." : money(stats?.avgSale)} detail="direct-sale average" icon={TrendingUp} />
        <StatCard label="Top Service" value={stats?.topService ?? "None yet"} detail="by sale count" icon={CreditCard} />
      </div>

      <SalesForm />

      {stats && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">{activeDays} active day{activeDays === 1 ? "" : "s"} in this period</p>
            </div>
          </div>
          {stats.dailyRevenue.some((point) => point.revenue > 0) ? (
            <RevenueTrendChart points={stats.dailyRevenue} period={period} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No revenue recorded for this period.
            </div>
          )}
        </div>
      )}

      <SalesTable period={period} />
    </div>
  );
}
