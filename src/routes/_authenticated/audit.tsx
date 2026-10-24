import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { auditQuery } from "@/lib/devices";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Activity log — Haven" }] }),
  component: AuditPage,
});

const labels: Record<string, string> = {
  "pairing_code.created": "Pairing code created",
  "device.updated": "Device updated",
  "device.removed": "Device removed",
};

function AuditPage() {
  const { data, isLoading } = useQuery(auditQuery);
  return (
    <div>
      <h1 className="text-3xl font-bold">Activity log</h1>
      <p className="mt-1 text-muted-foreground">Every important action on your account.</p>
      <div className="mt-6 rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5"><Skeleton className="h-6" /><Skeleton className="h-6" /></div>
        ) : !data?.length ? (
          <div className="p-10 text-center">
            <ScrollText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nothing yet.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {data.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 p-4 text-sm">
                <span><b className="font-medium">{labels[a.action] ?? a.action}</b>{a.target ? ` — ${a.target}` : ""}</span>
                <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
