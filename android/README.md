# Haven Android — milestone 0.1

Native Kotlin + Jetpack Compose; Android 8.0 (API 26) or newer. No Android Studio is needed to use the GitHub build workflow. This is a sideloadable debug/test APK, not a Play Store release.

## Online APK build
1. Connect this Lovable project to your GitHub account through the project's GitHub settings. Synchronize the complete repository, including `android/` and `.github/workflows/android-apk.yml`.
2. On GitHub open **Actions → Build Haven Android APK → Run workflow**.
3. After a successful run, download **Haven-Android-debug** in Artifacts; unzip it and install `app-debug.apk` on your Android phone. Allow installation for the browser/file-manager you trust only while installing, then switch it off again.
4. Publish your Haven dashboard with public site visibility so Android can call its endpoints. Do not use the editor's private preview URL. Enter the published HTTPS origin in the phone app (no `/devices` suffix).
5. Create a new pairing code on the dashboard's Devices page. In the phone app read the consent statement, check consent, and enter the code. The code expires after 10 minutes and works once.
6. After pairing, tap **Sync now** and verify the same named device appears online in your dashboard. Automatic status sync is off by default; enable it on the phone only if desired.

GitHub Actions hosted-runner allowances vary by account/repository visibility. Keep usage within your free allowance; do not enable billing to run this project. Artifact expiry is seven days. A new runner debug key may require uninstalling a previous debug APK before reinstalling; uninstalling loses local pairing. This app asks for no location, microphone, camera or Usage Access permissions.

## Delivered features
- HTTPS-only pairing; short-lived one-use codes; atomic server enrollment.
- Device token encrypted with an Android Keystore AES-GCM key. Backups disabled; token expiry 90 days. No account password or cloud secret in APK.
- Manual device-status sync; optional WorkManager periodic status sync, minimum 15 minutes. Android battery/network scheduling can delay it; not uninterrupted tracking.
- Explicit disconnect, confirmed on phone, revokes pairing and deletes device/location/usage data on the server. Failed offline disconnect keeps pairing for retry. Dashboard removal also revokes device credentials.
- Home, Sharing and Privacy views; location and app-usage collection deliberately unavailable in this milestone, visibly labelled. They need subsequent consent/permission implementation and real-device testing.

## API contract
POST `/api/public/device/enroll`: JSON `{ "code": "eight-character code" }`; 201 returns device_id, device_name, token (once), expires_at. 400 invalid input, 401 invalid/used/expired code, 429 global enrollment safety cap (120 attempts/minute), 503 unavailable. The code authorizes enrollment; owner is derived only from the stored code, never caller input.
POST `/api/public/device/status`: `Authorization: Bearer <device token>`; 200 returns synced_at; 401 missing/revoked/expired token.
POST `/api/public/device/disconnect`: same device token; 200 confirms disconnected; 401 invalid token. Operates only on the credential's device, not a supplied device ID.
All responses are no-store. Database stores SHA-256 token hashes only. Database functions validate credentials within the same transaction as device updates. Raw token/code values must never be logged. Device status updates do not create a new audit row for every heartbeat; enrollment, deletion and material device changes do.

## Build locally in an online environment
JDK 17; Android SDK platform 35, build-tools 35.0.0; Gradle 8.13. Set ANDROID_HOME and run from `android/`:
`gradle --no-daemon testDebugUnitTest assembleDebug`
The workflow downloads Gradle; no wrapper binary or user-side Android Studio installation required.

## Acceptance checks on a real phone
- Pair once; trying that code again fails; wrong code fails.
- Relaunch app and confirm pairing persists without exposing token.
- Offline sync reports failure; restore network and retry.
- Enable/disable automatic status sync on phone, verify only status data is sent.
- Remove on dashboard, then phone sync must request re-pair.
- Confirm disconnect cancels sync and removes the dashboard device.
- Inspect readable Home/Sharing/Privacy screens with large font size, narrow screen, dark/light mode.
Real-device acceptance remains required; successful assembly alone is not proof of phone behavior.
