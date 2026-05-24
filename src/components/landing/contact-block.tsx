'use client';

import { Phone, MapPin, Clock } from 'lucide-react';

export function ContactBlock() {
  return (
    <section id="contact" className="relative bg-background isolate overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
              Get in Touch
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
              Contact Us
            </h2>
            <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed max-w-md">
              Have questions? We'd love to hear from you. Get in touch with our team today.
            </p>

            <div className="mt-12 space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="text-muted-foreground text-sm">
                    123 Business Street<br />
                    City, State 12345
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="text-muted-foreground text-sm">(555) 123-4567</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Hours</h3>
                  <p className="text-muted-foreground text-sm">
                    Mon - Fri: 9AM - 6PM<br />
                    Sat: 10AM - 4PM<br />
                    Sun: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="space-y-8">
            {/* Placeholder for Google Maps */}
            <div className="rounded-xl overflow-hidden border border-white/[0.08] h-80 bg-white/[0.02] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Google Maps placeholder</p>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.08] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.08] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.08] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
