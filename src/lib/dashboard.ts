import { deviceStatus } from "./devices";

export type DeviceFilter = "all" | "online" | "offline" | "never";
export type DeviceSort = "newest" | "name" | "lastSeen";
type DeviceItem = { name: string; last_seen_at: string | null; created_at: string };

export function selectDevices<T extends DeviceItem>(devices: T[], search: string, filter: DeviceFilter, sort: DeviceSort, now = Date.now()): T[] {
  const term = search.trim().toLocaleLowerCase();
  return devices.filter((device) => device.name.toLocaleLowerCase().includes(term) && (filter === "all" || deviceStatus(device.last_seen_at, now) === filter)).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "lastSeen") return (b.last_seen_at ? Date.parse(b.last_seen_at) : 0) - (a.last_seen_at ? Date.parse(a.last_seen_at) : 0);
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  });
}

export const activityLabels: Record<string, string> = {
  "device.enrolled": "Android device paired",
  "pairing_code.created": "Pairing code created",
  "device.updated": "Device updated",
  "device.removed": "Device removed",
};

export type UsageRow = { day: string; package_name: string; app_label: string | null; foreground_minutes: number };

/** Last 7 days of screen time, oldest first, ending today. Days without rows are 0. */
export function screenTimeWeek(rows: UsageRow[], now = new Date()) {
  const days: { key: string; label: string; minutes: number; today: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString("en-US", { weekday: "short" }), minutes: 0, today: i === 0 });
  }
  for (const row of rows) {
    const slot = days.find(d => d.key === row.day);
    if (slot) slot.minutes += row.foreground_minutes;
  }
  return days;
}

/** Top apps by total foreground minutes, descending. */
export function topApps(rows: UsageRow[], limit = 5) {
  const totals = new Map<string, { label: string; minutes: number }>();
  for (const row of rows) {
    const entry = totals.get(row.package_name) ?? { label: row.app_label ?? row.package_name, minutes: 0 };
    entry.minutes += row.foreground_minutes;
    totals.set(row.package_name, entry);
  }
  return [...totals.values()].sort((a, b) => b.minutes - a.minutes).slice(0, limit);
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function pageMeta(title: string, description: string) {
  return { meta: [{ title: `${title} — Haven` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Haven` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}