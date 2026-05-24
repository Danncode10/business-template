'use client';

import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

export function Gallery() {
  const galleryItems = [
    { id: 1, cols: 'col-span-1 md:col-span-2 md:row-span-2', title: 'Brand Identity', category: 'Design' },
    { id: 2, cols: 'col-span-1', title: 'Web Design', category: 'Development' },
    { id: 3, cols: 'col-span-1', title: 'Mobile App', category: 'Product' },
    { id: 4, cols: 'col-span-1 md:col-span-2', title: 'Marketing Campaign', category: 'Strategy' },
    { id: 5, cols: 'col-span-1', title: 'E-Commerce', category: 'Development' },
    { id: 6, cols: 'col-span-1', title: 'Social Media', category: 'Content' },
  ];

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="gallery" className="relative bg-background isolate overflow-hidden py-32">
      {/* Ambient orb */}
      <div className="absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
            Portfolio
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            Our <span className="gradient-text-primary italic font-medium">Work</span>
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Explore a collection of our most impactful projects and transformations.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`${item.cols} group relative cursor-pointer`}
            >
              {/* Double-bezel card: outer shell */}
              <div className="p-1.5 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] transition-all duration-300 group-hover:border-white/[0.12] group-hover:from-white/[0.06] group-hover:to-white/[0.04] h-full">
                {/* Inner core */}
                <div className="relative w-full h-full overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-card">
                  {/* Mouse-follow glow */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 92, 255, 0.15), transparent 80%)',
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                      e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                    }}
                  />

                  {/* Aspect ratio container */}
                  <div className="relative w-full aspect-square md:aspect-auto md:h-80 bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center overflow-hidden">
                    {/* Placeholder icon with animation */}
                    <motion.div
                      animate={{ scale: hoveredId === item.id ? 1.1 : 1 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <ImageIcon className="h-16 w-16 text-primary/40" strokeWidth={1.5} />
                    </motion.div>

                    {/* Hover overlay with info */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredId === item.id ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent flex flex-col items-end justify-end p-6"
                    >
                      <motion.div
                        initial={{ y: 12, opacity: 0 }}
                        animate={{
                          y: hoveredId === item.id ? 0 : 12,
                          opacity: hoveredId === item.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span className="inline-block text-xs font-medium text-primary uppercase tracking-[0.1em] mb-2">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.title}
                        </h3>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Card info footer (always visible) */}
                  <div className="px-6 py-4 border-t border-white/[0.04]">
                    <p className="text-sm text-muted-foreground">Project {item.id}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Reduced motion support */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
