import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  thc: number;
  cbd: number;
  price: number;
  stock: number;
  image?: string;
  tags?: string[];
  isTrending?: boolean;
  bundleEligible?: boolean;
  onAdd: (id: string) => void;
  onQuickView?: (id: string) => void;
}

export const ProductCard = ({
  id,
  name,
  category,
  thc,
  cbd,
  price,
  stock,
  image,
  tags,
  isTrending = false,
  bundleEligible = false,
  onAdd,
  onQuickView,
}: ProductCardProps) => {
  const isLowStock = stock < 10;
  const isOutOfStock = stock === 0;

  return (
    <Card
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-200 hover:shadow-xl ${
        isTrending ? "border-primary/40" : "border-border/50"
      } bg-card animate-fade-in`}
    >
      <div className="aspect-square relative overflow-hidden bg-muted/30">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-5xl font-light">
            {name.charAt(0)}
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="rounded-full px-2.5 py-1">
              {category}
            </Badge>
            {isTrending && (
              <Badge className="gap-1 rounded-full bg-primary/15 text-primary">
                <Sparkles className="h-3 w-3" /> Trending
              </Badge>
            )}
            {bundleEligible && (
              <Badge variant="outline" className="rounded-full text-[10px]">
                Bundle
              </Badge>
            )}
          </div>
          <h3 className="font-display text-base font-semibold leading-tight line-clamp-2">
            {name}
          </h3>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full text-[10px]">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-primary">{thc}%</span>
              <span className="text-xs text-muted-foreground">THC</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-baseline gap-1">
              <span className="font-semibold">{cbd}%</span>
              <span className="text-xs text-muted-foreground">CBD</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={() => onQuickView?.(id)}
          >
            View
          </Button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="font-display text-2xl font-bold">
              ${price.toFixed(2)}
            </div>
            <div className={`text-xs ${isLowStock ? "text-destructive" : "text-muted-foreground"}`}>
              {isOutOfStock ? "Out of stock" : `${stock} in stock`}
            </div>
          </div>

          <Button
            size="icon"
            className="h-11 w-11 rounded-full shadow-md"
            onClick={() => onAdd(id)}
            disabled={isOutOfStock}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
