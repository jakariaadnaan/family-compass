import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Github, Smartphone, ShieldCheck, Wifi, MapPin, BarChart3, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/dashboard";
import deviceImage from "@/assets/device-empty.jpg";
import apkAsset from "@/assets/haven-apk.asset.json";

export const Route = createFileRoute("/_authenticated/android")({ head: () => pageMeta("Android app", "Get the Haven native Android test app and pair your phone with consent."), component: AndroidPage });
function AndroidPage() {
  return <div>
    <p className="text-xs font-semibold uppercase text-primary">Haven for Android · 0.1.0</p>
    <h1 className="mt-3 text-3xl font-semibold">Your phone. Your permission.</h1>
    <p className="mt-3 text-sm text-muted-foreground">Native Android · Android 8.0 and newer · Test version</p>
    <div className="mt-6 flex flex-wrap gap-3"><Button asChild><a href={apkAsset.url} download="haven-0.1.0-debug.apk"><Download /> Download test APK</a></Button><Button asChild variant="outline"><Link to="/devices"><Smartphone /> Pair a device</Link></Button></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section><h2 className="text-lg font-semibold">First release</h2><div className="mt-4 divide-y border-y">{[{ icon: ShieldCheck, title: "Secure pairing", status: "One-use code · encrypted phone credential" }, { icon: Wifi, title: "Device status", status: "Manual sync · optional automatic updates" }, { icon: MapPin, title: "Location", status: "Not collected in this version" }, { icon: BarChart3, title: "App usage", status: "Not collected in this version" }].map(item => <div key={item.title} className="flex gap-3 py-4"><item.icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.status}</p></div></div>)}</div></section>
      <img src={deviceImage} alt="Haven phones and privacy shield" width={1024} height={768} loading="lazy" className="w-full rounded-lg" />
    </div>
    <section className="mt-9 border-t pt-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Github className="h-5 w-5" /> Build online with GitHub</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground"><li>Connect this project using Lovable’s GitHub settings.</li><li>In GitHub, open Actions → Build Haven Android APK → Run workflow.</li><li>After it succeeds, download Haven-Android-debug from Artifacts and unzip the APK.</li></ol><p className="mt-4 text-xs text-muted-foreground">GitHub free allowances apply. This is a debug APK for testing, not a Play Store release.</p></section>
    <section className="mt-9 border-t pt-6"><h2 className="text-lg font-semibold">Connect your phone</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground"><li>Publish your dashboard with public site visibility; account and device data still require authorization.</li><li>Install the APK and enter your published dashboard’s HTTPS address.</li><li>Create a fresh pairing code in Devices, read the phone’s consent statement, then pair.</li><li>Tap Sync now and check that the same device appears in your dashboard.</li></ol><p className="mt-4 text-xs text-muted-foreground">Automatic status updates may be delayed by Android. Real-phone testing is still required.</p><Button asChild variant="link" className="mt-2 px-0"><Link to="/devices">Open devices <ArrowUpRight /></Link></Button></section>
  </div>;
}