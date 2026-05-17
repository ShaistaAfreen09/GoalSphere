import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Check, X, Download } from "lucide-react";
import { exportCsv } from "@/lib/export";
import { KpiCard } from "@/components/KpiCard";
import { Target, Users, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/team")({
  component: Team,
  head: () => ({ meta: [{ title: "Team — GoalSphere" }] }),
});

function pct(g: { actual: number; target: number; uom: string }) {
  if (g.uom === "Zero-based") return g.actual === 0 ? 100 : Math.max(0, 100 - g.actual * 20);
  if (!g.target) return 0;
  return Math.min(100, Math.round((g.actual / g.target) * 100));
}

function Team() {
  const { goals, setGoals, users, currentUser, logAudit } = useStore();
  const teamUserIds = useMemo(
    () => users.filter((u) => u.managerId === currentUser.id).map((u) => u.id),
    [users, currentUser],
  );
  const teamGoals = useMemo(() => goals.filter((g) => teamUserIds.includes(g.ownerId)), [goals, teamUserIds]);
  const pending = teamGoals.filter((g) => g.approval === "Pending");
  const [editing, setEditing] = useState<Record<string, { target: number; weightage: number }>>({});

  const approve = (id: string) => {
    const g = goals.find((x) => x.id === id);
    setGoals((prev) => prev.map((x) => x.id === id ? { ...x, approval: "Approved" } : x));
    logAudit("Approved goal", g?.title ?? id);
    toast.success("Goal approved");
  };
  const reject = (id: string) => {
    const g = goals.find((x) => x.id === id);
    setGoals((prev) => prev.map((x) => x.id === id ? { ...x, approval: "Rejected" } : x));
    logAudit("Rejected goal", g?.title ?? id);
    toast.error("Goal rejected");
  };

  const saveEdit = (id: string) => {
    const e = editing[id];
    if (!e) return;
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, target: e.target, weightage: e.weightage } : g));
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
    toast.success("Updated");
  };

  const completed = teamGoals.filter(g => g.status === "Completed").length;
  const avg = teamGoals.length ? Math.round(teamGoals.reduce((s, g) => s + pct(g), 0) / teamGoals.length) : 0;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Approve goals, adjust targets and monitor your reports.</p>
        </div>
        <Button variant="outline" onClick={() => exportCsv("team-goals.csv", teamGoals)}>
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Team Members" value={teamUserIds.length} icon={Users} tone="primary" />
        <KpiCard label="Total Goals" value={teamGoals.length} icon={Target} tone="info" />
        <KpiCard label="Avg Progress" value={`${avg}%`} icon={TrendingUp} tone="success" />
        <KpiCard label="Pending Approval" value={pending.length} icon={ShieldCheck} tone="warning" />
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Pending Approvals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending.map((g) => (
                <div key={g.id} className="p-4 rounded-lg border bg-card flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{g.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {g.ownerName} · {g.thrustArea} · {g.uom} · Target {g.target} · W {g.weightage}%
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => reject(g.id)}>
                      <X className="h-4 w-4 mr-1" />Reject
                    </Button>
                    <Button size="sm" onClick={() => approve(g.id)}>
                      <Check className="h-4 w-4 mr-1" />Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">All Team Goals</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamGoals.map((g) => {
                const p = pct(g);
                const e = editing[g.id];
                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.ownerName}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{g.title}</TableCell>
                    <TableCell className="text-xs">{g.thrustArea}</TableCell>
                    <TableCell>
                      {e ? (
                        <Input type="number" className="w-20 h-8" value={e.target}
                          onChange={(ev) => setEditing({ ...editing, [g.id]: { ...e, target: Number(ev.target.value) } })} />
                      ) : g.target}
                    </TableCell>
                    <TableCell className="tabular-nums">{g.actual}</TableCell>
                    <TableCell>
                      {e ? (
                        <Input type="number" className="w-16 h-8" value={e.weightage}
                          onChange={(ev) => setEditing({ ...editing, [g.id]: { ...e, weightage: Number(ev.target.value) } })} />
                      ) : `${g.weightage}%`}
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <Progress value={p} className="h-1.5" />
                        <span className="text-xs tabular-nums">{p}%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{g.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {e ? (
                        <Button size="sm" variant="secondary" onClick={() => saveEdit(g.id)}>Save</Button>
                      ) : (
                        <Button size="sm" variant="ghost"
                          onClick={() => setEditing({ ...editing, [g.id]: { target: g.target, weightage: g.weightage } })}>
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
