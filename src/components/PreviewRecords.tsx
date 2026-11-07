import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3, Download, File, Folder, FolderOpen, MessageSquare, Phone, PhoneMissed, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Static examples only. These views do not read or mutate phone data. */
export function PreviewRecords({ page }: { page: "calls" | "sms" | "files" | "downloads" }) {
  const [tab, setTab] = useState<"log" | "send">("log");
  const [folder, setFolder] = useState<string | null>(null);
  if (page === "calls") return <section className="dp-panel"><Header icon={<Phone />} title="Call History" subtitle="Incoming, outgoing & missed calls" count="Total: 77 · Sample" />
    {[['Sample contact A', 'MISSED', 'Aug 2, 03:38 PM', '0s'], ['Unknown', 'IN', 'Jul 29, 08:40 PM', '5s'], ['Sample contact B', 'MISSED', 'Jul 29, 11:58 AM', '0s'], ['Sample contact B', 'MISSED', 'Jul 29, 11:57 AM', '0s'], ['Sample contact B', 'MISSED', 'Jul 28, 08:36 PM', '0s'], ['Sample contact B', 'MISSED', 'Jul 28, 11:32 AM', '0s'], ['Sample contact B', 'MISSED', 'Jul 28, 11:25 AM', '0s'], ['Sample contact B', 'MISSED', 'Jul 28, 11:23 AM', '0s']].map(([name, status, date, duration], i) => <div className="dp-listrow dp-callrow" key={i}><span className={`dp-record-icon ${status === 'IN' ? 'dp-record-blue' : ''}`}>{status === 'IN' ? <ArrowDownLeft /> : <PhoneMissed />}</span><div className="dp-record-main"><strong>{name}</strong><p>+8801•••••••••</p><p><span className="dp-record-tag">{status}</span><span> · {date}</span></p></div><span className="dp-duration">{duration}</span></div>)}
  </section>;
  if (page === "sms") return <section className="dp-panel"><div className="dp-record-tabs"><Button variant="ghost" className={tab === 'log' ? 'dp-selected-tab' : ''} onClick={() => setTab('log')}><MessageSquare /> SMS Log</Button><Button variant="ghost" className={tab === 'send' ? 'dp-selected-tab' : ''} onClick={() => setTab('send')}><Send /> Send SMS</Button></div>
    {tab === 'log' ? <><Header icon={<MessageSquare />} title="Message History" count="Total: 38 · Sample" />{[
      ['Sample service', 'Service update notification — illustrative message.', 'Aug 3, 01:39 PM'],
      ['Sample billing', 'Thank you for your payment. Your invoice is now marked as paid.', 'Aug 2, 01:57 PM'],
      ['Sample wallet', 'Payment of BDT •••• was successful. Transaction reference: ••••.', 'Aug 2, 01:57 PM'],
      ['Sample wallet', 'Never share your OTP or PIN with anyone.', 'Aug 2, 01:56 PM'],
      ['Sample billing', 'A new invoice has been generated for your service.', 'Aug 2, 01:55 PM'],
      ['Sample wallet', 'You have received BDT ••••. Balance: ••••.', 'Aug 1, 07:46 PM'],
      ['Sample service', 'Account security notification — illustrative message.', 'Jul 31, 09:31 PM'],
      ['Sample wallet', 'Your payment was successful.', 'Jul 30, 07:25 PM'],
    ].map(([name, message, date], i) => <div className="dp-listrow dp-smsrow" key={i}><div className="dp-record-main"><strong><span className="dp-record-tag dp-record-in">IN</span>{name}</strong><div className="dp-message">{message}</div></div><span className="dp-duration"><Clock3 />{date}</span></div>)}</> : <div className="dp-send-form"><h2>Send SMS — Preview</h2><div><Label htmlFor="preview-recipient">RECIPIENT</Label><Input id="preview-recipient" placeholder="Phone number" disabled /></div><div><Label htmlFor="preview-message">MESSAGE</Label><Textarea id="preview-message" placeholder="Type a message" disabled /></div><Button variant="outline" disabled><Send /> Preview Send</Button><p>Sample only · Nothing will be sent.</p></div>}
  </section>;
  const files = page === 'downloads' ? ['haven-1.0.0.apk', 'sample-video.mp4', 'invoice-2026.pdf', 'IMG_20260802.jpg', 'presentation.pptx'] : ['../', 'Android', 'inshot', 'videos', 'Download', 'DCIM', 'sample-video.mp4', 'haven-1.0.0.apk', 'Pictures', 'Music', 'Documents', 'WhatsApp', 'Telegram', 'Recordings', 'Movies', 'Alarms', 'Notifications'];
  return <section className="dp-panel"><Header icon={<Folder />} title={page === 'files' ? 'File Manager' : 'Downloads'} subtitle={page === 'files' ? 'Browse device files' : 'Downloaded files'} count={`Total: ${folder ? 0 : files.length} · Sample`} />
    {folder && <div className="dp-folder-path"><Button variant="ghost" size="sm" onClick={() => setFolder(null)}><ArrowUpRight /> Internal storage</Button><span>/ {folder}</span></div>}
    <div className="dp-tablehead"><span>NAME</span><span>ACTION</span></div>
    {folder ? <div className="dp-folder-empty"><FolderOpen /><p>No sample files in this folder</p></div> : files.map(name => {
      const isFolder = page === 'files' && (!name.includes('.') || name === '../');
      return <div className="dp-listrow dp-filerow" key={name}><span className="dp-record-icon">{isFolder ? <Folder /> : <File />}</span><div className="dp-record-main"><strong>{name}</strong></div><Button variant="outline" size="sm" className={isFolder ? '' : 'dp-download-button'} disabled={!isFolder} onClick={() => { if (name !== '../') setFolder(name); }} title={isFolder ? 'Open sample folder' : 'Sample file only'}>{isFolder ? <FolderOpen /> : <Download />}{isFolder ? 'Open' : 'Download'}</Button></div>;
    })}
  </section>;
}

function Header({ icon, title, subtitle, count }: { icon: React.ReactNode; title: string; subtitle?: string; count: string }) {
  return <div className="dp-panelhead"><div className="dp-headleft"><span className="dp-headicon">{icon}</span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div><span className="dp-count">{count}</span></div>;
}