import { formatDistance } from "date-fns";
import { Crown, Gift, MessageCircle, Phone, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface LoyaltyCustomer {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  loyalty_points?: number;
  tier?: "VIP" | "Gold" | "Silver" | "Bronze" | string | null;
  last_visit_at?: string | Date | null;
  lifetime_value?: number | null;
  medical_card_number?: string | null;
  marketing_opt_in?: boolean | null;
}

interface LoyaltyPanelProps {
  customer?: LoyaltyCustomer | null;
  onEngage?: (customerId: string) => void;
  onSwapCustomer?: () => void;
  className?: string;
}

const tierConfig: Record<string, { label: string; tone: string }> = {
  VIP: { label: "VIP", tone: "bg-purple-500/15 text-purple-500" },
  Gold: { label: "Gold", tone: "bg-amber-500/15 text-amber-500" },
  Silver: { label: "Silver", tone: "bg-slate-400/20 text-slate-500" },
  Bronze: { label: "Bronze", tone: "bg-orange-400/15 text-orange-500" },
};

export function LoyaltyPanel({ customer, onEngage, onSwapCustomer, className }: LoyaltyPanelProps) {
  const fullName = customer
    ? `${customer.first_name ?? "Guest"} ${customer.last_name ?? ""}`.trim()
    : "Walk-in guest";

  const tier = customer?.tier ?? "Guest";
  const tierStyles = tierConfig[tier] ?? tierConfig.Bronze ?? { label: tier, tone: "bg-muted text-muted-foreground" };

  const lastVisit = customer?.last_visit_at
    ? formatDistance(new Date(customer.last_visit_at), new Date(), { addSuffix: true })
    : "New visitor";

  return (
    <Card className={cn("surface-elevated border-border/40", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg">Customer 360°</CardTitle>
          <Badge className={cn("rounded-full px-3 py-1 text-xs font-semibold", tierStyles.tone)}>
            <Crown className="mr-1.5 h-3.5 w-3.5" /> {tierStyles.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Personalize the experience and boost loyalty</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current customer</p>
              <h3 className="font-display text-xl font-semibold">{fullName}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onSwapCustomer}>
              Swap
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              <span>{customer?.phone ?? "No phone"}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div>Last visit {lastVisit}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Loyalty points</p>
            <p className="font-display text-2xl font-semibold">
              {customer?.loyalty_points?.toLocaleString() ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Redeem 500 for $20 off</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Lifetime spend</p>
            <p className="font-display text-2xl font-semibold">
              ${customer?.lifetime_value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "820"}
            </p>
            <p className="text-[11px] text-muted-foreground">Top 12% of members</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">Suggested perk</p>
              <p className="text-xs text-muted-foreground">
                Complimentary pre-roll for VIP renewal expiring in 4 days.
              </p>
            </div>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Gift className="h-3 w-3" /> Loyalty
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => customer && onEngage?.(customer.id)}>
              Apply reward
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Save for later
            </Button>
          </div>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-amber-400" /> Top strains last visit: Blue Dream, Gelato #33
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-sky-400" /> Notes: Prefers low-sugar edibles, daytime use
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
