import { describe, it, expect } from "vitest";
import { deviceStatus } from "./devices";

describe("deviceStatus", () => {
  const now = Date.parse("2026-10-24T12:00:00Z");
  it("is online when seen within 30 minutes", () => {
    expect(deviceStatus("2026-10-24T11:31:00Z", now)).toBe("online");
  });
  it("is offline when seen more than 30 minutes ago", () => {
    expect(deviceStatus("2026-10-24T11:29:00Z", now)).toBe("offline");
  });
  it("is never when not yet seen", () => {
    expect(deviceStatus(null, now)).toBe("never");
  });
});
