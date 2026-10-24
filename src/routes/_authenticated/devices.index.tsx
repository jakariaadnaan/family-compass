import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Copy, Smartphone, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { devicesQuery, pendingCodesQuery, deviceStatus, timeAgo } from "@/lib/devices";
import { StatusBadge, ConsentPill } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/devices/")({
  head: () => ({ meta: [{ title: "Devices — Haven" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const qc = useQueryClient();
  const { data: devices, isLoading } = useQuery(devicesQuery);
  const { data: codes } = useQuery(pendingCodesQuery);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ code: string; expires_at: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.rpc("create_pairing_code", { _device_name: name });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setResult(data?.[0] ?? null);
    qc.invalidateQueries({ queryKey: ["pairing-codes"] });
    qc.invalidateQueries({ queryKey: ["audit"] });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="mt-1 text-muted-foreground">Phones paired to your account.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResult(null); setName(""); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Pair a device</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pair a new device</DialogTitle>
              <DialogDescription>The code works once and expires in 10 minutes.</DialogDescription>
            </DialogHeader>
            {result ? (
              <div className="text-center">
                <p className="font-display text-4xl font-bold tracking-[0.3em] text-primary">{result.code}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Expires at {new Date(result.expires_at).toLocaleTimeString()}. Enter it in the Haven phone app.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => { navigator.clipboard.writeText(result.code); toast.success("Copied"); }}>
                  <Copy className="h-4 w-4" /> Copy code
                </Button>
              </div>
            ) : (
              <form onSubmit={createCode} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dname">Device name</Label>
                  <Input id="dname" placeholder="e.g. Rafi's phone" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create pairing code"}</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {codes && codes.length > 0 && (
        <div className="mt-6 rounded-xl border border-dashed bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-primary" /> Waiting for a phone to use these codes</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {codes.map((c) => (
              <li key={c.id}>{c.device_name} — expires {new Date(c.expires_at).toLocaleTimeString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></>
        ) : devices && devices.length > 0 ? (
          devices.map((d) => (
            <Link key={d.id} to="/devices/$deviceId" params={{ deviceId: d.id }} className="rounded-xl border bg-card p-5 shadow-soft transition hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2"><Smartphone className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-xs text-muted-foreground">Last seen {timeAgo(d.last_seen_at)}</p>
                  </div>
                </div>
                <StatusBadge status={deviceStatus(d.last_seen_at)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ConsentPill on={d.location_consent} label="Location" />
                <ConsentPill on={d.usage_consent} label="App usage" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-xl border bg-card p-10 text-center">
            <Smartphone className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No paired devices</p>
            <p className="mt-1 text-sm text-muted-foreground">Click "Pair a device" to get a code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
