import { ShoppingBag, User, Wifi, WifiOff, LogOut, Menu } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface POSHeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  isOnline?: boolean;
}

export const POSHeader = ({ cartItemCount, onOpenCart, isOnline = true }: POSHeaderProps) => {
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
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">Green Point</h1>
              <p className="text-xs text-muted-foreground">POS System</p>
            </div>
          </div>

          {/* Sync Status */}
          <Badge
            variant={isOnline ? "secondary" : "destructive"}
            className="gap-1.5 px-2.5 py-1"
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="text-xs">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">Offline</span>
              </>
            )}
          </Badge>
        </div>

        {/* Right: Cart & User */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <Button
            variant="outline"
            size="lg"
            className="relative h-12 px-6 rounded-full font-semibold"
            onClick={onOpenCart}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Cart
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{getUserInfo()}</p>
                  <p className="text-xs text-muted-foreground">Store #001 - Oakland</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
