import { Plus } from "lucide-react";
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
  onAdd: (id: string) => void;
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
  onAdd,
}: ProductCardProps) => {
  const isLowStock = stock < 10;
  const isOutOfStock = stock === 0;

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border-border/50 bg-card animate-fade-in">
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
        <div>
          <Badge variant="secondary" className="mb-2 text-xs">
            {category}
          </Badge>
          <h3 className="font-display font-semibold text-base leading-tight line-clamp-2">
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-primary">{thc}%</span>
            <span className="text-xs text-muted-foreground">THC</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-baseline gap-1">
            <span className="font-semibold">{cbd}%</span>
            <span className="text-xs text-muted-foreground">CBD</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-2xl font-display font-bold">
              ${price.toFixed(2)}
            </div>
            <div className={`text-xs ${isLowStock ? 'text-destructive' : 'text-muted-foreground'}`}>
              {stock} in stock
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
