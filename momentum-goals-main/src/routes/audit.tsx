import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCsv } from "@/lib/export";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/audit")({
  component: Audit,
  head: () => ({ meta: [{ title: "Audit Logs — GoalSphere" }] }),
});

function Audit() {
  const { audit } = useStore();
  return (
    <div className="space-y-6 max-w-[1300px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Immutable trail of every approval, edit and admin action.</p>
        </div>
        <Button variant="outline" onClick={() => exportCsv("audit-logs.csv", audit)}>
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{new Date(a.at).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{a.actor}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell className="text-muted-foreground">{a.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
