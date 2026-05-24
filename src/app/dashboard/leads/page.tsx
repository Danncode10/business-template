export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Leads</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">View and manage incoming leads from your contact forms.</p>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1.5 inner-highlight">
        <div className="rounded-[calc(1rem-0.375rem)] bg-card px-6 py-16 text-center">
          <p className="text-[14px] font-medium text-foreground mb-1">Lead inbox coming in Phase 5</p>
          <p className="text-[13px] text-muted-foreground">Once your contact form is live, leads will appear here.</p>
        </div>
      </div>
    </div>
  );
}
