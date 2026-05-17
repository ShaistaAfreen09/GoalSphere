import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Goal, UoM, GoalStatus } from "@/lib/mock-data";
import { THRUST_AREAS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, Download, Lock } from "lucide-react";
import { exportCsv } from "@/lib/export";

export const Route = createFileRoute("/goals")({
  component: MyGoals,
  head: () => ({ meta: [{ title: "My Goals — GoalSphere" }] }),
});

const UOMS: UoM[] = ["Numeric", "Percentage", "Timeline", "Zero-based"];
const STATUSES: GoalStatus[] = ["Not Started", "On Track", "Completed"];

function progressPct(g: Goal) {
  if (g.uom === "Zero-based") return g.actual === 0 ? 100 : Math.max(0, 100 - g.actual * 20);
  if (!g.target) return 0;
  return Math.min(100, Math.round((g.actual / g.target) * 100));
}

function MyGoals() {
  const { currentUser, goals, setGoals, logAudit } = useStore();
  const mine = useMemo(() => goals.filter((g) => g.ownerId === currentUser.id), [goals, currentUser]);
  const totalWeight = mine.reduce((s, g) => s + g.weightage, 0);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", thrustArea: THRUST_AREAS[0],
    uom: "Numeric" as UoM, target: 0, weightage: 10, quarter: "Q2" as Goal["quarter"],
  });

  const handleCreate = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.weightage < 10) return toast.error("Minimum 10% weightage per goal");
    if (mine.length >= 8) return toast.error("Maximum 8 goals allowed");
    if (totalWeight + form.weightage > 100) return toast.error(`Weightage exceeds 100% (current ${totalWeight}%)`);

    const g: Goal = {
      id: `g${Date.now()}`, ownerId: currentUser.id, ownerName: currentUser.name,
      title: form.title, description: form.description, thrustArea: form.thrustArea,
      uom: form.uom, target: Number(form.target), actual: 0, weightage: Number(form.weightage),
      status: "Not Started", approval: "Draft", quarter: form.quarter,
      comments: [], locked: false, createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [g, ...prev]);
    logAudit("Created goal", g.title);
    toast.success("Goal created");
    setOpen(false);
    setForm({ ...form, title: "", description: "", target: 0, weightage: 10 });
  };

  const submitAll = () => {
    if (totalWeight !== 100) return toast.error(`Total weightage must equal 100% (currently ${totalWeight}%)`);
    setGoals((prev) => prev.map((g) => g.ownerId === currentUser.id && g.approval === "Draft" ? { ...g, approval: "Pending" } : g));
    logAudit("Submitted goals for approval", `${mine.length} goals`);
    toast.success("Goals submitted for approval");
  };

  const updateActual = (id: string, actual: number) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== id) return g;
      const p = progressPct({ ...g, actual });
      const status: GoalStatus = p >= 100 ? "Completed" : p > 0 ? "On Track" : "Not Started";
      return { ...g, actual, status };
    }));
  };

  const setStatus = (id: string, status: GoalStatus) => {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Goals</h1>
          <p className="text-muted-foreground mt-1">Create, manage and update your quarterly goals.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportCsv("my-goals.csv", mine)}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Button onClick={submitAll} variant="secondary">
            <Send className="h-4 w-4 mr-2" />Submit for Approval
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Goal</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Goal</DialogTitle>
                <DialogDescription>Add details for a new quarterly goal.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Launch onboarding revamp" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Thrust Area</Label>
                    <Select value={form.thrustArea} onValueChange={(v) => setForm({ ...form, thrustArea: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{THRUST_AREAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>UoM</Label>
                    <Select value={form.uom} onValueChange={(v) => setForm({ ...form, uom: v as UoM })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{UOMS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target</Label>
                    <Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Weightage (%)</Label>
                    <Input type="number" min={10} max={100} value={form.weightage} onChange={(e) => setForm({ ...form, weightage: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Quarter</Label>
                    <Select value={form.quarter} onValueChange={(v) => setForm({ ...form, quarter: v as Goal["quarter"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Q1","Q2","Q3","Q4"].map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Current total weightage: <span className="font-semibold text-foreground">{totalWeight}%</span> · Max 8 goals · Total must equal 100%.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase">Total Weightage</div>
            <div className={`text-2xl font-semibold ${totalWeight === 100 ? "text-success" : totalWeight > 100 ? "text-destructive" : ""}`}>{totalWeight}%</div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Progress value={Math.min(100, totalWeight)} className="h-2" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase">Goals</div>
            <div className="text-2xl font-semibold">{mine.length}<span className="text-muted-foreground text-sm">/8</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {mine.map((g) => {
          const p = progressPct(g);
          return (
            <Card key={g.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {g.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {g.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{g.quarter}</Badge>
                    <Badge variant="outline">{g.thrustArea}</Badge>
                    <Badge variant="outline">{g.uom}</Badge>
                    <Badge variant={g.approval === "Approved" ? "default" : g.approval === "Rejected" ? "destructive" : "secondary"}>
                      {g.approval}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <Label className="text-xs">Target</Label>
                    <div className="text-lg font-semibold tabular-nums">{g.target}</div>
                  </div>
                  <div>
                    <Label className="text-xs">Actual</Label>
                    <Input
                      type="number" value={g.actual} disabled={g.locked}
                      onChange={(e) => updateActual(g.id, Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weightage</Label>
                    <div className="text-lg font-semibold tabular-nums">{g.weightage}%</div>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={g.status} onValueChange={(v) => setStatus(g.id, v as GoalStatus)} disabled={g.locked}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Progress</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={p} className="h-2 flex-1" />
                      <span className="text-sm font-medium tabular-nums w-10 text-right">{p}%</span>
                    </div>
                  </div>
                </div>
                {g.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {g.comments.map((c, i) => (
                      <div key={i} className="text-sm bg-muted/40 rounded-lg p-3">
                        <span className="font-medium">{c.author}:</span> {c.text}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!mine.length && (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No goals yet. Create your first one.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
