import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductSearch } from "@/components/ProductSearch";
import { POSHeader } from "@/components/POSHeader";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  thc: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: products, isLoading } = useProducts();

  // Extract unique categories from products
  const categories = products 
    ? Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))
    : [];

  const mappedProducts = products?.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category?.name || "Uncategorized",
    thc: Number(p.thc_percentage) || 0,
    cbd: Number(p.cbd_percentage) || 0,
    price: Number(p.price),
    stock: p.inventory?.[0]?.quantity || 0,
  })) || [];

  const filteredProducts = mappedProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: string) => {
    const product = mappedProducts.find((p) => p.id === productId);
    if (!product) return;

    if (product.stock === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently unavailable",
        variant: "destructive",
      });
      return;
    }

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
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    setCartOpen(false);
    navigate("/checkout", { state: { items: cartItems } });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <POSHeader 
        cartItemCount={totalItems}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Search & Filters */}
        <ProductSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

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
        {!isLoading && filteredProducts.length > 0 ? (
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
