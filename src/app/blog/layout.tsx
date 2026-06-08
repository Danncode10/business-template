import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getUserProfile } from "@/services/dashboard";

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserProfile();
  const user = session?.user || null;

  return (
    <>
      <Navbar user={user} />
      <main className="min-h-screen bg-background pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
