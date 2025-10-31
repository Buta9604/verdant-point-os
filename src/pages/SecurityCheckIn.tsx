import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerByPhone } from "@/hooks/useCustomers";
import { useAddToQueue, useQueue } from "@/hooks/useQueue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Search, UserCheck, AlertTriangle, Calendar, Phone, Mail, Users } from "lucide-react";
import { formatDistance, differenceInYears } from "date-fns";
import { toast } from "sonner";

export default function SecurityCheckIn() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  const { data: customer, isLoading } = useCustomerByPhone(searchPhone);
  const { data: queue } = useQueue();
  const addToQueue = useAddToQueue();

  const handleSearch = () => {
    if (phone.length >= 10) {
      setSearchPhone(phone);
    } else {
      toast.error("Please enter a valid phone number");
    }
  };

  const handleAddToQueue = () => {
    if (!customer) return;
    
    // Check if already in queue
    const inQueue = queue?.some(entry => entry.customer_id === customer.id);
    if (inQueue) {
      toast.error("Customer is already in queue");
      return;
    }

    addToQueue.mutate(
      { customerId: customer.id, notes },
      {
        onSuccess: () => {
          setPhone("");
          setSearchPhone("");
          setNotes("");
        },
      }
    );
  };

  const getAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const isUnderage = customer ? getAge(customer.date_of_birth) < 21 : false;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Security Check-In</h1>
              <p className="text-muted-foreground">Verify ID and add customers to queue</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to POS
          </Button>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Lookup</CardTitle>
            <CardDescription>Search by phone number to verify customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            {customer && (
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                {/* Customer Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={isUnderage ? "destructive" : "default"}>
                        Age: {getAge(customer.date_of_birth)}
                      </Badge>
                      {customer.medical_card_number && (
                        <Badge variant="outline">Medical Patient</Badge>
                      )}
                      <Badge variant="secondary">
                        Loyalty: {customer.loyalty_points} pts
                      </Badge>
                    </div>
                  </div>
                  {isUnderage && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">UNDERAGE</span>
                    </div>
                  )}
                </div>

                {/* Customer Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>DOB: {new Date(customer.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.visit_count} visits</span>
                  </div>
                </div>

                {/* Medical Card Info */}
                {customer.medical_card_number && (
                  <div className="rounded-md bg-primary/5 p-3">
                    <p className="text-sm font-medium">Medical Card: {customer.medical_card_number}</p>
                    {customer.medical_card_expiry && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(customer.medical_card_expiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Customer Notes */}
                {customer.notes && (
                  <div className="rounded-md bg-amber-500/10 p-3">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                      Customer Notes:
                    </p>
                    <p className="mt-1 text-sm">{customer.notes}</p>
                  </div>
                )}

                {/* Check-in Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Check-in Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special notes for the budtender..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Add to Queue Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToQueue}
                  disabled={isUnderage || addToQueue.isPending}
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  {addToQueue.isPending ? "Adding..." : "Add to Queue"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Current Queue</CardTitle>
            <CardDescription>
              {queue?.length || 0} customer{queue?.length !== 1 ? "s" : ""} waiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!queue || queue.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No customers in queue</p>
            ) : (
              <div className="space-y-2">
                {queue.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="h-8 w-8 justify-center rounded-full">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {entry.customers.first_name} {entry.customers.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(new Date(entry.checked_in_at), new Date(), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={entry.status === "IN_SERVICE" ? "default" : "secondary"}
                    >
                      {entry.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
