import NavBar from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4 pb-24 md:ml-56 md:pb-8 lg:mx-auto">
        {children}
      </main>
    </div>
  );
}
