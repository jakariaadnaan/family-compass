import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { pairingInput, deviceBearer, tokenHash } from "./android-api";

function client() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Service unavailable");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
}
const headers = { "Cache-Control": "no-store" };
function reply(data: unknown, status = 200) { return Response.json(data, { status, headers }); }
export async function enroll(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "json_required" }, 415);
  if (Number(request.headers.get("content-length") ?? 0) > 512) return reply({ error: "request_too_large" }, 413);
  try {
    const text = await request.text();
    if (text.length > 512) return reply({ error: "request_too_large" }, 413);
    const parsed = pairingInput.safeParse(JSON.parse(text));
    if (!parsed.success) return reply({ error: "invalid_request" }, 400);
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = `haven_${Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("")}`;
    const { data, error } = await client().rpc("enroll_android", { _code: parsed.data.code, _token_hash: await tokenHash(token) });
    if (error) return reply({ error: "service_unavailable" }, 503);
    if (!data || typeof data !== "object" || Array.isArray(data)) return reply({ error: "service_unavailable" }, 503);
    if (data['error']) return reply({ error: data['error'] }, data['error'] === "rate_limited" ? 429 : 401);
    return reply({ ...data, token }, 201);
  } catch (error) { return reply({ error: error instanceof SyntaxError ? "invalid_request" : "service_unavailable" }, error instanceof SyntaxError ? 400 : 503); }
}
export async function status(request: Request, disconnect: boolean) {
  const token = deviceBearer(request);
  if (!token) return reply({ error: "unauthorized" }, 401);
  try {
    const { data, error } = await client().rpc("android_status", { _token_hash: await tokenHash(token), _disconnect: disconnect });
    if (error) return reply({ error: "service_unavailable" }, 503);
    if (!data || typeof data !== "object" || Array.isArray(data) || data['error']) return reply({ error: "unauthorized" }, 401);
    return reply(data);
  } catch { return reply({ error: "service_unavailable" }, 503); }
}