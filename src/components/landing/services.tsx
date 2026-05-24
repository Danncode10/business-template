'use client';

import { motion } from 'framer-motion';
import { Zap, Target, Sparkles } from 'lucide-react';

export function Services() {
  const services = [
    {
      id: 1,
      icon: Zap,
      title: 'Quality First',
      description: 'Premium ingredients, expert craftsmanship, and attention to detail in everything we do.',
    },
    {
      id: 2,
      icon: Target,
      title: 'Fast & Reliable',
      description: 'Quick service without compromising on quality. Always fresh, always on time.',
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'Customer Care',
      description: 'Friendly staff, personalized service, and memorable experiences every visit.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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
    <section id="services" className="relative bg-background isolate overflow-hidden py-32">
      {/* Ambient orb */}
      <div className="absolute -left-32 -bottom-32 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

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
            Why Choose Us
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            We Stand <span className="gradient-text-primary italic font-medium">Apart</span>
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover what makes our business special and worth your time.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.id} variants={itemVariants} className="group">
                {/* Double-bezel card */}
                <div className="p-1.5 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] transition-all duration-300 group-hover:border-white/[0.12] group-hover:from-white/[0.06] group-hover:to-white/[0.04] h-full">
                  {/* Inner core */}
                  <div className="rounded-[calc(1.5rem-0.375rem)] bg-card p-8 h-full flex flex-col relative overflow-hidden">
                    {/* Mouse-follow glow */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 92, 255, 0.1), transparent 80%)',
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon with animation */}
                      <motion.div
                        initial={{ scale: 1 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="mb-6 inline-block"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center group-hover:from-primary/40 group-hover:to-primary/20 transition-all duration-300">
                          <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        </div>
                      </motion.div>

                      {/* Text content */}
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {service.description}
                      </p>

                      {/* Learn more link with animation */}
                      <motion.a
                        href="#"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Learn more
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        >
                          →
                        </motion.span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
