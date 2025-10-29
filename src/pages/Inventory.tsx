import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/useInventory";
import { InventoryAdjustDialog } from "@/components/InventoryAdjustDialog";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter, Package, Edit, TrendingDown, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const { data: inventoryData, isLoading } = useInventory();

  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setAdjustDialogOpen(true);
  };

  const inventory = inventoryData?.map(item => ({
    id: item.product?.sku || item.id,
    inventoryId: item.id,
    name: item.product?.name || 'Unknown',
    category: item.product?.category?.name || 'Unknown',
    thc: Number(item.product?.thc_percentage) || 0,
    cbd: Number(item.product?.cbd_percentage) || 0,
    stock: item.quantity,
    price: Number(item.product?.price) || 0,
    batch: item.product?.batch_id || 'N/A',
    lastRestocked: item.last_restock_date,
    supplier: 'N/A',
  })) || [];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
  const lowStockCount = inventory.filter(item => item.stock < 15 && item.stock > 0).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Inventory Management</h1>
              <p className="text-sm text-muted-foreground">Track and manage your product stock</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button className="gap-2" onClick={() => setAddProductDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Product
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
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold font-display mt-1">{inventory.length}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                  <p className="text-2xl font-bold font-display mt-1">${totalValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold font-display mt-1 text-orange-600">{lowStockCount}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold font-display mt-1 text-destructive">{outOfStockCount}</p>
                </div>
                <Package className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Indica">Indica</SelectItem>
                  <SelectItem value="Sativa">Sativa</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="CBD">CBD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">THC %</TableHead>
                  <TableHead className="text-right">CBD %</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.thc}%</TableCell>
                    <TableCell className="text-right">{item.cbd}%</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.stock === 0 ? "destructive" : item.stock < 15 ? "secondary" : "outline"}
                        className="font-mono"
                      >
                        {item.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.batch}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.supplier}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditClick({ 
                          id: item.inventoryId, 
                          product: { name: item.name }, 
                          quantity: item.stock 
                        })}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <InventoryAdjustDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        item={selectedItem}
      />
      
      <ProductFormDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
      />
    </div>
  );
}
