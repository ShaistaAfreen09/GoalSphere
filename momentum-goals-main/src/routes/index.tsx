import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle2, Clock, Users, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — GoalSphere" }] }),
});

const STATUS_COLOR: Record<string, string> = {
  "Completed": "bg-success/15 text-success border-success/30",
  "On Track": "bg-info/15 text-info border-info/30",
  "Not Started": "bg-muted text-muted-foreground border-border",
};

function pct(g: { actual: number; target: number; uom: string }) {
  if (g.uom === "Zero-based") return g.actual === 0 ? 100 : Math.max(0, 100 - g.actual * 20);
  if (!g.target) return 0;
  return Math.min(100, Math.round((g.actual / g.target) * 100));
}

function Dashboard() {
  const { role, currentUser, goals } = useStore();

  const myGoals = useMemo(() => goals.filter((g) => g.ownerId === currentUser.id), [goals, currentUser]);
  const teamGoals = useMemo(() => goals, [goals]);
  const scope = role === "employee" ? myGoals : teamGoals;

  const completed = scope.filter((g) => g.status === "Completed").length;
  const onTrack = scope.filter((g) => g.status === "On Track").length;
  const pending = scope.filter((g) => g.approval === "Pending").length;
  const avgPct = scope.length ? Math.round(scope.reduce((s, g) => s + pct(g), 0) / scope.length) : 0;

  const byArea = useMemo(() => {
    const m = new Map<string, number>();
    scope.forEach((g) => m.set(g.thrustArea, (m.get(g.thrustArea) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [scope]);

  const trend = [
    { m: "Jan", progress: 22 }, { m: "Feb", progress: 35 }, { m: "Mar", progress: 48 },
    { m: "Apr", progress: 56 }, { m: "May", progress: 68 }, { m: "Jun", progress: avgPct },
  ];

  const statusData = [
    { name: "Completed", value: scope.filter((g) => g.status === "Completed").length },
    { name: "On Track", value: scope.filter((g) => g.status === "On Track").length },
    { name: "Not Started", value: scope.filter((g) => g.status === "Not Started").length },
  ];
  const PIE = ["var(--chart-2)", "var(--chart-1)", "var(--chart-3)"];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, <span className="gradient-text">{currentUser.name.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === "employee" && "Track your goals, log progress and stay aligned with your manager."}
            {role === "manager" && "Approve goals, run check-ins and monitor your team's performance."}
            {role === "admin" && "Oversee the organization, push shared goals and review analytics."}
          </p>
        </div>
        <Badge variant="outline" className="text-xs uppercase tracking-wider">{role} view</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Goals" value={scope.length} icon={Target} tone="primary" delta={`${scope.filter(g => g.approval === "Approved").length} approved`} />
        <KpiCard label="Avg Progress" value={`${avgPct}%`} icon={TrendingUp} tone="info" delta="vs target" />
        <KpiCard label="Completed" value={completed} icon={CheckCircle2} tone="success" delta="this cycle" />
        <KpiCard
          label={role === "employee" ? "On Track" : "Pending Approval"}
          value={role === "employee" ? onTrack : pending}
          icon={role === "employee" ? Clock : ShieldCheck}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Progress Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="progress" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE[i]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{role === "employee" ? "Your Goals" : "Recent Goals"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {scope.slice(0, 6).map((g) => {
              const p = pct(g);
              return (
                <div key={g.id} className="p-4 rounded-lg border bg-card/50 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{g.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{g.thrustArea}</span>·<span>{g.uom}</span>·<span>W {g.weightage}%</span>
                        {role !== "employee" && <><span>·</span><span>{g.ownerName}</span></>}
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_COLOR[g.status]}>{g.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={p} className="h-2 flex-1" />
                    <span className="text-xs font-medium tabular-nums w-10 text-right">{p}%</span>
                  </div>
                </div>
              );
            })}
            {!scope.length && <p className="text-sm text-muted-foreground py-8 text-center">No goals yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">By Thrust Area</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <BarChart data={byArea} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={10} width={110} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
