import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Search, Smartphone, X } from "lucide-react";
import { selectDevices, type DeviceFilter, type DeviceSort } from "@/lib/dashboard";
import { deviceStatus, timeAgo } from "@/lib/devices";
import { StatusBadge, ConsentPill } from "./StatusBadge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import deviceEmpty from "@/assets/device-empty.jpg";

type Device = { id: string; name: string; platform: string; last_seen_at: string | null; created_at: string; location_consent: boolean; usage_consent: boolean };

export function DeviceCollection({ devices, loading = false }: { devices: Device[]; loading?: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DeviceFilter>("all");
  const [sort, setSort] = useState<DeviceSort>("newest");
  const selected = selectDevices(devices, search, filter, sort);
  return <div>
    <div className="flex flex-wrap items-center gap-3 border-y py-4">
      <div className="relative min-w-40 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search devices" placeholder="Search devices…" value={search} onChange={e => setSearch(e.target.value)} className="h-10 bg-card pl-9" /></div>
      <Select value={filter} onValueChange={v => setFilter(v as DeviceFilter)}><SelectTrigger className="h-10 w-36 bg-card" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="offline">Offline</SelectItem><SelectItem value="never">Not synced</SelectItem></SelectContent></Select>
      <Select value={sort} onValueChange={v => setSort(v as DeviceSort)}><SelectTrigger className="h-10 w-36 bg-card" aria-label="Sort devices"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest paired</SelectItem><SelectItem value="name">Name A–Z</SelectItem><SelectItem value="lastSeen">Last seen</SelectItem></SelectContent></Select>
    </div>
    {loading ? <div className="grid gap-4 py-5 sm:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : !devices.length ? <div className="flex flex-col items-center py-6 text-center">
      <img src={deviceEmpty} alt="Phones with a privacy shield" width={1024} height={768} className="h-48 w-64 rounded-lg object-cover" />
      <h3 className="mt-4 text-lg font-semibold">Your devices belong here</h3><p className="mt-2 text-sm text-muted-foreground">No devices paired to this account yet.</p><Button asChild variant="link" className="mt-2"><Link to="/devices">Pair your first device <ArrowUpRight /></Link></Button>
    </div> : !selected.length ? <div className="py-14 text-center"><Search className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-medium">No matching devices</p><Button variant="ghost" className="mt-2" onClick={() => { setSearch(""); setFilter("all"); }}><X /> Clear filters</Button></div> : <>
      <p className="py-3 text-xs text-muted-foreground">{selected.length} of {devices.length} devices</p>
      <div className="grid gap-4 sm:grid-cols-2">{selected.map(d => <Link key={d.id} to="/devices/$deviceId" params={{ deviceId: d.id }} className="group min-w-0 rounded-lg border bg-card p-5 shadow-soft transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex items-center justify-between gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"><Smartphone className="h-5 w-5" /></span><StatusBadge status={deviceStatus(d.last_seen_at)} /></div>
        <h3 className="mt-4 break-words font-semibold">{d.name}</h3><p className="mt-1 text-xs text-muted-foreground">{d.platform} · Last seen {timeAgo(d.last_seen_at)}</p><div className="mt-4 flex flex-wrap gap-2"><ConsentPill on={d.location_consent} label="Location" /><ConsentPill on={d.usage_consent} label="Usage" /></div>
      </Link>)}</div>
    </>}
  </div>;
}