import { useState } from "react";
import { useQueue, useUpdateQueueStatus, QueueEntry } from "@/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Clock, UserCheck, TrendingUp, DollarSign, Package } from "lucide-react";
import { formatDistance } from "date-fns";

interface CustomerQueuePanelProps {
  onSelectCustomer: (customer: QueueEntry) => void;
  selectedCustomerId?: string;
}

export function CustomerQueuePanel({ onSelectCustomer, selectedCustomerId }: CustomerQueuePanelProps) {
  const { data: queue, isLoading } = useQueue();
  const updateStatus = useUpdateQueueStatus();

  const handleSelectCustomer = (entry: QueueEntry) => {
    // Update status to IN_SERVICE
    updateStatus.mutate({ id: entry.id, status: "IN_SERVICE" });
    onSelectCustomer(entry);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Queue
          </CardTitle>
          <Badge variant="outline">
            {queue?.length || 0} waiting
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading queue...
            </div>
          ) : !queue || queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 opacity-50" />
              <p className="font-medium">No customers in queue</p>
              <p className="text-xs">Customers will appear here after check-in</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {queue.map((entry, index) => {
                const customer = entry.customers;
                const isSelected = entry.id === selectedCustomerId;
                const avgOrder = customer.visit_count > 0 
                  ? customer.total_spent / customer.visit_count 
                  : 0;

                return (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectCustomer(entry)}
                    disabled={entry.status === "IN_SERVICE" && !isSelected}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : entry.status === "IN_SERVICE"
                        ? "border-border bg-muted/50 opacity-60"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-7 w-7 justify-center rounded-full text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-semibold">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                      <Badge variant={entry.status === "IN_SERVICE" ? "default" : "secondary"}>
                        {entry.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Customer Stats */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span>{customer.visit_count} visits</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>${avgOrder.toFixed(0)} avg</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{customer.loyalty_points} pts</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-2 rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-600 dark:text-amber-500">
                        Note: {entry.notes}
                      </div>
                    )}

                    {/* Wait Time */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistance(new Date(entry.checked_in_at), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
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
