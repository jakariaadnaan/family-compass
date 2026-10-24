<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Device data access is enforced by RLS on `devices.owner_id`; child tables (locations, usage) check ownership via the parent device. Why: a device ID alone must never grant access.
- Pairing codes are created only via the `create_pairing_code` SQL function, which stores a SHA-256 hash and returns the plaintext once. Why: codes are credentials.
- Audit rows are written by DB triggers/functions only (no client INSERT grant). Why: users must not forge their own log.
- Signed-in pages live under `src/routes/_authenticated/` with the app shell in its `route.tsx`. Why: single auth gate and shared nav.
