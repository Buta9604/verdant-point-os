import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductSearch } from "@/components/ProductSearch";
import { useToast } from "@/hooks/use-toast";

// Sample product data
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Northern Lights",
    category: "Indica",
    thc: 18.5,
    cbd: 0.2,
    price: 45.00,
    stock: 24,
  },
  {
    id: "2",
    name: "Sour Diesel",
    category: "Sativa",
    thc: 22.0,
    cbd: 0.1,
    price: 52.00,
    stock: 15,
  },
  {
    id: "3",
    name: "Blue Dream",
    category: "Hybrid",
    thc: 20.5,
    cbd: 0.3,
    price: 48.00,
    stock: 8,
  },
  {
    id: "4",
    name: "OG Kush",
    category: "Hybrid",
    thc: 24.0,
    cbd: 0.2,
    price: 55.00,
    stock: 32,
  },
  {
    id: "5",
    name: "Girl Scout Cookies",
    category: "Hybrid",
    thc: 21.5,
    cbd: 0.1,
    price: 50.00,
    stock: 0,
  },
  {
    id: "6",
    name: "Jack Herer",
    category: "Sativa",
    thc: 19.0,
    cbd: 0.4,
    price: 46.00,
    stock: 19,
  },
  {
    id: "7",
    name: "Granddaddy Purple",
    category: "Indica",
    thc: 23.5,
    cbd: 0.1,
    price: 54.00,
    stock: 12,
  },
  {
    id: "8",
    name: "Pineapple Express",
    category: "Hybrid",
    thc: 20.0,
    cbd: 0.2,
    price: 47.00,
    stock: 27,
  },
];

const CATEGORIES = ["Indica", "Sativa", "Hybrid", "CBD", "Pre-Rolls", "Edibles"];

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  thc: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const filteredProducts = SAMPLE_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: string) => {
    const product = SAMPLE_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 1,
          thc: product.thc,
        },
      ];
    });

    toast({
      title: "Added to cart",
      description: product.name,
      duration: 2000,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    toast({
      title: "Removed from cart",
      duration: 2000,
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Proceeding to payment...",
    });
    // Checkout flow will be implemented later
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-lg">
              G
            </div>
            <div>
              <h1 className="font-display text-xl font-bold leading-none">
                Green Point POS
              </h1>
              <p className="text-xs text-muted-foreground">Premium Cannabis Retail</p>
            </div>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="relative h-12 px-6 rounded-full border-primary/20 hover:bg-primary/5"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Cart
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Search & Filters */}
        <ProductSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={CATEGORIES}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            {filteredProducts.length} Products
          </h2>
          <div className="text-sm text-muted-foreground">
            Sorted by popularity
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAdd={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-muted-foreground/30 text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;
