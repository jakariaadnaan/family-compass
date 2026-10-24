import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Smartphone, ScrollText, Settings, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Smartphone },
  { to: "/audit", label: "Activity log", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppShell() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const linkCls =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent";
  const activeCls = "bg-sidebar-accent text-sidebar-accent-foreground";

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-4 md:flex">
        <div className="flex items-center gap-2 px-2 py-3 font-display text-lg font-semibold text-sidebar-accent-foreground">
          <ShieldCheck className="h-5 w-5 text-sidebar-primary" /> Haven
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={linkCls} activeProps={{ className: activeCls }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border pt-4">
          <p className="truncate px-3 text-xs text-sidebar-foreground/70">{user.email}</p>
          <button onClick={signOut} className={linkCls + " mt-2 w-full"}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 pb-24 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-sidebar py-2 md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex flex-col items-center gap-1 rounded-md px-3 py-1 text-[11px] text-sidebar-foreground"
            activeProps={{ className: "text-sidebar-primary" }}
          >
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
