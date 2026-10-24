import { pageMeta } from "@/lib/dashboard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPin, BarChart3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deviceStatus, timeAgo } from "@/lib/devices";
import { StatusBadge, ConsentPill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/devices/$deviceId")({
  head: () => pageMeta("Device details", "Review device status, shared locations and usage records in Haven."),
  component: DevicePage,
});

function DevicePage() {
  const { deviceId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      const [dev, locs, usage] = await Promise.all([
        supabase.from("devices").select("*").eq("id", deviceId).maybeSingle(),
        supabase.from("location_records").select("*").eq("device_id", deviceId).order("recorded_at", { ascending: false }).limit(20),
        supabase.from("usage_summaries").select("*").eq("device_id", deviceId).order("day", { ascending: false }).limit(50),
      ]);
      if (dev.error) throw dev.error;
      return { device: dev.data, locations: locs.data ?? [], usage: usage.data ?? [] };
    },
  });

  async function remove() {
    const { error } = await supabase.from("devices").delete().eq("id", deviceId);
    if (error) { toast.error(error.message); return; }
    toast.success("Device removed and its data deleted");
    qc.invalidateQueries();
    navigate({ to: "/devices" });
  }

  if (isLoading) return <Skeleton className="h-60 rounded-lg" />;
  if (!data?.device)
    return (
      <div className="rounded-lg border bg-card p-10 text-center">
        <p className="font-medium">Device not found</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been removed, or it isn't paired to your account.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/devices">Back to devices</Link></Button>
      </div>
    );

  const d = data.device;
  return (
    <div>
      <Link to="/devices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Devices
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{d.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last seen {timeAgo(d.last_seen_at)} · paired {new Date(d.created_at).toLocaleDateString()}</p>
        </div>
        <StatusBadge status={deviceStatus(d.last_seen_at)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConsentPill on={d.location_consent} label="Location" />
        <ConsentPill on={d.usage_consent} label="App usage" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Sharing is controlled on the phone by its user. You can't turn it on from here.</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Recent locations</h2>
          {data.locations.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No location shared yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.locations.map((l) => (
                <li key={l.id} className="flex justify-between gap-2">
                  <span>{l.lat.toFixed(5)}, {l.lng.toFixed(5)}{l.accuracy_m ? ` (±${Math.round(l.accuracy_m)} m)` : ""}</span>
                  <span className="text-muted-foreground">{timeAgo(l.recorded_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold"><BarChart3 className="h-4 w-4 text-primary" /> App usage</h2>
          {data.usage.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No usage summaries yet. The phone user must grant Usage Access.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.usage.map((u) => (
                <li key={u.id} className="flex justify-between gap-2">
                  <span>{u.app_label ?? u.package_name} <span className="text-muted-foreground">· {u.day}</span></span>
                  <span>{u.foreground_minutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-destructive/30 bg-card p-5">
        <h2 className="font-semibold">Remove device</h2>
        <p className="mt-1 text-sm text-muted-foreground">Revokes access and permanently deletes its location and usage history.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4"><Trash2 className="h-4 w-4" /> Remove device</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {d.name}?</AlertDialogTitle>
              <AlertDialogDescription>All its data will be deleted. This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
