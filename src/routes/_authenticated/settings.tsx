import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Haven" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setCurrent(""); setNext("");
  }

  async function exportData() {
    const [devices, locations, usage, audit] = await Promise.all([
      supabase.from("devices").select("*"),
      supabase.from("location_records").select("*"),
      supabase.from("usage_summaries").select("*"),
      supabase.from("audit_logs").select("*"),
    ]);
    const blob = new Blob(
      [JSON.stringify({ exported_at: new Date().toISOString(), devices: devices.data, locations: locations.data, usage: usage.data, audit: audit.data }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "haven-export.json";
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Signed in as {user.email}</p>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 grid max-w-sm gap-3">
          <div className="space-y-1.5"><Label htmlFor="cur">Current password</Label><Input id="cur" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="new">New password</Label><Input id="new" type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} /></div>
          <Button type="submit" className="w-fit">Update password</Button>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Your data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Download everything stored about your account and devices.</p>
        <Button variant="outline" className="mt-4" onClick={exportData}><Download className="h-4 w-4" /> Export as JSON</Button>
      </section>
    </div>
  );
}
