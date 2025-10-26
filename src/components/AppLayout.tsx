import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { POSHeader } from "./POSHeader";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {showHeader && <POSHeader cartItemCount={0} onOpenCart={() => {}} />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
