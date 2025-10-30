import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
  CommandShortcut,
} from "@/components/ui/command";
import { ShoppingBag, LayoutDashboard, Package, Users, FileText, Settings, PlusCircle } from "lucide-react";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSale?: () => void;
  onOpenCart?: () => void;
  onFocusSearch?: () => void;
}

const navigationItems = [
  { label: "POS Terminal", icon: ShoppingBag, path: "/" },
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Inventory", icon: Package, path: "/inventory" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Compliance", icon: FileText, path: "/compliance" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function CommandMenu({ open, onOpenChange, onCreateSale, onOpenCart, onFocusSearch }: CommandMenuProps) {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="What do you need?" autoFocus className="text-base" />
      <CommandList>
        <CommandEmpty>Nothing matched that query.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem key={item.path} onSelect={() => handleNavigate(item.path)}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="POS actions">
          <CommandItem
            onSelect={() => {
              onCreateSale?.();
              onOpenChange(false);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New walk-in sale
            <CommandShortcut>Shift + N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenCart?.();
              onOpenChange(false);
            }}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Open cart
            <CommandShortcut>Shift + C</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onFocusSearch?.();
              onOpenChange(false);
            }}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Focus product search
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
