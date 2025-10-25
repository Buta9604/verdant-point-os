import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Gift, CreditCard, Banknote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  thc: number;
}

const paymentMethods = [
  { id: "card", name: "Card", icon: CreditCard },
  { id: "cash", name: "Cash", icon: Banknote },
  { id: "store-credit", name: "Store Credit", icon: Wallet },
];

export default function POSCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const items = (location.state?.items as CartItem[]) || [];
  const [customerPhone, setCustomerPhone] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * appliedDiscount;
  const tax = (subtotal - discount) * 0.15;
  const total = subtotal - discount + tax;
  const earnedPoints = Math.floor(total * 10);

  const handleCustomerLookup = () => {
    if (customerPhone.length >= 10) {
      setLoyaltyPoints(Math.floor(Math.random() * 500) + 100);
      toast({
        title: "Customer found",
        description: `Loyalty points: ${loyaltyPoints}`,
      });
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode.toLowerCase() === "welcome10") {
      setAppliedDiscount(0.1);
      toast({
        title: "Discount applied",
        description: "10% off your purchase",
      });
    } else {
      toast({
        title: "Invalid code",
        description: "Please check your discount code",
        variant: "destructive",
      });
    }
  };

  const handlePayment = () => {
    if (!selectedPayment) {
      toast({
        title: "Select payment method",
        variant: "destructive",
      });
      return;
    }

    // Process payment
    navigate("/receipt", { 
      state: { 
        items, 
        total,
        subtotal,
        tax,
        discount,
        paymentMethod: selectedPayment,
        customerPhone,
        earnedPoints,
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Catalog
          </Button>
          <h1 className="font-display text-xl font-bold">Checkout</h1>
          <div className="w-32" /> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="container max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Customer & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="p-6 surface-elevated">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Customer Information</h2>
                  <p className="text-sm text-muted-foreground">Optional - for loyalty rewards</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-12 mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleCustomerLookup}
                    className="mt-8 h-12 px-6"
                  >
                    Lookup
                  </Button>
                </div>

                {loyaltyPoints > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Available Points</span>
                      </div>
                      <Badge className="text-base px-4 py-1">{loyaltyPoints} pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Will earn {earnedPoints} points from this purchase
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6 surface-elevated">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Payment Method</h2>
                  <p className="text-sm text-muted-foreground">Select how to pay</p>
                </div>
              </div>

              <Tabs value={selectedPayment} onValueChange={setSelectedPayment} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <TabsTrigger key={method.id} value={method.id} className="gap-2">
                        <Icon className="h-4 w-4" />
                        {method.name}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="card" className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Insert, tap, or swipe card to complete payment
                  </p>
                  <div className="p-8 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-semibold">Waiting for card...</p>
                  </div>
                </TabsContent>

                <TabsContent value="cash" className="mt-6 space-y-4">
                  <Label>Amount Received</Label>
                  <Input
                    type="number"
                    placeholder="$0.00"
                    className="text-2xl h-14 text-center"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 50, 100, "Exact"].map((amount) => (
                      <Button key={amount} variant="outline" className="h-12">
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="store-credit" className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Customer store credit balance will be used
                  </p>
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                      <p className="text-3xl font-display font-bold text-primary">$450.00</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <Card className="p-6 surface-elevated sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>

              <ScrollArea className="h-64 mb-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-2">
                      <div className="flex-1">
                        <p className="font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              {/* Discount Code */}
              <div className="space-y-3 mb-4">
                <Label>Discount Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="h-10"
                  />
                  <Button onClick={handleApplyDiscount} variant="outline">
                    Apply
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (15%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-display text-lg font-semibold">Total</span>
                  <span className="font-display text-3xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-full mt-6"
                onClick={handlePayment}
              >
                Complete Payment
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
