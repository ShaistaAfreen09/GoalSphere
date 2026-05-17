import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCsv } from "@/lib/export";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { CheckCircle2, Target, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics — GoalSphere" }] }),
});

function pct(g: { actual: number; target: number; uom: string }) {
  if (g.uom === "Zero-based") return g.actual === 0 ? 100 : Math.max(0, 100 - g.actual * 20);
  if (!g.target) return 0;
  return Math.min(100, Math.round((g.actual / g.target) * 100));
}

function Analytics() {
  const { goals, users } = useStore();

  const byPerson = useMemo(() => {
    const employees = users.filter((u) => u.role === "employee");
    return employees.map((u) => {
      const og = goals.filter((g) => g.ownerId === u.id);
      const avg = og.length ? Math.round(og.reduce((s, g) => s + pct(g), 0) / og.length) : 0;
      return { name: u.name.split(" ")[0], progress: avg, goals: og.length };
    });
  }, [goals, users]);

  const byArea = useMemo(() => {
    const m = new Map<string, { c: number; sum: number }>();
    goals.forEach((g) => {
      const e = m.get(g.thrustArea) ?? { c: 0, sum: 0 };
      e.c++; e.sum += pct(g);
      m.set(g.thrustArea, e);
    });
    return Array.from(m, ([name, v]) => ({ name, progress: Math.round(v.sum / v.c) }));
  }, [goals]);

  const trend = [
    { m: "Jan", completion: 12, onTrack: 25 },
    { m: "Feb", completion: 18, onTrack: 32 },
    { m: "Mar", completion: 28, onTrack: 40 },
    { m: "Apr", completion: 36, onTrack: 48 },
    { m: "May", completion: 44, onTrack: 55 },
    { m: "Jun", completion: 52, onTrack: 60 },
  ];

  const completed = goals.filter(g => g.status === "Completed").length;
  const avg = goals.length ? Math.round(goals.reduce((s, g) => s + pct(g), 0) / goals.length) : 0;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Organization-wide completion and performance insights.</p>
        </div>
        <Button variant="outline" onClick={() => exportCsv("analytics.csv", goals)}>
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Employees" value={users.filter(u => u.role === "employee").length} icon={Users} tone="primary" />
        <KpiCard label="Total Goals" value={goals.length} icon={Target} tone="info" />
        <KpiCard label="Avg Completion" value={`${avg}%`} icon={TrendingUp} tone="success" />
        <KpiCard label="Completed Goals" value={completed} icon={CheckCircle2} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Progress by Employee</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <BarChart data={byPerson}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="progress" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Avg %" />
                <Bar dataKey="goals" fill="var(--chart-2)" radius={[6, 6, 0, 0]} name="# Goals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Performance by Thrust Area</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <RadarChart data={byArea}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" />
                <PolarRadiusAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Radar dataKey="progress" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Completion Trend (YTD)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="onTrack" stroke="var(--chart-2)" fill="url(#c2)" name="On Track %" />
                <Area type="monotone" dataKey="completion" stroke="var(--primary)" fill="url(#c1)" name="Completion %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
