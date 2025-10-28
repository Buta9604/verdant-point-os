import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDashboardStats, useTopProducts, useRecentTransactions } from "@/hooks/useAnalytics";
import { useLowStockItems } from "@/hooks/useInventory";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(5);
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(10);
  const { data: lowStockItems, isLoading: lowStockLoading } = useLowStockItems();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back! Here's your store overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Badge variant="outline" className="text-xs px-3 py-1">
                Last synced: 2m ago
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Today's Revenue"
            value={statsLoading ? "..." : `$${stats?.totalRevenue.toFixed(2) || '0.00'}`}
            change="Live data"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-primary"
          />
          <StatsCard
            title="Total Transactions"
            value={statsLoading ? "..." : String(stats?.transactionCount || 0)}
            change="Today"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Avg Transaction"
            value={statsLoading ? "..." : `$${stats?.avgTransaction.toFixed(2) || '0.00'}`}
            change="Today"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-purple-600"
          />
          <StatsCard
            title="Active Customers"
            value={statsLoading ? "..." : String(stats?.uniqueCustomers || 0)}
            change="Today"
            changeType="positive"
            icon={Users}
            iconColor="text-orange-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Top Selling Products</span>
                <Badge variant="secondary" className="font-normal">This Week</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : topProducts && topProducts.length > 0 ? (
                    topProducts.map((product: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{product.sales}</TableCell>
                        <TableCell className="text-right font-semibold">${product.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : lowStockItems && lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product?.category?.name}</p>
                      </div>
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Stock: {item.quantity}</span>
                      <span className={item.quantity === 0 ? "text-destructive font-medium" : "text-orange-600"}>
                        {item.quantity === 0 ? "Out of Stock" : "Low"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">No low stock items</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((txn: any) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">{txn.transaction_number}</TableCell>
                      <TableCell>{txn.customer ? `${txn.customer.first_name} ${txn.customer.last_name}` : 'Guest'}</TableCell>
                      <TableCell className="text-right">{txn.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}</TableCell>
                      <TableCell className="text-right font-semibold">${Number(txn.total).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDistance(new Date(txn.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {txn.payment_status.toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
