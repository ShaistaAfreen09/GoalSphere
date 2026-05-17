import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
}

const TONES = {
  primary: "from-primary/15 to-primary-glow/10 text-primary",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/20 to-warning/5 text-warning",
  info: "from-info/15 to-info/5 text-info",
};

export function KpiCard({ label, value, delta, icon: Icon, tone = "primary" }: Props) {
  return (
    <Card className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
            {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
          </div>
          <div className={cn("h-11 w-11 rounded-xl grid place-items-center bg-gradient-to-br", TONES[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
