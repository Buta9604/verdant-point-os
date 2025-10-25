import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, KeyRound, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "budtender", name: "Budtender", icon: Store, color: "bg-primary" },
  { id: "manager", name: "Manager", icon: KeyRound, color: "bg-accent" },
];

export default function POSLogin() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!selectedRole) {
      toast({
        title: "Select a role",
        description: "Please select your role to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (!pin || pin.length < 4) {
      toast({
        title: "Enter PIN",
        description: "Please enter your 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    // Store user session
    localStorage.setItem("pos_user", JSON.stringify({ role: selectedRole, pin }));
    
    toast({
      title: "Welcome back!",
      description: `Logged in as ${roles.find(r => r.id === selectedRole)?.name}`,
    });
    
    navigate("/");
  };

  const handleBiometric = () => {
    toast({
      title: "Biometric login",
      description: "Feature coming soon",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo/Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-4">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold">Green Point POS</h1>
          <p className="text-muted-foreground">Sign in to start your shift</p>
        </div>

        {/* Role Selection */}
        <Card className="p-6 space-y-6 surface-elevated">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Select Your Role</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${
                      selectedRole === role.id ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="font-semibold text-sm">{role.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-3">
            <Label htmlFor="pin" className="text-sm font-semibold">
              Enter PIN
            </Label>
            <Input
              id="pin"
              type="password"
              placeholder="4-digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest h-14"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-full"
              onClick={handleLogin}
            >
              Sign In
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-full"
              onClick={handleBiometric}
            >
              <Fingerprint className="h-5 w-5 mr-2" />
              Use Biometric
            </Button>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="px-4 py-2">
            Store #001 - Oakland
          </Badge>
          <p className="text-xs text-muted-foreground">
            v1.0.0 • All transactions are encrypted and logged
          </p>
        </div>
      </div>
    </div>
  );
}
