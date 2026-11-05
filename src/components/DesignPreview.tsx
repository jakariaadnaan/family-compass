import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AppWindow, ArrowLeft, BatteryMedium, Bell, Clipboard, Clock3, Contact, Download, File, Folder, Globe, HardDrive, Keyboard, LayoutDashboard, MapPin, Menu, Mic, Monitor, Moon, Phone, RefreshCw, Search, ShieldCheck, Smartphone, Sun, Wifi, MessageSquare, MemoryStick, Heart, TrendingUp, type LucideIcon } from "lucide-react";

export const previewPages = [
 { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
 { id: "gps", label: "GPS Location", icon: MapPin, group: "Monitoring" },
 { id: "microphone", label: "Microphone", icon: Mic, group: "Monitoring" },
 { id: "calls", label: "Call Logs", icon: Phone, group: "Monitoring" },
 { id: "sms", label: "SMS Messages", icon: MessageSquare, group: "Monitoring" },
 { id: "contacts", label: "Contacts", icon: Contact, group: "Monitoring" },
 { id: "notifications", label: "Notifications", icon: Bell, group: "Monitoring" },
 { id: "keylogger", label: "Keylogger", icon: Keyboard, group: "Monitoring" },
 { id: "apps", label: "Installed Apps", icon: AppWindow, group: "Data & files" },
 { id: "websites", label: "Websites", icon: Globe, group: "Data & files" },
 { id: "files", label: "File Explorer", icon: Folder, group: "Data & files" },
 { id: "downloads", label: "Downloads", icon: Download, group: "Data & files" },
 { id: "clipboard", label: "Clipboard", icon: Clipboard, group: "Data & files" },
] as const;
export type PreviewPage = typeof previewPages[number]["id"];
export function DesignPreview({ page }: { page: PreviewPage }) {
 const [collapsed, setCollapsed] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [dark, setDark] = useState(false);
 const [search, setSearch] = useState("");
 const current = previewPages.find(item => item.id === page) ?? previewPages[0];
 return <div className={`design-preview ${dark ? "preview-dark" : ""}`}>
  {mobileOpen && <div className="dp-backdrop" onClick={() => setMobileOpen(false)} />}
  <aside className={`dp-sidebar ${collapsed ? "dp-collapsed" : ""} ${mobileOpen ? "dp-open" : ""}`}>
   <Link to="/design-preview" search={{ page: "dashboard" }} className="dp-brand"><ShieldCheck /><span>Haven</span></Link>
   <nav className="dp-nav" aria-label="Design preview pages"><div className="dp-search"><Search /><input aria-label="Find a page" placeholder="Find a page..." value={search} onChange={e => setSearch(e.target.value)} /></div>
    {["Overview", "Monitoring", "Data & files"].map(group => <div className="dp-navgroup" key={group}><p>{group}</p>{previewPages.filter(item => item.group === group && item.label.toLowerCase().includes(search.toLowerCase())).map(item => <Button asChild variant="ghost" className={`dp-navitem ${page === item.id ? "dp-active" : ""}`} key={item.id} title={item.label}><Link to="/design-preview" search={{ page: item.id }} onClick={() => setMobileOpen(false)}><item.icon /><span>{item.label}</span></Link></Button>)}</div>)}
   </nav><Button asChild variant="secondary" className="dp-back"><Link to="/devices"><ArrowLeft /><span>Back to Devices</span></Link></Button>
  </aside>
  <main className="dp-main"><header className="dp-topbar"><div className="dp-top-left"><Button variant="outline" size="icon" aria-label="Toggle navigation" title="Toggle navigation" onClick={() => { setCollapsed(v => !v); setMobileOpen(v => !v); }}><Menu /></Button><div><h1>SYMPHONY Z25 <span className="dp-online-dot" /></h1><p><Smartphone /> Device Manager <span>· Design preview</span></p></div></div><div className="dp-top-actions"><Button variant="outline" size="icon" aria-label="Toggle preview theme" title="Toggle preview theme" onClick={() => setDark(v => !v)}>{dark ? <Sun /> : <Moon />}</Button><Button variant="outline" size="icon" aria-label="Reset preview" title="Reset preview" onClick={() => setSearch("")}><RefreshCw /></Button></div></header><div className="dp-content">{page === "dashboard" ? <PreviewDashboard /> : <PreviewSection page={current} />}</div></main>
 </div>;
}
function Panel({ icon: Icon, title, subtitle, right, children }: { icon: LucideIcon; title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
 return <section className="dp-panel"><div className="dp-panelhead"><div className="dp-headleft"><span className="dp-headicon"><Icon /></span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{right}</div>{children}</section>;
}
function PreviewDashboard() {
 const stats = [{ icon: MemoryStick, label: "RAM TOTAL", value: "2.8 GB", note: "55% in use" }, { icon: HardDrive, label: "STORAGE", value: "24.9 GB", note: "65% used" }, { icon: Wifi, label: "SIM STATUS", value: "WiFi", note: "Network info" }, { icon: Monitor, label: "DISPLAY", value: "720×1560", note: "60 Hz refresh" }];
 return <><div className="dp-devicecard"><span className="dp-deviceicon"><Smartphone /></span><div className="dp-deviceinfo"><div className="dp-devicename">SYMPHONY Z25 <span className="dp-pill">● Online</span><span className="dp-pill dp-amber">Unlocked</span></div><p><Smartphone /> Z25 <span>·</span> Android 9 <span>·</span> SDK —</p></div><div className="dp-battery"><strong>41% <BatteryMedium /></strong><span>On Battery</span></div></div>
 <div className="dp-stats">{stats.map(s => <div className="dp-stat" key={s.label}><span className="dp-staticon"><s.icon /></span><p>{s.label}</p><strong>{s.value}</strong><small>{s.note}</small></div>)}</div>
 <Panel icon={Clock3} title="Screen Time" subtitle="Last 7 days usage overview" right={<div className="dp-chart-total"><strong>2h 25m</strong><p>Today</p></div>}><div className="dp-chart"><div className="dp-chart-y">{["3h", "2h", "1h", "0h"].map(t => <span key={t}>{t}</span>)}</div><div className="dp-bars">{["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"].map((day, i) => <div className="dp-barwrap" key={day}><div className="dp-bar-area"><span>{i > 4 ? "2h25m" : "0m"}</span><div className={`dp-bar ${i > 4 ? "dp-bar-filled" : ""} ${i === 6 ? "dp-today" : ""}`} /></div><strong>{day}</strong><small>{i < 4 ? `Jul ${28 + i}` : `Aug 0${i - 3}`}</small></div>)}</div></div></Panel>
 <div className="dp-lowergrid"><Ranking title="Most Used Apps" subtitle="By foreground time" icon={Heart} rows={[["XPlayer - Video Player", "32m"], ["Quickstep", "27m"], ["Lite", "26m"], ["Chrome", "18m"]]} /><Ranking title="Recent Activity" subtitle="How many times each app was opened" icon={TrendingUp} rows={[["Quickstep", "101x opened"], ["Package installer", "85x opened"], ["Settings", "81x opened"], ["Chrome", "62x opened"]]} /></div></>;
}
function Ranking({ title, subtitle, icon, rows }: { title: string; subtitle: string; icon: LucideIcon; rows: string[][] }) {
 return <Panel title={title} subtitle={subtitle} icon={icon}><ol className="dp-ranking">{rows.map(([name, value], i) => <li key={name}><span>{i + 1}</span><div><strong>{name}</strong><div className="dp-track"><div className={`dp-fill dp-fill-${i}`} /></div></div><b>{value}</b></li>)}</ol></Panel>;
}
function PreviewSection({ page }: { page: typeof previewPages[number] }) {
 const titles: Record<string, string[]> = { gps: ["LOCATION STATUS", "LAST UPDATE", "ACCURACY"], microphone: ["MICROPHONE", "RECORDINGS", "STORAGE USED"], calls: ["TOTAL CALLS", "INCOMING", "MISSED"], sms: ["MESSAGES", "INCOMING", "OUTGOING"], contacts: ["TOTAL CONTACTS", "FAVORITES", "RECENTLY ADDED"], notifications: ["TOTAL TODAY", "UNREAD", "APPS"], keylogger: ["CAPTURE STATUS", "EVENTS", "LAST ACTIVITY"], apps: ["TOTAL APPS", "SYSTEM APPS", "USER APPS"], websites: ["VISITS TODAY", "TOP SITES", "BROWSER"], files: ["FILES", "FOLDERS", "STORAGE USED"], downloads: ["DOWNLOADS", "TOTAL SIZE", "LAST DOWNLOAD"], clipboard: ["SAVED ITEMS", "PINNED ITEMS", "SYNC STATUS"] };
 return <><div className="dp-pagehead"><h2>{page.label}</h2><span className="dp-count">Preview</span></div><div className="dp-detailgrid">{(titles[page.id] ?? []).map((label, i) => <div className="dp-detailcard" key={label}><p>{label}</p><strong>{i === 0 ? "Inactive" : "—"}</strong><small>No device data connected</small></div>)}</div><Panel icon={page.icon} title={page.label} subtitle="Design preview" right={<span className="dp-count">Total: 0</span>}>{page.id === "gps" ? <div className="dp-map-empty"><MapPin /><span>No location connected</span></div> : <><div className="dp-tablehead"><span>{["files", "downloads"].includes(page.id) ? "NAME" : "ACTIVITY"}</span><span>STATUS</span></div>{["Overview", "History", "Settings"].map(label => <div className="dp-listrow" key={label}><span className="dp-rowicon">{page.id === "files" ? <Folder /> : page.id === "downloads" ? <File /> : <page.icon />}</span><div><strong>{page.label} · {label}</strong><p>No data connected</p></div></div>)}</>}</Panel></>;
}
