import { activityLabels, formatMinutes, pageMeta, screenTimeWeek, topApps } from "@/lib/dashboard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowLeft, MapPin, Trash2, Smartphone, Clock3, Timer, Flame, ShieldCheck, ShieldX, RefreshCw,
  LayoutDashboard, AppWindow, Bell, History, Navigation, CalendarDays, type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deviceStatus, timeAgo } from "@/lib/devices";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/devices/$deviceId")({
  head: () => pageMeta("Device manager", "Screen time, shared locations, app usage, alerts and consent for one paired device in Haven."),
  component: DevicePage,
});

type Tab = "overview" | "location" | "apps" | "alerts" | "privacy";
const tabs: { id: Tab; label: string; icon: LucideIcon; group: string }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "location", label: "GPS location", icon: MapPin, group: "Monitoring" },
  { id: "apps", label: "App usage", icon: AppWindow, group: "Monitoring" },
  { id: "alerts", label: "Alerts & activity", icon: Bell, group: "Monitoring" },
  { id: "privacy", label: "Privacy & consent", icon: ShieldCheck, group: "Device" },
];

function DevicePage() {
  const { deviceId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [range, setRange] = useState<7 | 30>(7);

  const q = useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const [dev, locs, usage, audit] = await Promise.all([
        supabase.from("devices").select("*").eq("id", deviceId).maybeSingle(),
        supabase.from("location_records").select("*").eq("device_id", deviceId).order("recorded_at", { ascending: false }).limit(50),
        supabase.from("usage_summaries").select("day,package_name,app_label,foreground_minutes").eq("device_id", deviceId).gte("day", since).order("day", { ascending: false }).limit(1000),
        supabase.from("audit_logs").select("id,action,target,created_at").eq("target", deviceId).order("created_at", { ascending: false }).limit(30),
      ]);
      if (dev.error) throw dev.error;
      return { device: dev.data, locations: locs.data ?? [], usage: usage.data ?? [], audit: audit.data ?? [] };
    },
  });

  async function remove() {
    const { error } = await supabase.from("devices").delete().eq("id", deviceId);
    if (error) { toast.error(error.message); return; }
    toast.success("Device removed and its data deleted");
    qc.invalidateQueries();
    navigate({ to: "/devices" });
  }

  if (q.isLoading) return <div className="space-y-4"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>;
  if (!q.data?.device)
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="font-medium">Device not found</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been removed, or it isn't paired to your account.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/devices">Back to devices</Link></Button>
      </div>
    );

  const { device: d, locations, usage, audit } = q.data;
  const status = deviceStatus(d.last_seen_at);
  const cutoff = new Date(Date.now() - (range - 1) * 86400000).toISOString().slice(0, 10);
  const inRange = usage.filter(u => u.day >= cutoff);
  const week = screenTimeWeek(usage);
  const today = week.find(w => w.today)?.minutes ?? 0;
  const apps = topApps(inRange, 10);
  const maxApp = Math.max(1, ...apps.map(a => a.minutes));
  const last = locations[0];
  const groups = [...new Set(tabs.map(t => t.group))];

  const stats = [
    { label: "Status", value: status === "online" ? "Online" : status === "offline" ? "Offline" : "Waiting", note: `Last seen ${timeAgo(d.last_seen_at)}`, icon: Smartphone, tone: "bg-primary/10 text-primary" },
    { label: "Screen time today", value: formatMinutes(today), note: d.usage_consent ? "From usage summaries" : "Usage sharing off", icon: Timer, tone: "bg-chart-2/15 text-chart-2" },
    { label: "Last location", value: last ? timeAgo(last.recorded_at) : "—", note: d.location_consent ? (last?.accuracy_m ? `±${Math.round(last.accuracy_m)} m accuracy` : "Waiting for first fix") : "Location sharing off", icon: MapPin, tone: "bg-success/10 text-success" },
    { label: "Paired", value: new Date(d.created_at).toLocaleDateString(), note: d.platform ?? "android", icon: CalendarDays, tone: "bg-accent/20 text-accent-foreground" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Link to="/devices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to devices</Link>
        <Button variant="outline" size="icon" aria-label="Refresh" onClick={() => q.refetch()}><RefreshCw className={q.isFetching ? "animate-spin" : ""} /></Button>
      </div>

      <section className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Smartphone className="h-7 w-7" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-2xl font-bold">{d.name}</h1><StatusBadge status={status} /></div>
          <p className="mt-1 text-xs text-muted-foreground">Device manager · {d.platform ?? "android"} · ID hidden for privacy</p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Device sections" className="flex gap-2 overflow-x-auto lg:block lg:space-y-5">
          {groups.map(g => <div key={g} className="contents lg:block">
            <p className="hidden px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:block">{g}</p>
            {tabs.filter(t => t.group === g).map(t => <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id}
              className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:w-full ${tab === t.id ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <t.icon className="h-4 w-4" />{t.label}</button>)}
          </div>)}
        </nav>

        <div className="min-w-0 space-y-6">
          {tab === "overview" && <>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{stats.map(s => <div key={s.label} className="rounded-xl border bg-card p-4 shadow-soft">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}><s.icon className="h-4 w-4" /></span>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 truncate font-display text-xl font-semibold">{s.value}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.note}</p>
            </div>)}</div>
            <Card icon={Timer} title="Screen time" sub="Last 7 days usage overview" right={<div className="text-right"><p className="font-display text-xl font-semibold">{formatMinutes(today)}</p><p className="text-[11px] text-muted-foreground">Today</p></div>}>
              {usage.length ? <div className="h-52"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={week} margin={{ top: 8, right: 0, left: -18, bottom: 0 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(m: number) => formatMinutes(m)} width={52} />
                  <Tooltip cursor={{ fill: "transparent" }} formatter={(v) => [formatMinutes(Number(v)), "Screen time"]} />
                  <Bar dataKey="minutes" radius={[6, 6, 6, 6]} maxBarSize={44}>{week.map(w => <Cell key={w.key} className={w.today ? "fill-primary" : "fill-chart-2"} />)}</Bar>
                </BarChart></ResponsiveContainer></div> : <Empty icon={Timer} title="No screen time yet" text="Appears after the phone's user turns on usage sharing and grants Usage Access." />}
            </Card>
            <AppList apps={apps.slice(0, 5)} max={maxApp} sub="By foreground time, last 7 days" />
          </>}

          {tab === "location" && <Card icon={Navigation} title="GPS location" sub="Only locations the phone's user chose to share">
            {!d.location_consent && <p className="mb-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Location sharing is off on this phone. Only its user can turn it on.</p>}
            {last ? <>
              <iframe title="Last shared location" className="h-72 w-full rounded-lg border" loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${last.lng - 0.01},${last.lat - 0.006},${last.lng + 0.01},${last.lat + 0.006}&layer=mapnik&marker=${last.lat},${last.lng}`} />
              <ul className="mt-4 divide-y text-sm">{locations.map(l => <li key={l.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                <a className="font-medium text-primary hover:underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lng}#map=16/${l.lat}/${l.lng}`}>{l.lat.toFixed(5)}, {l.lng.toFixed(5)}</a>
                <span className="text-xs text-muted-foreground">{l.accuracy_m ? `±${Math.round(l.accuracy_m)} m · ` : ""}{new Date(l.recorded_at).toLocaleString()}</span>
              </li>)}</ul>
            </> : <Empty icon={MapPin} title="No location shared yet" text="Android may delay locations when the phone is offline, in battery saver, or GPS is off." />}
          </Card>}

          {tab === "apps" && <>
            <div className="flex gap-2">{([7, 30] as const).map(r => <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>Last {r} days</Button>)}</div>
            <AppList apps={apps} max={maxApp} sub={`By foreground time, last ${range} days · total ${formatMinutes(inRange.reduce((s, u) => s + u.foreground_minutes, 0))}`} />
          </>}

          {tab === "alerts" && <Card icon={History} title="Alerts & activity" sub="Pairing, status and sharing changes for this device">
            {audit.length ? <ul className="divide-y">{audit.map(a => <li key={a.id} className="flex gap-3 py-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Clock3 className="h-3.5 w-3.5" /></span>
              <div><p className="text-sm font-medium">{activityLabels[a.action] ?? a.action}</p><p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p></div>
            </li>)}</ul> : <Empty icon={Bell} title="No alerts yet" text="Online/offline and sharing changes for this device will show here." />}
          </Card>}

          {tab === "privacy" && <>
            <Card icon={ShieldCheck} title="What this phone shares" sub="Controlled on the phone by its user — not from here">
              <ul className="space-y-3 text-sm">
                {[["Online status (heartbeat)", true], ["GPS location", d.location_consent], ["App usage summaries", d.usage_consent]].map(([l, on]) => <li key={String(l)} className="flex items-center justify-between gap-2">
                  <span>{l}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${on ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{on ? "Shared" : "Off"}</span></li>)}
              </ul>
            </Card>
            <Card icon={ShieldX} title="Never collected by Haven" sub="Haven does not build secret monitoring">
              <p className="text-sm text-muted-foreground">Microphone, camera, call logs, SMS, contacts, keystrokes, clipboard, files and browsing history are never collected.</p>
            </Card>
            <section className="rounded-xl border border-destructive/30 bg-card p-5">
              <h2 className="font-semibold">Remove device</h2>
              <p className="mt-1 text-sm text-muted-foreground">Revokes access and permanently deletes its location and usage history.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" className="mt-4"><Trash2 className="h-4 w-4" /> Remove device</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Remove {d.name}?</AlertDialogTitle><AlertDialogDescription>All its data will be deleted. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Remove</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </section>
          </>}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, sub, right, children }: { icon: LucideIcon; title: string; sub: string; right?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" /></span><div><h2 className="font-semibold">{title}</h2><p className="text-xs text-muted-foreground">{sub}</p></div></div>{right}</div>
    {children}
  </section>;
}

function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="border-t py-10 text-center"><Icon className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">{title}</p><p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{text}</p></div>;
}

function AppList({ apps, max, sub }: { apps: { label: string; minutes: number }[]; max: number; sub: string }) {
  return <Card icon={Flame} title="Most used apps" sub={sub}>
    {apps.length ? <ol className="space-y-4">{apps.map((a, i) => <li key={a.label}>
      <div className="flex items-baseline justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium"><span className="mr-2 text-xs text-muted-foreground">{i + 1}</span>{a.label}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatMinutes(a.minutes)}</span></div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.round(a.minutes / max * 100))}%` }} /></div>
    </li>)}</ol> : <Empty icon={Flame} title="Nothing to rank yet" text="App usage appears once the phone shares summaries with consent." />}
  </Card>;
}
