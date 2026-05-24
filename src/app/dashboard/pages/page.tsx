export default function PagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Pages</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">Manage your landing pages and content sections.</p>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1.5 inner-highlight">
        <div className="rounded-[calc(1rem-0.375rem)] bg-card px-6 py-16 text-center">
          <p className="text-[14px] font-medium text-foreground mb-1">Page editor coming in Phase 5</p>
          <p className="text-[13px] text-muted-foreground">You'll be able to edit hero, services, testimonials, and more.</p>
        </div>
      </div>
    </div>
  );
}
