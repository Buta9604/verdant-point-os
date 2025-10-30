import { formatDistance } from "date-fns";
import { Loader2, Clock, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface QueueOrder {
  id: string;
  customerName: string;
  createdAt: string | Date;
  status: string;
  total: number;
  items: number;
  etaMinutes?: number;
}

interface LiveQueueProps {
  orders: QueueOrder[];
  isLoading?: boolean;
  onSelectOrder?: (orderId: string) => void;
  className?: string;
}

const statusVariants: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-500",
  READY: "bg-emerald-500/15 text-emerald-500",
  IN_PROGRESS: "bg-sky-500/15 text-sky-500",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
};

export function LiveQueue({ orders, isLoading = false, onSelectOrder, className }: LiveQueueProps) {
  return (
    <Card className={cn("surface-elevated border-border/40", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg">Live Orders</CardTitle>
          <Badge variant="outline" className="rounded-full text-xs">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[18rem]">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Synchronizing queue
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8" />
              <div>
                <p className="font-medium">Queue is clear</p>
                <p className="text-xs">New orders will appear instantly</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 px-4 pb-4">
              {orders.map((order) => {
                const status = order.status?.toUpperCase?.() ?? "PENDING";
                const statusTone = statusVariants[status] ?? statusVariants.PENDING;
                return (
                  <button
                    key={order.id}
                    onClick={() => onSelectOrder?.(order.id)}
                    className="w-full rounded-2xl border border-border/50 bg-card/60 p-4 text-left transition hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{order.customerName}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {order.items} items · ${order.total.toFixed(2)}
                        </div>
                      </div>
                      <Badge className={cn("rounded-full px-2.5 py-1 text-xs", statusTone)}>
                        {status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                        </span>
                      </div>
                      {order.etaMinutes ? (
                        <span className="font-medium text-primary">
                          ETA {order.etaMinutes} min
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
