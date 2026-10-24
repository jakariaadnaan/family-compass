import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Smartphone, MapPin, BarChart3, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Haven — Transparent family device dashboard" },
      {
        name: "description",
        content:
          "Pair your family's Android devices with consent, see status, location and app-usage summaries in one private dashboard.",
      },
      { property: "og:title", content: "Haven — Transparent family device dashboard" },
      {
        property: "og:description",
        content: "Consent-first device dashboard for families. Nothing hidden, nothing covert.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Smartphone, title: "Pair with a code", text: "Short-lived pairing codes. A device is never reachable just by its ID." },
  { icon: MapPin, title: "Shared location", text: "Only when the device user turns it on. Visible on the phone, always." },
  { icon: BarChart3, title: "Usage summaries", text: "Daily screen-time totals per app — no messages, no content." },
  { icon: Trash2, title: "You own the data", text: "Export or delete history anytime. Every action is logged." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" /> Haven
        </div>
        <Button asChild variant="outline">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Eye className="h-3.5 w-3.5" /> Consent-first. Nothing covert.
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
            Look out for your family's devices — openly.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Haven pairs Android phones with a private dashboard. The person holding the phone always
            knows what is shared, and can switch it off.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Create your dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 shadow-soft">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
