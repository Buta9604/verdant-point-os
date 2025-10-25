import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Printer, Mail, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  thc: number;
}

export default function POSReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const {
    items = [],
    total = 0,
    subtotal = 0,
    tax = 0,
    discount = 0,
    paymentMethod = "card",
    customerPhone = "",
    earnedPoints = 0,
  } = location.state || {};

  const transactionId = `TXN${Date.now().toString().slice(-8)}`;
  const timestamp = new Date().toLocaleString();

  const handlePrint = () => {
    toast({
      title: "Printing receipt",
      description: "Sending to default printer...",
    });
    // Implement print functionality
  };

  const handleEmail = () => {
    toast({
      title: "Email sent",
      description: "Receipt sent to customer email",
    });
  };

  const handleNewTransaction = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold">Payment Complete</h1>
          <p className="text-muted-foreground text-lg">
            Transaction processed successfully
          </p>
        </div>

        {/* Receipt Card */}
        <Card className="p-8 surface-elevated">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-2">Green Point POS</h2>
            <p className="text-sm text-muted-foreground">Store #001 - Oakland, CA</p>
            <p className="text-sm text-muted-foreground">123 Main Street • (555) 123-4567</p>
          </div>

          <Separator className="mb-6" />

          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-mono font-semibold">{transactionId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-semibold">{timestamp}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-semibold capitalize">{paymentMethod}</p>
            </div>
            {customerPhone && (
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-semibold">{customerPhone}</p>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Items */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground">ITEMS PURCHASED</h3>
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-primary">
                      {item.thc}% THC
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="mb-6" />

          {/* Totals */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (15%)</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <span className="font-display text-xl font-semibold">Total Paid</span>
              <span className="font-display text-3xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Loyalty Points */}
          {earnedPoints > 0 && (
            <>
              <Separator className="mb-6" />
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">Loyalty Points Earned</p>
                <p className="text-2xl font-display font-bold text-primary">
                  +{earnedPoints} points
                </p>
              </div>
            </>
          )}

          {/* Legal */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground">
              Thank you for your purchase. For use only by adults 21+.
              <br />
              Please consume responsibly. All sales are final.
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-5 w-5" />
            Print Receipt
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 gap-2"
            onClick={handleEmail}
          >
            <Mail className="h-5 w-5" />
            Email Receipt
          </Button>
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-full gap-2"
          onClick={handleNewTransaction}
        >
          <Home className="h-5 w-5" />
          New Transaction
        </Button>
      </div>
    </div>
  );
}
