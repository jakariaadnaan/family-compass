import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: "online" | "offline" | "never" }) {
  const map = {
    online: { label: "Online", cls: "bg-success/15 text-success", dot: "bg-success" },
    offline: { label: "Offline", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
    never: { label: "Waiting for pairing", cls: "bg-warning/15 text-accent-foreground", dot: "bg-warning" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", map.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} /> {map.label}
    </span>
  );
}

export function ConsentPill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs",
        on ? "border-primary/30 bg-secondary text-secondary-foreground" : "text-muted-foreground",
      )}
    >
      {label}: {on ? "shared" : "off"}
    </span>
  );
}
