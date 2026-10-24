import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Copy, KeyRound, RefreshCw, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { devicesQuery, pendingCodesQuery } from "@/lib/devices";
import { DeviceCollection } from "@/components/DeviceCollection";
import { pageMeta } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/devices/")({
  head: () => pageMeta("Devices", "Find, filter and securely pair the devices in your Haven account."),
  component: DevicesPage,
});

function DevicesPage() {
  const qc = useQueryClient();
  const { data: devices, isLoading, error, isFetching, refetch } = useQuery(devicesQuery);
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
        <div className="flex items-center gap-2"><Button variant="outline" size="icon" title="Refresh devices" aria-label="Refresh devices" disabled={isFetching} onClick={() => void refetch()}><RefreshCw className={isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></Button><Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResult(null); setName(""); } }}>
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
                <p className="font-display text-4xl font-bold text-primary">{result.code}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Expires at {new Date(result.expires_at).toLocaleTimeString()}. Enter it in the Haven phone app.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => { navigator.clipboard.writeText(result.code).then(() => toast.success("Copied")).catch(() => toast.error("Could not copy code")); }}>
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
        </Dialog></div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y py-4"><p className="text-sm text-muted-foreground">Haven for Android · Native test app</p><Button asChild variant="outline" size="sm"><Link to="/android"><Download /> Get Android app</Link></Button></div>

      {codes && codes.length > 0 && (
        <div className="mt-6 rounded-lg border border-dashed bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-primary" /> Waiting for a phone to use these codes</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {codes.map((c) => (
              <li key={c.id}>{c.device_name} — expires {new Date(c.expires_at).toLocaleTimeString()}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-7">
        {error ? <div role="alert" className="flex items-center justify-between gap-3 border-y py-5 text-sm text-destructive">Devices could not be loaded.<Button variant="outline" onClick={() => void refetch()}>Retry</Button></div> : <DeviceCollection devices={devices ?? []} loading={isLoading} />}
      </section>
    </div>
  );
}
