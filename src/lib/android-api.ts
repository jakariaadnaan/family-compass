import { z } from "zod";

export const pairingInput = z.object({ code: z.string().trim().toUpperCase().regex(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/) }).strict();
export function deviceBearer(request: Request) {
  const header = request.headers.get("authorization");
  const match = header?.match(/^Bearer (haven_[a-f0-9]{64})$/);
  return match?.[1] ?? null;
}
export async function tokenHash(token: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}