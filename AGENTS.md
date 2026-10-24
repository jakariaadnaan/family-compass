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
- Device search, status filtering and sorting use the shared DeviceCollection and pure selection utility. Why: overview and device pages must apply identical selection behavior without altering stored records.
- The native Android app lives in `android/` and is built by the GitHub Actions APK workflow; keep it independent of the web toolchain. Why: users need an online native build without installing Android Studio.
- External device APIs use atomic credential-verifying SQL functions through a publishable server client; no device-ID authorization or client-chosen owner. Why: enrollment, revocation and status updates must validate the device credential inside the same transaction.
- Android credentials are AES-GCM encrypted with Android Keystore and excluded from backups; automatic status work is opt-in on the phone. Why: minimize credential exposure and preserve explicit consent.
