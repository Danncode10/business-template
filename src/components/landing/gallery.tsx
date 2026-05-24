'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Typewriter } from './typewriter';

export function Gallery() {
  const galleryItems = [
    { id: 1, cols: 'col-span-1 md:col-span-2 md:row-span-2', title: 'Signature Dishes', category: 'Menu', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' },
    { id: 2, cols: 'col-span-1', title: 'Fresh Ingredients', category: 'Quality', image: 'https://images.unsplash.com/photo-1460925895917-adf4e565db13?w=400&q=80' },
    { id: 3, cols: 'col-span-1', title: 'Beautiful Ambiance', category: 'Experience', image: 'https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=400&q=80' },
    { id: 4, cols: 'col-span-1 md:col-span-2', title: 'Special Events', category: 'Services', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
    { id: 5, cols: 'col-span-1', title: 'Happy Hour', category: 'Promotions', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80' },
    { id: 6, cols: 'col-span-1', title: 'Team Favorites', category: 'Recommended', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80' },
  ];

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any },
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
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
            Gallery
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            <Typewriter text="See Our Best" speed={40} />
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Beautiful moments and finished work that showcase our passion and quality.
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
              whileHover={{ scale: 1.04, y: -8 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] as any }}
              className={`${item.cols} group relative cursor-pointer`}
            >
              {/* Double-bezel card: outer shell */}
              <div className="p-1.5 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] transition-all duration-300 group-hover:border-white/[0.12] group-hover:from-white/[0.06] group-hover:to-white/[0.04] h-full shadow-lg group-hover:shadow-[0_20px_60px_rgba(124,92,255,0.15)]">
                {/* Inner core */}
                <div className="relative w-full h-full overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-card">
                  {/* Mouse-follow glow */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 92, 255, 0.25), transparent 70%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === item.id ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                      e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                    }}
                  />

                  {/* Image Container */}
                  <div className="relative w-full aspect-square md:aspect-auto md:h-80 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover w-full h-full group-hover:scale-125 transition-transform duration-700 ease-[0.32,0.72,0,1]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={item.id === 1}
                    />
                    {/* Gradient overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-40" />
                  </div>

                  {/* Hover overlay with info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === item.id ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }}
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent/30 flex flex-col items-end justify-end p-6 z-20 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0, scale: 0.9 }}
                      animate={{
                        y: hoveredId === item.id ? 0 : 20,
                        opacity: hoveredId === item.id ? 1 : 0,
                        scale: hoveredId === item.id ? 1 : 0.9,
                      }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any, delay: 0.05 }}
                    >
                      <motion.span
                        className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] mb-3"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{
                          opacity: hoveredId === item.id ? 1 : 0,
                          x: hoveredId === item.id ? 0 : 10,
                        }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {item.category}
                      </motion.span>
                      <motion.h3
                        className="text-2xl font-bold text-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: hoveredId === item.id ? 1 : 0,
                          y: hoveredId === item.id ? 0 : 10,
                        }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                      >
                        {item.title}
                      </motion.h3>
                    </motion.div>
                  </motion.div>

                  {/* Card info footer (always visible) */}
                  <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-white/[0.04] bg-card/80 backdrop-blur-sm z-20">
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
