import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const devicesQuery = queryOptions({
  queryKey: ["devices"],
  queryFn: async () => {
    const { data, error } = await supabase.from("devices").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const pendingCodesQuery = queryOptions({
  queryKey: ["pairing-codes"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("device_pairing_codes")
      .select("id, device_name, expires_at, used_at, created_at")
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const auditQuery = queryOptions({
  queryKey: ["audit"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  },
});

export const usageQuery = queryOptions({
  queryKey: ["usage-summaries"],
  queryFn: async () => {
    const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const { data, error } = await supabase.from("usage_summaries").select("*").gte("day", since);
    if (error) throw error;
    return data;
  },
});

/** Online = heartbeat within the last 30 minutes (WorkManager runs ~every 15 min). */
export const ONLINE_WINDOW_MS = 30 * 60 * 1000;

export function deviceStatus(lastSeen: string | null, now = Date.now()): "online" | "offline" | "never" {
  if (!lastSeen) return "never";
  return now - new Date(lastSeen).getTime() <= ONLINE_WINDOW_MS ? "online" : "offline";
}

export function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
