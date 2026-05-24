'use client';

import { ImageIcon } from 'lucide-react';

export function Gallery() {
  const galleryItems = [
    { id: 1, cols: 'col-span-1', rows: 'row-span-1' },
    { id: 2, cols: 'col-span-1 md:col-span-2', rows: 'row-span-1' },
    { id: 3, cols: 'col-span-1', rows: 'row-span-1' },
    { id: 4, cols: 'col-span-1 md:col-span-1', rows: 'row-span-1' },
    { id: 5, cols: 'col-span-1 md:col-span-2', rows: 'row-span-1' },
    { id: 6, cols: 'col-span-1', rows: 'row-span-1' },
  ];

  return (
    <section id="gallery" className="relative bg-background/50 isolate overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
            Gallery
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            Our Work
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Explore our portfolio of successful projects and client transformations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`${item.cols} ${item.rows} rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04] transition-all aspect-square md:aspect-auto cursor-pointer group`}
            >
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-semibold text-sm">Project {item.id}</h3>
                    <p className="text-xs text-white/70">Click to view details</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
