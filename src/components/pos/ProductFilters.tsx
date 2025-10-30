import { Fragment, RefObject } from "react";
import { Search, SlidersHorizontal, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  potencyRange: [number, number];
  onPotencyRangeChange: (range: [number, number]) => void;
  stockFilter: "all" | "in-stock" | "low";
  onStockFilterChange: (value: "all" | "in-stock" | "low") => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onResetFilters: () => void;
  searchInputRef?: RefObject<HTMLInputElement>;
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  priceRange,
  onPriceRangeChange,
  potencyRange,
  onPotencyRangeChange,
  stockFilter,
  onStockFilterChange,
  sortOption,
  onSortOptionChange,
  tags,
  selectedTags,
  onToggleTag,
  onResetFilters,
  searchInputRef,
}: ProductFiltersProps) {
  const activeFilters = selectedTags.length + (selectedCategory !== "all" ? 1 : 0) + (stockFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-4 rounded-3xl border border-border/40 bg-card/70 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products, SKU, terpene profile..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-14 rounded-full border-border/50 bg-background/80 pl-12 pr-16"
            ref={searchInputRef}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
              onClick={() => onSearchChange("")}
            >
              ×
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortOption} onValueChange={onSortOptionChange}>
            <SelectTrigger className="h-14 w-[200px] rounded-full border-border/40 bg-background/70">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="thc-desc">Potency: High to Low</SelectItem>
              <SelectItem value="newest">Newest arrivals</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            className="h-14 rounded-full border border-border/40"
            onClick={onResetFilters}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {selectedCategory === "all" ? "All" : selectedCategory}
            </Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="h-10 rounded-full text-xs"
              onClick={() => onCategoryChange("all")}
            >
              All categories
            </Button>
            {categories.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="h-10 rounded-full text-xs"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Price range
            <span className="text-[11px] text-muted-foreground">
              ${priceRange[0]} – ${priceRange[1]}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <Slider
              defaultValue={priceRange}
              min={0}
              max={200}
              step={5}
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange([value[0], value[1]] as [number, number])}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Entry</span>
              <span>Premium</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Potency (THC %)
            <span className="text-[11px] text-muted-foreground">
              {potencyRange[0]}% – {potencyRange[1]}%
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <Slider
              defaultValue={potencyRange}
              min={0}
              max={40}
              step={1}
              value={potencyRange}
              onValueChange={(value) => onPotencyRangeChange([value[0], value[1]] as [number, number])}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Mellow</span>
              <span>Heavy hitter</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Availability
            <Badge variant="outline" className="rounded-full text-[10px]">
              {stockFilter === "all" ? "All" : stockFilter}
            </Badge>
          </div>
          <div className="mt-3">
            <ToggleGroup
              type="single"
              value={stockFilter}
              onValueChange={(value) => value && onStockFilterChange(value as typeof stockFilter)}
              className="grid grid-cols-3 gap-2"
            >
              <ToggleGroupItem value="all" className="rounded-full text-xs">All</ToggleGroupItem>
              <ToggleGroupItem value="in-stock" className="rounded-full text-xs">In stock</ToggleGroupItem>
              <ToggleGroupItem value="low" className="rounded-full text-xs">Low</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Popular filters</span>
          {tags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isActive ? "default" : "secondary"}
                className={cn("cursor-pointer rounded-full px-3 py-1", isActive && "shadow-lg")}
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </Badge>
            );
          })}
          {activeFilters > 0 && (
            <Fragment>
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold text-primary">{activeFilters} active</span>
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
}
