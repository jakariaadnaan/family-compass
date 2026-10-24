import { describe, expect, it } from "vitest";
import { selectDevices } from "./dashboard";

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
  it("sorts by name without mutating the input", () => { expect(selectDevices(devices, "", "all", "name", now).map(d => d.name)).toEqual(["Adnan's phone", "Rafi's phone", "Tablet"]); expect(devices[0].name).toBe("Rafi's phone"); });
});