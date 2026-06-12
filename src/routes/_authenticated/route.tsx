import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-display text-xl tracking-tight">GRYT</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="hover:text-sky-brand transition-colors" activeProps={{ className: "text-sky-brand underline" }}>
              Dashboard
            </Link>
            <Link to="/challenges" className="hover:text-sky-brand transition-colors" activeProps={{ className: "text-sky-brand underline" }}>
              Challenges
            </Link>
            <Link to="/leaderboard" className="hover:text-sky-brand transition-colors" activeProps={{ className: "text-sky-brand underline" }}>
              Leaderboard
            </Link>
            <Link to="/community" className="hover:text-sky-brand transition-colors" activeProps={{ className: "text-sky-brand underline" }}>
              Members
            </Link>
            <Link to="/runs" className="hover:text-sky-brand transition-colors">
              Runs
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
