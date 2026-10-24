import { describe, expect, it } from "vitest";
import { pairingInput, deviceBearer, tokenHash } from "./android-api";
describe("Android API credentials", () => {
  it("accepts and normalizes an eight-character code", () => { expect(pairingInput.parse({ code: " abcd2345 " }).code).toBe("ABCD2345"); });
  it("rejects invalid code length and extra ownership fields", () => { expect(pairingInput.safeParse({ code: "ABC" }).success).toBe(false); expect(pairingInput.safeParse({ code: "ABCD2345", owner_id: "other" }).success).toBe(false); });
  it("rejects a device ID as authorization", () => { expect(deviceBearer(new Request("https://haven.test", { headers: { authorization: "Bearer 12345678-1234-1234-1234-123456789012" } }))).toBe(null); });
  it("accepts only the device credential format", () => { const token = `haven_${"a".repeat(64)}`; expect(deviceBearer(new Request("https://haven.test", { headers: { authorization: `Bearer ${token}` } }))).toBe(token); });
  it("hashes the credential without preserving plaintext", async () => { expect(await tokenHash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"); });
});