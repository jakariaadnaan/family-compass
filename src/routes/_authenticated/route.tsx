import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Smartphone, ScrollText, Settings, LogOut, ShieldCheck, ChevronRight, LockKeyhole, TabletSmartphone, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});
const navGroups = [
  { label: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Devices", items: [
    { to: "/devices", label: "Devices", icon: Smartphone },
    { to: "/android", label: "Android app", icon: TabletSmartphone },
  ] },
  { label: "Account", items: [
    { to: "/audit", label: "Activity log", icon: ScrollText },
    { to: "/settings", label: "Settings", icon: Settings },
  ] },
] as const;
type NavItem = { to: string; label: string; icon: LucideIcon };
const nav: NavItem[] = navGroups.flatMap<NavItem>(g => [...g.items]);
function AppShell() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const path = useRouterState({ select: state => state.location.pathname });
  const current = nav.find(n => path.startsWith(n.to))?.label ?? "Workspace";
  async function signOut() { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }
  return <div className="min-h-screen md:flex">
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
      <Link to="/dashboard" className="flex items-center gap-3 px-2 py-3 text-sidebar-accent-foreground"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><ShieldCheck className="h-6 w-6" /></span><span className="font-display text-2xl font-semibold">Haven<span className="mt-0.5 block font-sans text-[10px] font-medium text-sidebar-foreground/65">FAMILY WORKSPACE</span></span></Link>
      <nav className="mt-8 space-y-6">{navGroups.map(g => <div key={g.label}>
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-sidebar-foreground/50">{g.label}</p>
        <div className="space-y-1">{g.items.map(n => <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}><n.icon className="h-4 w-4" />{n.label}</Link>)}</div>
      </div>)}</nav>
      <div className="mt-auto"><div className="mb-6 border-t border-sidebar-border px-2 pt-5"><LockKeyhole className="mb-2 h-5 w-5 text-sidebar-primary" /><p className="text-xs font-medium text-sidebar-accent-foreground">Consent comes first</p><p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/65">Your family. Your data.<br />Always shared openly.</p></div><div className="flex min-w-0 items-center gap-2 border-t border-sidebar-border pt-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">{user.email?.slice(0, 1).toUpperCase() ?? "H"}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-sidebar-accent-foreground">My account</p><p className="mt-1 truncate text-[10px] text-sidebar-foreground/60">{user.email}</p></div><Button variant="ghost" size="icon" className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut /></Button></div></div>
    </aside>
    <main className="min-w-0 flex-1 pb-24 md:pb-0"><header className="flex h-16 items-center justify-between gap-3 border-b bg-card px-5 sm:px-8"><div className="flex items-center gap-2 text-xs"><Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold text-primary md:hidden"><ShieldCheck className="h-5 w-5" />Haven</Link><span className="hidden text-muted-foreground md:inline">Workspace</span><ChevronRight className="h-3 w-3 text-muted-foreground" /><span>{current}</span></div><div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><LockKeyhole className="h-3.5 w-3.5 text-primary" />Private account</span><Button asChild variant="ghost" size="icon" title="Account settings"><Link to="/settings" aria-label="Account settings"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">{user.email?.slice(0, 1).toUpperCase() ?? "H"}</span></Link></Button><Button variant="ghost" size="icon" className="md:hidden" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut /></Button></div></header><div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><Outlet /></div></main>
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-card pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden" aria-label="Main navigation">{nav.map(n => <Link key={n.to} to={n.to} className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}><n.icon className="h-5 w-5" />{n.label}</Link>)}</nav>
  </div>;
}
