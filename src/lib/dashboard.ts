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

export function pageMeta(title: string, description: string) {
  return { meta: [{ title: `${title} — Haven` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Haven` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}