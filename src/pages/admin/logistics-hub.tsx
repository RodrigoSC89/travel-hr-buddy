// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Package, Plus, CheckCircle, XCircle, Clock, Truck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MaterialRequest {
  id?: string;
  material_name: string;
  quantity: number;
  unit: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "approved" | "rejected" | "delivered";
  requested_by: string;
  approved_by?: string;
  notes?: string;
  estimated_delivery?: string;
  created_at?: string;
}

interface InventoryItem {
  id?: string;
  item_name: string;
  quantity: number;
  unit: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  reorder_level: number;
  location: string;
  last_updated?: string;
}

export default function LogisticsHub() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");

  // Request form state
  const [requestForm, setRequestForm] = useState<MaterialRequest>({
    material_name: "",
    quantity: 0,
    unit: "kg",
    priority: "medium",
    status: "pending",
    requested_by: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRequests(), loadInventory()]);
    } catch (error) {
      logger.error("Failed to load logistics data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("logistics_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setRequests(data || []);
    logger.info("Material requests loaded", { count: data?.length });
  };

  const loadInventory = async () => {
    const { data, error } = await supabase
      .from("logistics_inventory")
      .select("*")
      .order("item_name");

    if (error) throw error;
    setInventory(data || []);
    logger.info("Inventory items loaded", { count: data?.length });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Calculate ETA (simple example: 7 days from now)
      const eta = new Date();
      eta.setDate(eta.getDate() + 7);

      const { error } = await supabase.from("logistics_requests").insert({
        ...requestForm,
        estimated_delivery: eta.toISOString(),
      });

      if (error) throw error;

      toast.success("Material request submitted");
      setRequestForm({
        material_name: "",
        quantity: 0,
        unit: "kg",
        priority: "medium",
        status: "pending",
        requested_by: "",
        notes: "",
      });
      loadRequests();
    } catch (error) {
      logger.error("Failed to submit request", error);
      toast.error("Failed to submit request");
    }
  };

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("logistics_requests")
        .update({
          status: approved ? "approved" : "rejected",
          approved_by: "current_user", // In production, get from auth context
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Request ${approved ? "approved" : "rejected"}`);
      loadRequests();
    } catch (error) {
      logger.error("Failed to update request", error);
      toast.error("Failed to update request");
    }
  };

  const handleDelivered = async (id: string) => {
    try {
      const { error } = await supabase
        .from("logistics_requests")
        .update({ status: "delivered" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Marked as delivered");
      loadRequests();
    } catch (error) {
      logger.error("Failed to update delivery status", error);
      toast.error("Failed to update status");
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-500",
      medium: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "delivered":
        return <Truck className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStockStatusColor = (status: string) => {
    const colors = {
      in_stock: "bg-green-500",
      low_stock: "bg-yellow-500",
      out_of_stock: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const calculateETA = (createdAt: string): number => {
    const created = new Date(createdAt);
    const delivery = new Date(created);
    delivery.setDate(delivery.getDate() + 7); // 7 days delivery time
    
    const now = new Date();
    const daysLeft = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Loading logistics data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics Hub</h1>
        <p className="text-muted-foreground">
          Material requisition and inventory management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">
            <Package className="mr-2 h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="new-request">New Request</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {request.material_name}
                      </CardTitle>
                      <CardDescription>
                        {request.quantity} {request.unit} - Requested by{" "}
                        {request.requested_by}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${getPriorityColor(request.priority)} text-white`}
                    >
                      {request.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold">{request.status}</span>
                    </div>
                    {request.estimated_delivery && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">ETA:</span>
                        <span className="font-semibold">
                          {calculateETA(request.created_at || "")} days
                        </span>
                      </div>
                    )}
                    {request.notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{request.notes}</p>
                      </div>
                    )}
                    
                    {request.status === "pending" && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(request.id!, true)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(request.id!, false)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {request.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleDelivered(request.id!)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No material requests yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.item_name}</CardTitle>
                  <CardDescription>Location: {item.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-semibold">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge
                        className={`${getStockStatusColor(item.stock_status)} text-white`}
                      >
                        {item.stock_status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    {item.quantity <= item.reorder_level && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        ⚠️ Below reorder level ({item.reorder_level} {item.unit})
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {inventory.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No inventory items yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new-request">
          <Card>
            <CardHeader>
              <CardTitle>New Material Request</CardTitle>
              <CardDescription>Submit a new material requisition</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="material_name">Material Name</Label>
                  <Input
                    id="material_name"
                    value={requestForm.material_name}
                    onChange={(e) =>
                      setRequestForm({ ...requestForm, material_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={requestForm.quantity}
                      onChange={(e) =>
                        setRequestForm({
                          ...requestForm,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={requestForm.unit}
                      onValueChange={(value) =>
                        setRequestForm({ ...requestForm, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={requestForm.priority}
                    onValueChange={(value) =>
                      setRequestForm({
                        ...requestForm,
                        priority: value as MaterialRequest["priority"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="requested_by">Requested By</Label>
                  <Input
                    id="requested_by"
                    value={requestForm.requested_by}
                    onChange={(e) =>
                      setRequestForm({ ...requestForm, requested_by: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={requestForm.notes}
                    onChange={(e) =>
                      setRequestForm({ ...requestForm, notes: e.target.value })
                    }
                  />
                </div>

                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
