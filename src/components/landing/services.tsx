'use client';

export function Services() {
  return (
    <section id="services" className="relative bg-background/50 isolate overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
            Services
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            Our Services & Pricing
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose the perfect plan for your business needs. Flexible pricing designed for every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-8 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/20 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Service {i}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Description of this service offering and its key benefits.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Feature point</li>
                <li>• Feature point</li>
                <li>• Feature point</li>
              </ul>
              <button className="w-full px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-foreground hover:bg-white/[0.05] transition-colors">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
