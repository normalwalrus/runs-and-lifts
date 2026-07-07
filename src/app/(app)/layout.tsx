import NavBar from "@/components/NavBar";
import { logout } from "@/app/login/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <NavBar logoutAction={logout} />
      <main className="mx-auto max-w-3xl p-4 pb-24 md:ml-56 md:pb-8 lg:mx-auto">
        {children}
      </main>
    </div>
  );
}
