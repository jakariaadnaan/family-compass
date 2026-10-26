import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Wifi, MapPin, BarChart3, Plus, RefreshCw, ArrowUpRight, ShieldCheck, Clock3, KeyRound, ScrollText, Timer, Flame, History } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { devicesQuery, auditQuery, pendingCodesQuery, usageQuery, deviceStatus, timeAgo } from "@/lib/devices";
import { activityLabels, formatMinutes, pageMeta, screenTimeWeek, topApps } from "@/lib/dashboard";
import { DeviceCollection } from "@/components/DeviceCollection";
import { StatusBadge, ConsentPill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageMeta("Overview", "Your Haven device overview, sharing status and recent account activity."),
  component: Dashboard,
});

const statTones = [
  { tile: "bg-secondary text-primary", blob: "bg-secondary" },
  { tile: "bg-success/10 text-success", blob: "bg-success/10" },
  { tile: "bg-accent/20 text-accent-foreground", blob: "bg-accent/20" },
  { tile: "bg-warning/15 text-warning", blob: "bg-warning/15" },
];

function Dashboard() {
  const qc = useQueryClient();
  const { data, isLoading, error, isFetching, dataUpdatedAt } = useQuery(devicesQuery);
  const activity = useQuery(auditQuery);
  const pending = useQuery(pendingCodesQuery);
  const usage = useQuery(usageQuery);
  const devices = data ?? [];
  const spotlight = devices[0];
  const online = devices.filter(d => deviceStatus(d.last_seen_at) === "online").length;
  const location = devices.filter(d => d.location_consent).length;
  const usageConsent = devices.filter(d => d.usage_consent).length;
  const stats = [
    { label: "Total devices", value: devices.length, icon: Smartphone, note: "Paired to your account" },
    { label: "Online now", value: online, icon: Wifi, note: "Seen within 30 minutes" },
    { label: "Location sharing", value: location, icon: MapPin, note: "Consent enabled on phone" },
    { label: "Usage sharing", value: usageConsent, icon: BarChart3, note: "Consent enabled on phone" },
  ];
  const week = screenTimeWeek(usage.data ?? []);
  const todayMinutes = week[6]?.minutes ?? 0;
  const apps = topApps(usage.data ?? []);
  const maxAppMinutes = apps[0]?.minutes ?? 1;
  function refresh() { void Promise.all([qc.invalidateQueries({ queryKey: ["devices"] }), qc.invalidateQueries({ queryKey: ["audit"] }), qc.invalidateQueries({ queryKey: ["pairing-codes"] }), qc.invalidateQueries({ queryKey: ["usage-summaries"] })]); }
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs font-semibold uppercase text-primary">Your private workspace</p><h1 className="text-3xl font-semibold">Device overview</h1><p className="mt-2 text-sm text-muted-foreground">A little clarity. A closer connection.</p></div>
      <div className="flex items-center gap-2"><Button variant="outline" size="icon" title="Refresh dashboard" aria-label="Refresh dashboard" disabled={isFetching} onClick={refresh}><RefreshCw className={isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></Button><Button asChild><Link to="/devices"><Plus /> Pair a device</Link></Button></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Private by design · Sharing by consent</span><span>{dataUpdatedAt ? `Updated ${timeAgo(new Date(dataUpdatedAt).toISOString())}` : "Connecting…"}</span></div>
    {error && <div role="alert" className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Devices could not be loaded.<Button variant="outline" onClick={refresh}>Retry</Button></div>}

    {spotlight && !error && <section className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-soft">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Smartphone className="h-7 w-7" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-lg font-semibold">{spotlight.name}</h2><StatusBadge status={deviceStatus(spotlight.last_seen_at)} /></div>
        <p className="mt-1 text-xs text-muted-foreground">{spotlight.platform} · Paired {timeAgo(spotlight.created_at)}</p>
        <div className="mt-3 flex flex-wrap gap-2"><ConsentPill on={spotlight.location_consent} label="Location" /><ConsentPill on={spotlight.usage_consent} label="Usage" /></div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${deviceStatus(spotlight.last_seen_at) === "online" ? "bg-success" : "bg-muted-foreground/40"}`} aria-hidden="true" />
        <div><p className="text-sm font-semibold tabular-nums">{timeAgo(spotlight.last_seen_at)}</p><p className="text-[11px] text-muted-foreground">Last sync</p></div>
      </div>
      <Button asChild variant="outline" size="sm"><Link to="/devices/$deviceId" params={{ deviceId: spotlight.id }}>Details <ArrowUpRight /></Link></Button>
    </section>}

    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map((s, i) => { const tone = statTones[i % statTones.length]!; return <div key={s.label} className="relative min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-soft sm:p-5">
      <span className={`absolute -right-7 -top-7 h-24 w-24 rounded-full ${tone.blob}`} aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{s.label}</p><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.tile}`}><s.icon className="h-4 w-4" /></span></div>
      {isLoading || error ? <Skeleton className="relative mt-4 h-9 w-12" /> : <p className="relative mt-3 font-display text-3xl font-semibold tabular-nums">{s.value.toString().padStart(2, "0")}</p>}
      <p className="relative mt-2 text-[11px] text-muted-foreground">{s.note}</p>
    </div>; })}</div>

    {pending.data && pending.data.length > 0 && <Link to="/devices" className="mt-6 flex items-center gap-3 border-y border-accent/40 bg-accent/10 px-4 py-3 text-sm"><KeyRound className="h-4 w-4 shrink-0 text-accent-foreground" /><span className="flex-1">{pending.data.length} pairing {pending.data.length === 1 ? "code is" : "codes are"} awaiting a phone</span><ArrowUpRight className="h-4 w-4" /></Link>}

    <section className="mt-8 rounded-xl border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"><Timer className="h-5 w-5" /></span><div><h2 className="font-semibold">Screen time</h2><p className="text-xs text-muted-foreground">Last 7 days usage overview</p></div></div>
        <div className="text-right"><p className="font-display text-2xl font-semibold tabular-nums">{formatMinutes(todayMinutes)}</p><p className="text-[11px] text-muted-foreground">Today</p></div>
      </div>
      {usage.isLoading ? <Skeleton className="mt-6 h-48" /> : usage.data?.length ? <div className="mt-6 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={week} margin={{ top: 8, right: 0, left: -18, bottom: 0 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(m: number) => formatMinutes(m)} width={52} />
            <Tooltip cursor={{ fill: "transparent" }} formatter={(value) => [formatMinutes(Number(value)), "Screen time"]} labelFormatter={(_, payload) => (payload as { payload?: { key?: string } }[])?.[0]?.payload?.key ?? ""} />
            <Bar dataKey="minutes" radius={[6, 6, 6, 6]} maxBarSize={44}>{week.map(d => <Cell key={d.key} className={d.today ? "fill-primary" : "fill-chart-2"} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div> : <div className="mt-6 border-t py-10 text-center"><Timer className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No screen time data yet</p><p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">The phone app will share daily usage summaries in a future update — only after the phone's user turns it on.</p></div>}
    </section>

    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground"><Flame className="h-5 w-5" /></span><div><h2 className="font-semibold">Most used apps</h2><p className="text-xs text-muted-foreground">By foreground time, last 7 days</p></div></div>
        {usage.isLoading ? <Skeleton className="mt-6 h-32" /> : apps.length ? <ol className="mt-6 space-y-4">{apps.map((a, i) => <li key={a.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium"><span className="mr-2 text-xs text-muted-foreground">{i + 1}</span>{a.label}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatMinutes(a.minutes)}</span></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.round(a.minutes / maxAppMinutes * 100))}%` }} /></div>
        </li>)}</ol> : <div className="mt-6 border-t py-10 text-center"><Flame className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Nothing to rank yet</p><p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">App usage appears here once a paired phone starts sharing summaries with consent.</p></div>}
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><History className="h-5 w-5" /></span><div><h2 className="font-semibold">Recent activity</h2><p className="text-xs text-muted-foreground">What changed on your account</p></div></div><Button asChild variant="ghost" size="icon" title="View activity log"><Link to="/audit" aria-label="View activity log"><ArrowUpRight /></Link></Button></div>
        {activity.isLoading ? <Skeleton className="mt-6 h-32" /> : activity.error ? <p className="mt-6 text-sm text-destructive">Activity could not be loaded.</p> : !activity.data?.length ? <div className="mt-6 border-t py-10 text-center"><ScrollText className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">A fresh start</p><p className="mt-1 text-xs text-muted-foreground">No account activity recorded yet.</p></div> : <ul className="mt-4 divide-y">{activity.data.slice(0, 5).map(a => <li key={a.id} className="flex gap-3 py-3.5"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Clock3 className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-sm font-medium">{activityLabels[a.action] ?? a.action}</p>{a.target && <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.target}</p>}<p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p></div></li>)}</ul>}
      </section>
    </div>

    <section className="mt-10"><div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Your devices</h2><Button asChild variant="link" size="sm"><Link to="/devices">Manage <ArrowUpRight /></Link></Button></div>{!error && <DeviceCollection devices={devices} loading={isLoading} />}</section>
  </div>;
}
