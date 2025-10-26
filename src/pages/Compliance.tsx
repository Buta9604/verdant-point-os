import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Shield,
  FileCheck
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const manifests = [
  { 
    id: "MAN-2024-001", 
    type: "Transfer", 
    status: "completed", 
    date: "2024-01-20",
    items: 15,
    destination: "Green Valley Farms",
    license: "C11-0000123-LIC"
  },
  { 
    id: "MAN-2024-002", 
    type: "Receipt", 
    status: "pending", 
    date: "2024-01-22",
    items: 8,
    destination: "Sunset Growers",
    license: "C11-0000456-LIC"
  },
  { 
    id: "MAN-2024-003", 
    type: "Destruction", 
    status: "completed", 
    date: "2024-01-18",
    items: 3,
    destination: "N/A",
    license: "N/A"
  },
];

const batches = [
  {
    id: "NL-2024-001",
    product: "Northern Lights",
    quantity: "24 units",
    received: "2024-01-15",
    tested: "2024-01-17",
    status: "approved",
    thc: "18.5%",
    cbd: "0.2%",
    labCert: "LAB-2024-1501"
  },
  {
    id: "SD-2024-003",
    product: "Sour Diesel",
    quantity: "15 units",
    received: "2024-01-18",
    tested: "2024-01-20",
    status: "approved",
    thc: "22.0%",
    cbd: "0.1%",
    labCert: "LAB-2024-1803"
  },
  {
    id: "BD-2024-002",
    product: "Blue Dream",
    quantity: "8 units",
    received: "2024-01-12",
    tested: "pending",
    status: "pending",
    thc: "-",
    cbd: "-",
    labCert: "-"
  },
];

const auditLogs = [
  {
    timestamp: "2024-01-22 14:32",
    user: "Jane Smith",
    action: "Manifest Created",
    details: "Transfer manifest MAN-2024-002",
    level: "info"
  },
  {
    timestamp: "2024-01-22 12:15",
    user: "System",
    action: "Inventory Sync",
    details: "Synced 145 products to state portal",
    level: "info"
  },
  {
    timestamp: "2024-01-21 16:45",
    user: "John Doe",
    action: "Batch Approved",
    details: "Batch NL-2024-001 approved for sale",
    level: "success"
  },
  {
    timestamp: "2024-01-20 09:12",
    user: "System",
    action: "Compliance Alert",
    details: "Low stock warning for GSC-2024-001",
    level: "warning"
  },
];

export default function Compliance() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Compliance & Reporting</h1>
              <p className="text-sm text-muted-foreground">Seed-to-sale tracking and regulatory compliance</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Batches</p>
                  <p className="text-2xl font-bold font-display mt-1">8</p>
                </div>
                <FileCheck className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Manifests</p>
                  <p className="text-2xl font-bold font-display mt-1 text-orange-600">1</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliance Score</p>
                  <p className="text-2xl font-bold font-display mt-1 text-primary">98%</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Audit</p>
                  <p className="text-sm font-medium mt-1">Jan 15, 2024</p>
                  <p className="text-xs text-primary">Passed</p>
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="manifests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="manifests">Manifests</TabsTrigger>
            <TabsTrigger value="batches">Batch Tracking</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Manifests Tab */}
          <TabsContent value="manifests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Transfer Manifests</span>
                  <Button size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    New Manifest
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manifest ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manifests.map((manifest) => (
                      <TableRow key={manifest.id}>
                        <TableCell className="font-mono text-xs">{manifest.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{manifest.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={manifest.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {manifest.status === "completed" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {manifest.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{manifest.date}</TableCell>
                        <TableCell className="text-right">{manifest.items}</TableCell>
                        <TableCell className="text-sm">{manifest.destination}</TableCell>
                        <TableCell className="font-mono text-xs">{manifest.license}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="w-3 h-3" />
                            Export
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle>Batch Tracking & Lab Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Tested</TableHead>
                      <TableHead>THC</TableHead>
                      <TableHead>CBD</TableHead>
                      <TableHead>Lab Cert</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono text-xs">{batch.id}</TableCell>
                        <TableCell className="font-medium">{batch.product}</TableCell>
                        <TableCell>{batch.quantity}</TableCell>
                        <TableCell>{batch.received}</TableCell>
                        <TableCell>{batch.tested}</TableCell>
                        <TableCell className="font-semibold">{batch.thc}</TableCell>
                        <TableCell className="font-semibold">{batch.cbd}</TableCell>
                        <TableCell className="font-mono text-xs">{batch.labCert}</TableCell>
                        <TableCell>
                          <Badge
                            variant={batch.status === "approved" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {batch.status === "approved" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {batch.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">
                        {log.level === "success" && <CheckCircle className="w-5 h-5 text-primary" />}
                        {log.level === "info" && <FileText className="w-5 h-5 text-blue-600" />}
                        {log.level === "warning" && <AlertCircle className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium">{log.action}</p>
                          <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
