import { Minus, Plus, Trash2, Receipt, CreditCard, Smartphone, PiggyBank } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface CartLineItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  thc?: number;
}

interface CartPanelProps {
  items: CartLineItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  isExpressCheckout?: boolean;
  onToggleExpress?: (value: boolean) => void;
  className?: string;
}

const TAX_RATE = 0.15;
const LOYALTY_REDEMPTION_RATE = 0.02;

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isExpressCheckout = false,
  onToggleExpress,
  className,
}: CartPanelProps) {
  const { subtotal, tax, total, loyaltySavings } = useMemo(() => {
    const subtotalValue = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxValue = subtotalValue * TAX_RATE;
    const loyaltyValue = subtotalValue * LOYALTY_REDEMPTION_RATE;
    const totalValue = subtotalValue + taxValue - loyaltyValue;
    return {
      subtotal: subtotalValue,
      tax: taxValue,
      loyaltySavings: loyaltyValue,
      total: totalValue,
    };
  }, [items]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Card className={cn("surface-elevated border-border/40 flex h-full flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-display text-lg">Active Cart</CardTitle>
            <p className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"} · synced to budtender tablet</p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            <Receipt className="mr-1.5 h-3.5 w-3.5" /> #{String(Date.now()).slice(-4)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Express checkout</span>
            <Switch checked={isExpressCheckout} onCheckedChange={(value) => onToggleExpress?.(value)} />
            <Badge variant="outline" className="rounded-full text-[10px]">scans IDs &amp; payment link</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3 pb-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Add products from the catalog to build an order. Smart upsells and compliance checks appear here.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold leading-tight">{item.name}</h3>
                        <Badge variant="outline" className="rounded-full text-[10px]">{item.category}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.thc !== undefined ? `${item.thc}% THC · ` : ""}${item.price.toLocaleString(undefined, { style: "currency", currency: "USD" })} each
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Eligible for bundle savings</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3 border-t border-border/60 px-6 py-5">
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Excise &amp; tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-500">
              <span>Loyalty savings</span>
              <span>- ${loyaltySavings.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="font-display text-lg">Amount due</span>
              <span className="font-display text-2xl font-semibold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <Button variant="outline" className="h-10 gap-2">
              <CreditCard className="h-4 w-4" /> Card
            </Button>
            <Button variant="outline" className="h-10 gap-2">
              <Smartphone className="h-4 w-4" /> Tap to pay
            </Button>
            <Button variant="outline" className="h-10 gap-2">
              <PiggyBank className="h-4 w-4" /> Cash
            </Button>
          </div>

          <Button
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold"
            onClick={onCheckout}
            disabled={items.length === 0}
          >
            Complete sale
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
