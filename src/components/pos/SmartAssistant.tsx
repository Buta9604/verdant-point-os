import { useMemo } from "react";
import { Bot, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AssistantProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  thc: number;
  cbd?: number;
  stock?: number;
}

interface AssistantCartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  thc?: number;
}

interface SmartAssistantProps {
  cartItems: AssistantCartItem[];
  productCatalog: AssistantProduct[];
  onAddProduct?: (productId: string) => void;
  className?: string;
}

export function SmartAssistant({ cartItems, productCatalog, onAddProduct, className }: SmartAssistantProps) {
  const topCategory = useMemo(() => {
    if (!cartItems.length) return null;
    const counts = cartItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.quantity;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [cartItems]);

  const recommendations = useMemo(() => {
    if (!topCategory) {
      return productCatalog.slice(0, 3);
    }

    const related = productCatalog
      .filter((product) => product.category === topCategory && !cartItems.some((item) => item.id === product.id))
      .slice(0, 2);

    const premium = productCatalog
      .filter((product) => product.thc > 25 && product.category !== topCategory)
      .slice(0, 1);

    return [...related, ...premium];
  }, [productCatalog, topCategory, cartItems]);

  const complianceAlerts = useMemo(() => {
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const highPotency = cartItems.some((item) => (item.thc ?? 0) > 30);
    const alerts: string[] = [];
    if (totalQuantity >= 8) {
      alerts.push("Patient daily purchase limit reached");
    }
    if (highPotency) {
      alerts.push("Confirm high-potency consent on file");
    }
    return alerts;
  }, [cartItems]);

  return (
    <Card className={cn("surface-elevated border-border/40", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg">Budtender Co-Pilot</CardTitle>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Bot className="h-3.5 w-3.5" /> AI assist
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Context-aware upsells, compliance checks, and conversational cues
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            {topCategory ? `Boost ${topCategory.toLowerCase()} basket value` : "Build the perfect first basket"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {topCategory
              ? "Guests buying flower often add a calming edible. Pitch the Triple Berry gummies for a curated experience."
              : "Start with a best-selling combo or use the command menu to jump to any SKU."}
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Smart upsells</div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add items to unlock tailored recommendations.</p>
          ) : (
            recommendations.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/60 p-3"
              >
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.category} · {product.thc}% THC · ${product.price.toFixed(2)}
                  </div>
                </div>
                <Button size="sm" onClick={() => onAddProduct?.(product.id)}>
                  Add
                </Button>
              </div>
            ))
          )}
        </div>

        <Separator />

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Attach budtender note: "Looking for a balanced daytime effect"
          </div>
          {complianceAlerts.length > 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-500">
                <ShieldCheck className="h-3.5 w-3.5" /> Compliance alerts
              </div>
              <ul className="mt-2 space-y-1 text-[11px] text-amber-500">
                {complianceAlerts.map((alert) => (
                  <li key={alert}>• {alert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
