import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Star, Users, TrendingUp, Award } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const customers = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    loyaltyPoints: 2450,
    tier: "Gold",
    totalSpent: 8920,
    visits: 47,
    lastVisit: "2024-01-22",
    preferences: ["Indica", "Pre-Rolls"]
  },
  {
    id: "CUST-002",
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "(555) 234-5678",
    loyaltyPoints: 5680,
    tier: "Platinum",
    totalSpent: 15240,
    visits: 89,
    lastVisit: "2024-01-21",
    preferences: ["Hybrid", "Edibles"]
  },
  {
    id: "CUST-003",
    name: "Mike Roberts",
    email: "mike.r@email.com",
    phone: "(555) 345-6789",
    loyaltyPoints: 890,
    tier: "Silver",
    totalSpent: 2450,
    visits: 12,
    lastVisit: "2024-01-20",
    preferences: ["Sativa"]
  },
  {
    id: "CUST-004",
    name: "Emma Lopez",
    email: "emma.lopez@email.com",
    phone: "(555) 456-7890",
    loyaltyPoints: 3200,
    tier: "Gold",
    totalSpent: 9850,
    visits: 54,
    lastVisit: "2024-01-22",
    preferences: ["CBD", "Tinctures"]
  },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalCustomers = customers.length;
  const averageSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Silver": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Customer Management</h1>
              <p className="text-sm text-muted-foreground">Loyalty programs and customer profiles</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold font-display mt-1">{totalCustomers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Customer Value</p>
                  <p className="text-2xl font-bold font-display mt-1">${averageSpend.toFixed(0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points Issued</p>
                  <p className="text-2xl font-bold font-display mt-1">{totalLoyaltyPoints.toLocaleString()}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold font-display mt-1">
                    {customers.filter(c => c.tier !== "Silver").length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or customer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loyalty Tier</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Preferences</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">{customer.id}</TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{customer.email}</p>
                        <p className="text-muted-foreground">{customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(customer.tier)}>
                        {customer.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                        <span className="font-semibold">{customer.loyaltyPoints}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${customer.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{customer.visits}</TableCell>
                    <TableCell className="text-sm">{customer.lastVisit}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {customer.preferences.map((pref) => (
                          <Badge key={pref} variant="outline" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                      </div>
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
