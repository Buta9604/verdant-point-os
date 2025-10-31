import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { formatDistance } from "date-fns";

interface CustomerInsightsProps {
  customerId: string;
}

export function CustomerInsights({ customerId }: CustomerInsightsProps) {
  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["customer-transactions", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          transaction_items (
            *,
            products (name, category_id)
          )
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading customer insights...</p>
        </CardContent>
      </Card>
    );
  }

  const avgOrderValue = customer.visit_count > 0 ? customer.total_spent / customer.visit_count : 0;
  const loyaltyTier =
    customer.loyalty_points >= 1000
      ? "Gold"
      : customer.loyalty_points >= 500
      ? "Silver"
      : "Bronze";

  return (
    <div className="space-y-4">
      {/* Customer Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {customer.first_name} {customer.last_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{customer.email || customer.phone}</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              {loyaltyTier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShoppingBag className="h-3 w-3" />
                <span>Total Visits</span>
              </div>
              <p className="text-2xl font-bold">{customer.visit_count}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>Total Spent</span>
              </div>
              <p className="text-2xl font-bold">${customer.total_spent.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Avg Order</span>
              </div>
              <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>Loyalty Points</span>
              </div>
              <p className="text-2xl font-bold">{customer.loyalty_points}</p>
            </div>
          </div>

          {customer.notes && (
            <>
              <Separator className="my-4" />
              <div className="rounded-lg bg-amber-500/10 p-3">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-500">
                  Customer Notes:
                </p>
                <p className="mt-1 text-sm">{customer.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {!recentTransactions || recentTransactions.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No recent transactions
              </p>
            ) : (
              <div className="space-y-2 p-4">
                {recentTransactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">${transaction.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.transaction_items?.length || 0} items •{" "}
                          {transaction.payment_method}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistance(new Date(transaction.created_at), new Date(), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    {transaction.transaction_items && transaction.transaction_items.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {transaction.transaction_items.slice(0, 3).map((item: any) => (
                          <Badge key={item.id} variant="secondary" className="text-xs">
                            {item.products?.name}
                          </Badge>
                        ))}
                        {transaction.transaction_items.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{transaction.transaction_items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
