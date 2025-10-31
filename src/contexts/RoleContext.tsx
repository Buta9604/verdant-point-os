import { createContext, useContext, ReactNode } from "react";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

interface RoleContextType {
  roles: UserRole[];
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSecurity: boolean;
  isBudtender: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { data: roles, isLoading } = useUserRole();

  const hasRole = (role: UserRole) => {
    return roles?.includes(role) || false;
  };

  const value: RoleContextType = {
    roles: roles || [],
    isLoading,
    hasRole,
    isAdmin: hasRole('ADMIN'),
    isManager: hasRole('MANAGER') || hasRole('ADMIN'),
    isSecurity: hasRole('SECURITY'),
    isBudtender: hasRole('BUDTENDER'),
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
