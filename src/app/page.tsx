import { getUserProfile } from "@/services/dashboard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/hero";
import { CtaBanner } from "@/components/landing/cta-banner";
import { SocialProofBar } from "@/components/landing/social-proof-bar";
import { Testimonials } from "@/components/landing/testimonials";
import { Services } from "@/components/landing/services";
import { Gallery } from "@/components/landing/gallery";
import { ContactBlock } from "@/components/landing/contact-block";
import { BlogPreview } from "@/components/landing/blog-preview";


export default async function Home() {
  const session = await getUserProfile();
  const user = session?.user || null;

  return (
    <>
      <Navbar user={user} />

      <Hero isAuthed={!!user} />

      <SocialProofBar />

      <Services />

      <Gallery />

      <Testimonials />

      <BlogPreview />

      <ContactBlock />

      <CtaBanner isAuthed={!!user} />

      <Footer />
    </>
  );
}
