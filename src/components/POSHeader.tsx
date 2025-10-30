import {
  ShoppingBag,
  User,
  Wifi,
  WifiOff,
  LogOut,
  Menu,
  Building,
  Command,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface POSHeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  isOnline?: boolean;
  stores?: { id: string; name: string; status?: string }[];
  activeStoreId?: string;
  onStoreChange?: (storeId: string) => void;
  onOpenCommand?: () => void;
  onNewSale?: () => void;
  queueDepth?: number;
}

export const POSHeader = ({
  cartItemCount,
  onOpenCart,
  isOnline = true,
  stores,
  activeStoreId,
  onStoreChange,
  onOpenCommand,
  onNewSale,
  queueDepth = 0,
}: POSHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem("pos_user");
      if (userData) {
        const { role } = JSON.parse(userData);
        return role.charAt(0).toUpperCase() + role.slice(1);
      }
    } catch (e) {
      // Ignore parse errors
    }
    return "Guest";
  };

  const activeStore = stores?.find((store) => store.id === activeStoreId) ?? stores?.[0];

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">Green Point</h1>
              <p className="text-xs text-muted-foreground">Unified retail OS</p>
            </div>
          </div>

          {stores && stores.length > 0 && activeStore ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden rounded-full border border-border/50 px-4 py-2 text-sm font-medium md:flex">
                  <Building className="mr-2 h-4 w-4" />
                  {activeStore.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Select location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stores.map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    className={cn("flex items-center gap-2", store.id === activeStore.id && "bg-muted")}
                    onClick={() => onStoreChange?.(store.id)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{store.name}</p>
                      {store.status && (
                        <p className="text-xs text-muted-foreground">{store.status}</p>
                      )}
                    </div>
                    {store.id === activeStore.id && (
                      <Badge variant="secondary" className="rounded-full text-[10px]">Active</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Separator orientation="vertical" className="hidden h-6 md:block" />

          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <Badge
              variant={isOnline ? "secondary" : "destructive"}
              className="gap-1.5 px-2.5 py-1"
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Synced</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline mode</span>
                </>
              )}
            </Badge>
            <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
              <UsersRound className="h-3 w-3" /> Queue {queueDepth}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="hidden h-11 items-center gap-2 rounded-full border-border/40 px-4 text-sm font-semibold md:flex"
            onClick={() => onOpenCommand?.()}
          >
            <Command className="h-4 w-4" />
            Command
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">⌘K</span>
          </Button>
          <Button
            variant="secondary"
            className="hidden h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold sm:flex"
            onClick={() => onNewSale?.()}
          >
            <Sparkles className="h-4 w-4" />
            New sale
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="relative h-11 rounded-full px-5 text-sm font-semibold"
            onClick={onOpenCart}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Cart
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full p-0">
                {cartItemCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{getUserInfo()}</p>
                  <p className="text-xs text-muted-foreground">{activeStore ? activeStore.name : "Store"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNewSale?.()}>
                <Sparkles className="mr-2 h-4 w-4" />
                Start new sale
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Menu className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Inventory
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
