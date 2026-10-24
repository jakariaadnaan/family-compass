import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Wifi, MapPin, BarChart3, Plus } from "lucide-react";
import { devicesQuery, deviceStatus, timeAgo } from "@/lib/devices";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — Haven" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error } = useQuery(devicesQuery);
  const devices = data ?? [];
  const online = devices.filter((d) => deviceStatus(d.last_seen_at) === "online").length;
  const stats = [
    { label: "Devices", value: devices.length, icon: Smartphone },
    { label: "Online now", value: online, icon: Wifi },
    { label: "Sharing location", value: devices.filter((d) => d.location_consent).length, icon: MapPin },
    { label: "Sharing usage", value: devices.filter((d) => d.usage_consent).length, icon: BarChart3 },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="mt-1 text-muted-foreground">Your family's devices at a glance.</p>
        </div>
        <Button asChild>
          <Link to="/devices"><Plus className="h-4 w-4" /> Pair a device</Link>
        </Button>
      </div>

      {error && <p className="mt-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">Couldn't load devices. Please refresh.</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-primary" />
            {isLoading ? <Skeleton className="mt-3 h-8 w-12" /> : <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>}
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recent activity</h2>
      <div className="mt-3 rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5"><Skeleton className="h-6" /><Skeleton className="h-6" /></div>
        ) : devices.length === 0 ? (
          <div className="p-10 text-center">
            <Smartphone className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No devices yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a pairing code, then enter it in the Haven phone app.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {devices.slice(0, 5).map((d) => (
              <li key={d.id}>
                <Link to="/devices/$deviceId" params={{ deviceId: d.id }} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">Last seen {timeAgo(d.last_seen_at)}</p>
                  </div>
                  <StatusBadge status={deviceStatus(d.last_seen_at)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
