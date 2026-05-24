import { getUserProfile } from "@/services/dashboard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturesTabs } from "@/components/features-tabs";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Typewriter } from "@/components/landing/typewriter";
import { SocialProofBar } from "@/components/landing/social-proof-bar";
import { Testimonials } from "@/components/landing/testimonials";
import { Services } from "@/components/landing/services";
import { Gallery } from "@/components/landing/gallery";
import { ContactBlock } from "@/components/landing/contact-block";


export default async function Home() {
  const session = await getUserProfile();
  const user = session?.user || null;

  return (
    <>
      <Navbar user={user} />

      <Hero isAuthed={!!user} />

      <SocialProofBar />

      {/* =============================
          FEATURES SECTION (BENTO GRID)
          ============================= */}
      <section id="features" className="relative bg-background isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-sm opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid-fade-overlay-v"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
              Features
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
              <Typewriter text="Everything small businesses need" speed={40} />
            </h2>

            <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Websites, lead capture, team collaboration, and analytics. All in one platform.
            </p>
          </div>

          <FeaturesTabs />
        </div>
      </section>

      <HowItWorks />

      <Testimonials />

      <Services />

      <Gallery />

      <Pricing isAuthed={!!user} />

      <ContactBlock />

      <CtaBanner isAuthed={!!user} />

      <Footer />
    </>
  );
}
