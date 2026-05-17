import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { THRUST_AREAS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Unlock, Megaphone } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { CheckCircle2, Target, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Admin Console — GoalSphere" }] }),
});

function pct(g: { actual: number; target: number; uom: string }) {
  if (g.uom === "Zero-based") return g.actual === 0 ? 100 : Math.max(0, 100 - g.actual * 20);
  if (!g.target) return 0;
  return Math.min(100, Math.round((g.actual / g.target) * 100));
}

function Admin() {
  const { goals, setGoals, users, logAudit } = useStore();
  const [shared, setShared] = useState({
    title: "Annual Security Training", description: "Complete mandatory security & compliance modules.",
    thrustArea: THRUST_AREAS[5], target: 100, weightage: 10,
  });

  const toggleLock = (id: string) => {
    const g = goals.find((x) => x.id === id);
    setGoals((prev) => prev.map((x) => x.id === id ? { ...x, locked: !x.locked } : x));
    logAudit(g?.locked ? "Unlocked goal" : "Locked goal", g?.title ?? id);
    toast.success(g?.locked ? "Goal unlocked" : "Goal locked");
  };

  const pushShared = () => {
    if (!shared.title.trim()) return toast.error("Title required");
    const employees = users.filter((u) => u.role === "employee");
    const newGoals = employees.map((u) => ({
      id: `g${Date.now()}-${u.id}`, ownerId: u.id, ownerName: u.name,
      title: shared.title, description: shared.description, thrustArea: shared.thrustArea,
      uom: "Percentage" as const, target: shared.target, actual: 0, weightage: shared.weightage,
      status: "Not Started" as const, approval: "Approved" as const, quarter: "Q3" as const,
      comments: [], locked: false, shared: true, createdAt: new Date().toISOString(),
    }));
    setGoals((prev) => [...newGoals, ...prev]);
    logAudit("Pushed shared goal", `${shared.title} → ${employees.length} employees`);
    toast.success(`Pushed to ${employees.length} employees`);
  };

  const completed = goals.filter(g => g.status === "Completed").length;
  const avg = goals.length ? Math.round(goals.reduce((s, g) => s + pct(g), 0) / goals.length) : 0;
  const pending = goals.filter(g => g.approval === "Pending").length;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Push shared goals, unlock entries and oversee the organization.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Goals" value={goals.length} icon={Target} tone="primary" />
        <KpiCard label="Org Progress" value={`${avg}%`} icon={TrendingUp} tone="info" />
        <KpiCard label="Completed" value={completed} icon={CheckCircle2} tone="success" />
        <KpiCard label="Pending" value={pending} icon={ShieldCheck} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4" />Push Shared Goal</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={shared.title} onChange={(e) => setShared({ ...shared, title: e.target.value })} />
          </div>
          <div>
            <Label>Thrust Area</Label>
            <Select value={shared.thrustArea} onValueChange={(v) => setShared({ ...shared, thrustArea: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{THRUST_AREAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={2} value={shared.description} onChange={(e) => setShared({ ...shared, description: e.target.value })} />
          </div>
          <div>
            <Label>Target (%)</Label>
            <Input type="number" value={shared.target} onChange={(e) => setShared({ ...shared, target: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Weightage (%)</Label>
            <Input type="number" value={shared.weightage} onChange={(e) => setShared({ ...shared, weightage: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2">
            <Button onClick={pushShared} className="w-full md:w-auto">
              <Megaphone className="h-4 w-4 mr-2" />Push to all employees
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">All Goals · Lock Management</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Quarter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Locked</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.ownerName}</TableCell>
                  <TableCell className="max-w-[260px] truncate">
                    {g.title} {g.shared && <Badge variant="outline" className="ml-1 text-[10px]">shared</Badge>}
                  </TableCell>
                  <TableCell>{g.quarter}</TableCell>
                  <TableCell><Badge variant="outline">{g.status}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{g.approval}</Badge></TableCell>
                  <TableCell>{g.locked ? <Lock className="h-4 w-4 text-warning" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={g.locked ? "default" : "outline"} onClick={() => toggleLock(g.id)}>
                      {g.locked ? "Unlock" : "Lock"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
