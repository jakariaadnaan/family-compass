import { describe, expect, it } from "vitest";
import { screenTimeWeek, selectDevices, topApps, formatMinutes } from "./dashboard";

const now = Date.parse("2026-10-24T12:00:00Z");
const devices = [
  { name: "Rafi's phone", last_seen_at: "2026-10-24T11:50:00Z", created_at: "2026-10-23T10:00:00Z" },
  { name: "Adnan's phone", last_seen_at: "2026-10-24T09:00:00Z", created_at: "2026-10-24T10:00:00Z" },
  { name: "Tablet", last_seen_at: null, created_at: "2026-10-22T10:00:00Z" },
];
describe("device selection", () => {
  it("finds names ignoring case and surrounding whitespace", () => { expect(selectDevices(devices, " RAFI ", "all", "newest", now).map(d => d.name)).toEqual(["Rafi's phone"]); });
  it("separates offline devices from devices never synced", () => { expect(selectDevices(devices, "", "offline", "newest", now).map(d => d.name)).toEqual(["Adnan's phone"]); });
  it("filters online devices", () => { expect(selectDevices(devices, "", "online", "newest", now).map(d => d.name)).toEqual(["Rafi's phone"]); });
  it("sorts newest sync first with unsynced devices last", () => { expect(selectDevices(devices, "", "all", "lastSeen", now).map(d => d.name)).toEqual(["Rafi's phone", "Adnan's phone", "Tablet"]); });
  it("sorts by name without mutating the input", () => { expect(selectDevices(devices, "", "all", "name", now).map(d => d.name)).toEqual(["Adnan's phone", "Rafi's phone", "Tablet"]); expect(devices[0]?.name).toBe("Rafi's phone"); });
});

const usageRows = [
  { day: "2026-10-24", package_name: "com.video", app_label: "XPlayer", foreground_minutes: 32 },
  { day: "2026-10-24", package_name: "com.video", app_label: "XPlayer", foreground_minutes: 10 },
  { day: "2026-10-23", package_name: "com.chat", app_label: null, foreground_minutes: 90 },
  { day: "2026-10-10", package_name: "com.old", app_label: "Old", foreground_minutes: 500 },
];
describe("usage summaries", () => {
  it("builds a 7-day week ending today with missing days at zero", () => {
    const week = screenTimeWeek(usageRows, new Date("2026-10-24T12:00:00Z"));
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ key: "2026-10-24", minutes: 42, today: true });
    expect(week[5]).toMatchObject({ key: "2026-10-23", minutes: 90 });
    expect(week[0]).toMatchObject({ key: "2026-10-18", minutes: 0 });
  });
  it("ranks apps by total minutes and falls back to the package name", () => {
    const top = topApps(usageRows);
    expect(top.map(a => a.label)).toEqual(["Old", "com.chat", "XPlayer"]);
    expect(top[0]?.minutes).toBe(500);
    expect(topApps(usageRows, 1)).toHaveLength(1);
  });
  it("formats minutes as hours and minutes", () => {
    expect(formatMinutes(0)).toBe("0m");
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(145)).toBe("2h 25m");
  });
});