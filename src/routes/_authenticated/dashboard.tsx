import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Wifi, MapPin, BarChart3, Plus, RefreshCw, ArrowUpRight, ShieldCheck, Clock3, KeyRound, ScrollText } from "lucide-react";
import { devicesQuery, auditQuery, pendingCodesQuery, deviceStatus, timeAgo } from "@/lib/devices";
import { activityLabels, pageMeta } from "@/lib/dashboard";
import { DeviceCollection } from "@/components/DeviceCollection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageMeta("Overview", "Your Haven device overview, sharing status and recent account activity."),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const { data, isLoading, error, isFetching, dataUpdatedAt } = useQuery(devicesQuery);
  const activity = useQuery(auditQuery);
  const pending = useQuery(pendingCodesQuery);
  const devices = data ?? [];
  const online = devices.filter(d => deviceStatus(d.last_seen_at) === "online").length;
  const location = devices.filter(d => d.location_consent).length;
  const usage = devices.filter(d => d.usage_consent).length;
  const stats = [
    { label: "Total devices", value: devices.length, icon: Smartphone, note: "Paired to your account", tone: "bg-secondary text-primary" },
    { label: "Online now", value: online, icon: Wifi, note: "Seen within 30 minutes", tone: "bg-success/10 text-success" },
    { label: "Location sharing", value: location, icon: MapPin, note: "Consent enabled on phone", tone: "bg-accent/20 text-accent-foreground" },
    { label: "Usage sharing", value: usage, icon: BarChart3, note: "Consent enabled on phone", tone: "bg-secondary text-primary" },
  ];
  function refresh() { void Promise.all([qc.invalidateQueries({ queryKey: ["devices"] }), qc.invalidateQueries({ queryKey: ["audit"] }), qc.invalidateQueries({ queryKey: ["pairing-codes"] })]); }
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs font-semibold uppercase text-primary">Your private workspace</p><h1 className="text-3xl font-semibold">Device overview</h1><p className="mt-2 text-sm text-muted-foreground">A little clarity. A closer connection.</p></div>
      <div className="flex items-center gap-2"><Button variant="outline" size="icon" title="Refresh dashboard" aria-label="Refresh dashboard" disabled={isFetching} onClick={refresh}><RefreshCw className={isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></Button><Button asChild><Link to="/devices"><Plus /> Pair a device</Link></Button></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Private by design · Sharing by consent</span><span>{dataUpdatedAt ? `Updated ${timeAgo(new Date(dataUpdatedAt).toISOString())}` : "Connecting…"}</span></div>
    {error && <div role="alert" className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Devices could not be loaded.<Button variant="outline" onClick={refresh}>Retry</Button></div>}
    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(s => <div key={s.label} className="min-w-0 rounded-lg border bg-card p-4 shadow-soft sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{s.label}</p><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${s.tone}`}><s.icon className="h-4 w-4" /></span></div>{isLoading || error ? <Skeleton className="mt-4 h-9 w-12" /> : <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{s.value.toString().padStart(2, "0")}</p>}<p className="mt-2 text-[11px] text-muted-foreground">{s.note}</p></div>)}</div>
    {pending.data && pending.data.length > 0 && <Link to="/devices" className="mt-6 flex items-center gap-3 border-y border-accent/40 bg-accent/10 px-4 py-3 text-sm"><KeyRound className="h-4 w-4 shrink-0 text-accent-foreground" /><span className="flex-1">{pending.data.length} pairing {pending.data.length === 1 ? "code is" : "codes are"} awaiting a phone</span><ArrowUpRight className="h-4 w-4" /></Link>}
    <div className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0"><div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Your devices</h2><Button asChild variant="link" size="sm"><Link to="/devices">Manage <ArrowUpRight /></Link></Button></div>{!error && <DeviceCollection devices={devices} loading={isLoading} />}</section>
      <div className="space-y-8">
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Sharing overview</h2><ShieldCheck className="h-5 w-5 text-primary" /></div><div className="space-y-5 border-y py-5">{[{ label: "Location consent", value: location, icon: MapPin }, { label: "App usage consent", value: usage, icon: BarChart3 }].map(s => <div key={s.label}><div className="mb-2 flex items-center justify-between gap-2 text-sm"><span className="flex items-center gap-2"><s.icon className="h-4 w-4 text-muted-foreground" />{s.label}</span><span className="font-semibold">{error || isLoading ? "—" : `${s.value}/${devices.length}`}</span></div><div className="grid h-1.5 grid-cols-12 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} className={devices.length && i < Math.round(s.value / devices.length * 12) ? "bg-primary" : "bg-muted"} />)}</div></div>)}<p className="text-xs leading-relaxed text-muted-foreground">Consent is managed by the person using the phone.</p></div></section>
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Recent activity</h2><Button asChild variant="ghost" size="icon" title="View activity log"><Link to="/audit" aria-label="View activity log"><ArrowUpRight /></Link></Button></div>{activity.isLoading ? <Skeleton className="h-24" /> : activity.error ? <p className="text-sm text-destructive">Activity could not be loaded.</p> : !activity.data?.length ? <div className="border-y py-6"><ScrollText className="h-6 w-6 text-muted-foreground" /><p className="mt-3 text-sm font-medium">A fresh start</p><p className="mt-1 text-xs text-muted-foreground">No account activity recorded yet.</p></div> : <ul className="divide-y border-y">{activity.data.slice(0, 4).map(a => <li key={a.id} className="flex gap-3 py-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Clock3 className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-sm font-medium">{activityLabels[a.action] ?? a.action}</p>{a.target && <p className="mt-1 truncate text-xs text-muted-foreground">{a.target}</p>}<p className="mt-1 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p></div></li>)}</ul>}</section>
      </div>
    </div>
  </div>;
}
