'use client';

import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';

export function ContactBlock() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const contactInfo = [
    {
      id: 1,
      icon: MapPin,
      label: 'Address',
      value: '123 Business Street',
      subValue: 'City, State 12345',
    },
    {
      id: 2,
      icon: Phone,
      label: 'Phone',
      value: '(555) 123-4567',
      subValue: 'Available Mon-Fri',
    },
    {
      id: 3,
      icon: Clock,
      label: 'Hours',
      value: 'Mon - Fri: 9AM - 6PM',
      subValue: 'Sat: 10AM - 4PM',
    },
  ];

  return (
    <section id="contact" className="relative bg-background/50 isolate overflow-hidden py-32">
      {/* Ambient orb */}
      <div className="absolute -right-40 top-32 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

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
            Get in Touch
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            Contact <span className="gradient-text-primary italic font-medium">Us</span>
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Get in touch with our team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-6"
          >
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <motion.div key={info.id} variants={itemVariants} className="group flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 group-hover:from-primary/40 group-hover:to-primary/20 transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{info.label}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{info.value}</p>
                    {info.subValue && (
                      <p className="text-muted-foreground text-sm">{info.subValue}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Contact Form & Map */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-6"
          >
            {/* Map Placeholder */}
            <motion.div variants={itemVariants} className="group">
              <div className="p-1.5 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] transition-all duration-300 group-hover:border-white/[0.12] group-hover:from-white/[0.06] group-hover:to-white/[0.04]">
                <div className="rounded-[calc(1.5rem-0.375rem)] h-64 bg-card flex items-center justify-center relative overflow-hidden">
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
                  <div className="text-center relative z-10">
                    <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-muted-foreground text-sm">Google Maps placeholder</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="group">
              <div className="p-1.5 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] transition-all duration-300 group-hover:border-white/[0.12] group-hover:from-white/[0.06] group-hover:to-white/[0.04]">
                <div className="rounded-[calc(1.5rem-0.375rem)] bg-card p-8 relative overflow-hidden">
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
                  <form className="space-y-4 relative z-10">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        placeholder="Tell us about your project..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      onClick={() => {
                        setIsSubmitting(true);
                        setTimeout(() => setIsSubmitting(false), 2000);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                      <motion.span
                        animate={{ x: isSubmitting ? 0 : -2, opacity: isSubmitting ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Send className="h-4 w-4" strokeWidth={1.5} />
                      </motion.span>
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
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
