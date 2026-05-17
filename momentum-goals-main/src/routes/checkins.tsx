import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MessageSquarePlus } from "lucide-react";

export const Route = createFileRoute("/checkins")({
  component: CheckIns,
  head: () => ({ meta: [{ title: "Check-ins — GoalSphere" }] }),
});

function pct(g: { actual: number; target: number; uom: string }) {
  if (g.uom === "Zero-based") return g.actual === 0 ? 100 : Math.max(0, 100 - g.actual * 20);
  if (!g.target) return 0;
  return Math.min(100, Math.round((g.actual / g.target) * 100));
}

function CheckIns() {
  const { goals, setGoals, currentUser, role, users } = useStore();
  const teamIds = users.filter((u) => u.managerId === currentUser.id).map((u) => u.id);
  const scope = role === "employee"
    ? goals.filter((g) => g.ownerId === currentUser.id)
    : goals.filter((g) => teamIds.includes(g.ownerId));

  const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
  const [active, setActive] = useState<typeof quarters[number]>("Q2");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const addComment = (id: string) => {
    const text = drafts[id]?.trim();
    if (!text) return;
    setGoals((prev) => prev.map((g) => g.id === id
      ? { ...g, comments: [...g.comments, { author: currentUser.name, text, at: new Date().toISOString() }] }
      : g));
    setDrafts((d) => ({ ...d, [id]: "" }));
    toast.success("Comment added");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Quarterly Check-ins</h1>
        <p className="text-muted-foreground mt-1">Review progress and capture feedback every quarter.</p>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as typeof active)}>
        <TabsList>
          {quarters.map((q) => <TabsTrigger key={q} value={q}>{q}</TabsTrigger>)}
        </TabsList>
        {quarters.map((q) => (
          <TabsContent key={q} value={q} className="mt-6 space-y-4">
            {scope.filter((g) => g.quarter === q).map((g) => {
              const p = pct(g);
              return (
                <Card key={g.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle className="text-base">{g.title}</CardTitle>
                        <div className="text-xs text-muted-foreground mt-1">{g.ownerName} · {g.thrustArea}</div>
                      </div>
                      <Badge variant="outline">{g.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Progress value={p} className="h-2 flex-1" />
                      <span className="text-sm font-medium tabular-nums w-12 text-right">{p}%</span>
                    </div>
                    <div className="space-y-2">
                      {g.comments.map((c, i) => (
                        <div key={i} className="text-sm bg-muted/40 rounded-lg p-3">
                          <div className="font-medium text-xs text-muted-foreground mb-1">
                            {c.author} · {new Date(c.at).toLocaleDateString()}
                          </div>
                          {c.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        rows={2} placeholder="Add a check-in comment or feedback…"
                        value={drafts[g.id] ?? ""}
                        onChange={(e) => setDrafts({ ...drafts, [g.id]: e.target.value })}
                      />
                      <Button onClick={() => addComment(g.id)} className="self-end">
                        <MessageSquarePlus className="h-4 w-4 mr-2" />Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!scope.filter((g) => g.quarter === q).length && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No goals in {q}.</CardContent></Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
