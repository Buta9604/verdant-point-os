import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { POSHeader } from "@/components/POSHeader";
import { ShiftOverview } from "@/components/pos/ShiftOverview";
import { CustomerQueuePanel } from "@/components/pos/CustomerQueuePanel";
import { CustomerInsights } from "@/components/pos/CustomerInsights";
import { CartPanel } from "@/components/pos/CartPanel";
import { SmartAssistant } from "@/components/pos/SmartAssistant";
import { ProductFilters } from "@/components/pos/ProductFilters";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useDashboardStats } from "@/hooks/useAnalytics";
import type { CartLineItem } from "@/components/pos/CartPanel";
import type { QueueEntry } from "@/hooks/useQueue";

type StockFilter = "all" | "in-stock" | "low";

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [potencyRange, setPotencyRange] = useState<[number, number]>([0, 35]);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOption, setSortOption] = useState("popularity");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isExpressCheckout, setIsExpressCheckout] = useState(false);
  const [selectedQueueEntry, setSelectedQueueEntry] = useState<QueueEntry | null>(null);
  const stores = useMemo(
    () => [
      { id: "oakland", name: "Oakland Flagship", status: "Open until 10 PM" },
      { id: "berkeley", name: "Berkeley Express", status: "Drive-thru" },
      { id: "santacruz", name: "Santa Cruz Beachfront", status: "Opening soon" },
    ],
    [],
  );
  const [activeStoreId, setActiveStoreId] = useState(() => stores[0]?.id ?? "oakland");
  const activeStore = stores.find((store) => store.id === activeStoreId) ?? stores[0];
  const { toast } = useToast();
  const { data: products, isLoading } = useProducts();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(
    () =>
      products
        ? Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)))
        : [],
    [products],
  );

  const mappedProducts = useMemo(
    () =>
      products?.map((p) => {
        const thc = Number(p.thc_percentage) || 0;
        const cbd = Number(p.cbd_percentage) || 0;
        const price = Number(p.price) || 0;
        const stock = p.inventory?.[0]?.quantity || 0;

        const tags: string[] = [];
        if (thc >= 25) tags.push("High THC");
        if (thc <= 10) tags.push("Low THC");
        if (cbd >= 10) tags.push("CBD Rich");
        if (price >= 80) tags.push("Premium");
        if ((p.category?.name ?? "").toLowerCase().includes("edible")) tags.push("Edible");
        if ((p.category?.name ?? "").toLowerCase().includes("vape")) tags.push("Vape");

        const isTrending = thc >= 28 || (p.inventory?.[0]?.quantity ?? 0) < 12;
        const bundleEligible = (p.category?.name ?? "").toLowerCase().includes("flower");

        return {
          id: p.id,
          name: p.name,
          category: p.category?.name || "Uncategorized",
          thc,
          cbd,
          price,
          stock,
          tags,
          isTrending,
          bundleEligible,
        };
      }) || [],
    [products],
  );

  const tagPool = useMemo(
    () => Array.from(new Set(mappedProducts.flatMap((product) => product.tags ?? []))).slice(0, 8),
    [mappedProducts],
  );

  const filteredProducts = useMemo(() => {
    const base = mappedProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesPotency = product.thc >= potencyRange[0] && product.thc <= potencyRange[1];
      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in-stock"
          ? product.stock > 0
          : product.stock > 0 && product.stock <= 10;
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => product.tags?.includes(tag));

      return matchesSearch && matchesCategory && matchesPrice && matchesPotency && matchesStock && matchesTags;
    });

    const sorted = [...base].sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "thc-desc":
          return b.thc - a.thc;
        case "newest":
          return a.name.localeCompare(b.name);
        default:
          return Number(b.isTrending) - Number(a.isTrending);
      }
    });

    return sorted;
  }, [mappedProducts, searchQuery, selectedCategory, priceRange, potencyRange, stockFilter, selectedTags, sortOption]);

  const handleSelectCustomer = (queueEntry: QueueEntry) => {
    setSelectedQueueEntry(queueEntry);
    toast({
      title: "Customer selected",
      description: `Now serving ${queueEntry.customers.first_name} ${queueEntry.customers.last_name}`,
    });
  };

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

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedTags([]);
    setStockFilter("all");
    setPriceRange([0, 150]);
    setPotencyRange([0, 35]);
    setSortOption("popularity");
  };

  const handleStoreChange = (storeId: string) => {
    if (storeId === activeStoreId) return;
    setActiveStoreId(storeId);
    const nextStore = stores.find((store) => store.id === storeId);
    if (nextStore) {
      toast({
        title: `Switched to ${nextStore.name}`,
        description: "Updating dashboards, taxes, and inventory context",
      });
    }
  };

  const handleCreateSale = () => {
    setCartItems([]);
    setIsExpressCheckout(false);
    toast({
      title: "New sale started",
      description: "Cart cleared and ready for next guest",
    });
  };

  const handleFocusSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        handleCreateSale();
      }
      if (event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setCartOpen(true);
      }
      if (event.key === "/") {
        event.preventDefault();
        handleFocusSearch();
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [handleFocusSearch]);

  const cartLineItems: CartLineItem[] = cartItems.map((item) => ({
    ...item,
  }));

  return (
    <div className="min-h-screen bg-background">
      <POSHeader 
        cartItemCount={totalItems}
        onOpenCart={() => setCartOpen(true)}
        stores={stores}
        activeStoreId={activeStoreId}
        onStoreChange={handleStoreChange}
        onOpenCommand={() => setCommandOpen(true)}
        onNewSale={handleCreateSale}
        queueDepth={0}
      />

      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onCreateSale={handleCreateSale}
        onOpenCart={() => setCartOpen(true)}
        onFocusSearch={handleFocusSearch}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-6">
            <ShiftOverview
              stats={stats}
              isLoading={statsLoading}
              timeWindowLabel={`Today • ${activeStore?.name ?? "Primary"}`}
              shiftLead="Avery Johnson"
            />
            <CustomerQueuePanel 
              onSelectCustomer={handleSelectCustomer}
              selectedCustomerId={selectedQueueEntry?.id}
            />
          </div>

          <div className="flex flex-col gap-6">
            <ProductFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              potencyRange={potencyRange}
              onPotencyRangeChange={setPotencyRange}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              tags={tagPool}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
              onResetFilters={handleResetFilters}
              searchInputRef={searchInputRef}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="rounded-3xl border border-border/40 bg-card/60 p-6">
                <div className="flex items-center justify-between pb-4">
                  <h2 className="font-display text-2xl font-semibold">{filteredProducts.length} products</h2>
                  <p className="text-sm text-muted-foreground">Live inventory synced seconds ago</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      onAdd={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
                <div className="mb-3 text-5xl">🔍</div>
                <h3 className="font-display text-xl font-semibold">No products found</h3>
                <p className="text-sm text-muted-foreground">Adjust filters or try another search keyword.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="hidden xl:block">
              <CartPanel
                items={cartLineItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                isExpressCheckout={isExpressCheckout}
                onToggleExpress={setIsExpressCheckout}
              />
            </div>
            {selectedQueueEntry ? (
              <CustomerInsights customerId={selectedQueueEntry.customer_id} />
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a customer from the queue to view insights
                </p>
              </div>
            )}
            <SmartAssistant
              cartItems={cartItems}
              productCatalog={mappedProducts}
              onAddProduct={handleAddToCart}
            />
          </div>
        </div>
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
