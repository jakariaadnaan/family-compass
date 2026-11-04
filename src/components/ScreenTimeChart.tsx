import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Timer } from "lucide-react";
import { formatMinutes, screenTimeWeek, type UsageRow } from "@/lib/dashboard";

export function ScreenTimeChart({ rows }: { rows: UsageRow[] }) {
  const week = screenTimeWeek(rows);
  return <div className="relative mt-5 h-64 sm:h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows.length ? week : week.map(day => ({ ...day, minutes: null }))} margin={{ top: 20, right: 10, left: -15, bottom: 10 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={0} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={formatMinutes} width={55} domain={rows.length ? [0, "auto"] : [0, 180]} />
        {rows.length > 0 && <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 8 }} formatter={value => [formatMinutes(Number(value)), "Screen time"]} />}
        <Bar dataKey="minutes" radius={[5, 5, 0, 0]} maxBarSize={38}>{week.map(day => <Cell key={day.key} fill={day.today ? "var(--primary)" : "var(--chart-2)"} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
    {!rows.length && <div className="absolute inset-x-12 top-16 flex flex-col items-center gap-2 bg-card/95 py-5 text-center"><Timer className="h-6 w-6 text-muted-foreground" /><p className="text-sm font-medium">No usage reports yet</p><p className="text-xs text-muted-foreground">Waiting for shared screen time</p></div>}
  </div>;
}