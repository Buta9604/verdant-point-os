import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
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

const topProducts = [
  { name: "Northern Lights", category: "Indica", sales: 142, revenue: "$6,390", stock: 24 },
  { name: "Blue Dream", category: "Hybrid", sales: 128, revenue: "$6,144", stock: 8 },
  { name: "OG Kush", category: "Hybrid", sales: 115, revenue: "$6,325", stock: 32 },
  { name: "Sour Diesel", category: "Sativa", sales: 98, revenue: "$5,096", stock: 15 },
  { name: "Jack Herer", category: "Sativa", sales: 87, revenue: "$4,002", stock: 19 },
];

const recentTransactions = [
  { id: "TXN-1234", customer: "John D.", items: 3, total: "$156.00", time: "2m ago", status: "completed" },
  { id: "TXN-1233", customer: "Sarah M.", items: 2, total: "$98.50", time: "12m ago", status: "completed" },
  { id: "TXN-1232", customer: "Mike R.", items: 5, total: "$287.00", time: "28m ago", status: "completed" },
  { id: "TXN-1231", customer: "Emma L.", items: 1, total: "$52.00", time: "45m ago", status: "completed" },
];

const lowStockItems = [
  { name: "Blue Dream", stock: 8, threshold: 15, category: "Hybrid" },
  { name: "Girl Scout Cookies", stock: 0, threshold: 10, category: "Hybrid" },
  { name: "Granddaddy Purple", stock: 12, threshold: 20, category: "Indica" },
];

export default function Dashboard() {
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
            value="$12,845"
            change="+12.5% from yesterday"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-primary"
          />
          <StatsCard
            title="Total Transactions"
            value="247"
            change="+8.2% from yesterday"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Avg Transaction"
            value="$52.01"
            change="-3.1% from yesterday"
            changeType="negative"
            icon={TrendingUp}
            iconColor="text-purple-600"
          />
          <StatsCard
            title="Active Customers"
            value="1,428"
            change="+5.4% this week"
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
                  {topProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{product.sales}</TableCell>
                      <TableCell className="text-right font-semibold">{product.revenue}</TableCell>
                      <TableCell className="text-right">
                        <span className={product.stock < 10 ? "text-destructive font-medium" : ""}>
                          {product.stock}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
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
              {lowStockItems.map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Stock: {item.stock}</span>
                    <span className={item.stock === 0 ? "text-destructive font-medium" : "text-orange-600"}>
                      {item.stock === 0 ? "Out of Stock" : "Low"}
                    </span>
                  </div>
                </div>
              ))}
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
                {recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell>{txn.customer}</TableCell>
                    <TableCell className="text-right">{txn.items}</TableCell>
                    <TableCell className="text-right font-semibold">{txn.total}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{txn.time}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
