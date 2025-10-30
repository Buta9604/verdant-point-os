import { ReactNode, useMemo } from "react";
import { DollarSign, Gauge, Users, Sparkles, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ShiftOverviewProps {
  stats?: {
    totalRevenue: number;
    avgTransaction: number;
    transactionCount: number;
    uniqueCustomers: number;
  } | null;
  isLoading?: boolean;
  timeWindowLabel?: string;
  shiftLead?: string;
  className?: string;
  actions?: ReactNode;
}

const SHIFT_SALES_TARGET = 15000;

export function ShiftOverview({
  stats,
  isLoading = false,
  timeWindowLabel = "Today",
  shiftLead = "Avery Johnson",
  className,
  actions,
}: ShiftOverviewProps) {
  const data = useMemo(() => {
    if (!stats) {
      return {
        totalRevenue: 0,
        avgTransaction: 0,
        transactionCount: 0,
        uniqueCustomers: 0,
      };
    }

    return stats;
  }, [stats]);

  const revenueProgress = Math.min(100, (data.totalRevenue / SHIFT_SALES_TARGET) * 100);

  const metricCards = [
    {
      title: "Revenue",
      value: `$${data.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      helper: `Goal: $${SHIFT_SALES_TARGET.toLocaleString()}`,
      icon: DollarSign,
      tone: "text-emerald-500",
      badge: `${revenueProgress.toFixed(0)}% of goal`,
    },
    {
      title: "Avg Ticket",
      value: `$${data.avgTransaction.toFixed(2)}`,
      helper: "vs. $68 target",
      icon: Gauge,
      tone: "text-sky-500",
      badge: data.transactionCount > 0 ? `${data.transactionCount} orders` : "No orders",
    },
    {
      title: "Customers",
      value: data.uniqueCustomers,
      helper: "Loyalty conversion 42%",
      icon: Users,
      tone: "text-purple-500",
      badge: `${Math.round((data.uniqueCustomers / Math.max(1, data.transactionCount)) * 100)}% repeat`,
    },
    {
      title: "Budtender CSAT",
      value: "4.9",
      helper: "Based on post-sale survey",
      icon: Sparkles,
      tone: "text-amber-500",
      badge: "Top quartile",
    },
  ];

  return (
    <Card className={cn("surface-elevated border-border/40", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl">Shift Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              {timeWindowLabel} · Shift lead {shiftLead}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              <Timer className="mr-1.5 h-3 w-3" /> Live
            </Badge>
            {actions}
          </div>
        </div>
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Revenue goal progress</span>
            <span>{revenueProgress.toFixed(0)}%</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-2.5 w-full rounded-full" />
          ) : (
            <Progress value={revenueProgress} className="h-2.5" />
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background/60 via-background to-background/80 p-4"
            >
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {metric.title}
                    </div>
                    <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
                      {metric.badge}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between pt-3">
                    <div>
                      <div className="font-display text-2xl font-semibold">
                        {metric.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.helper}</div>
                    </div>
                    <div className={cn("rounded-xl bg-muted/60 p-2", metric.tone)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
