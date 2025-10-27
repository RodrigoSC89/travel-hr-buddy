/**
 * PATCH 296: Supply Requests Component
 * Approval workflow with vessel/mission linking
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SupplyRequest {
  id: string;
  request_number: string;
  status: string;
  priority: string;
  category: string;
  items: any[];
  total_estimated_cost: number;
  justification: string;
  created_at: string;
  vessel_id?: string;
  mission_id?: string;
}

export const SupplyRequests = () => {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: '',
    priority: 'normal',
    justification: '',
    items: [{ item_name: '', quantity: 1, unit: '', description: '' }]
  });

  useEffect(() => {
    loadRequests();
    
    const channel = supabase
      .channel('supply_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supply_requests'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error loading supply requests:', error);
      toast({
        title: "Error loading requests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async () => {
    try {
      const { error } = await supabase
        .from('supply_requests')
        .insert({
          category: formData.category,
          priority: formData.priority,
          justification: formData.justification,
          items: formData.items,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✅ Request Created",
        description: "Your supply request has been submitted",
      });

      setShowNewRequest(false);
      setFormData({
        category: '',
        priority: 'normal',
        justification: '',
        items: [{ item_name: '', quantity: 1, unit: '', description: '' }]
      });
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error creating request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('supply_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "✅ Request Approved",
        description: "Supply request has been approved",
      });

      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error approving request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('supply_requests')
        .update({
          status: 'rejected',
          rejection_reason: 'Rejected by user'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Supply request has been rejected",
      });

      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error rejecting request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Supply Requests
              </CardTitle>
              <CardDescription>
                Manage supply requests with approval workflow
              </CardDescription>
            </div>
            <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Supply Request</DialogTitle>
                  <DialogDescription>
                    Submit a new supply request for approval
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parts">Parts</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="fuel">Fuel</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="justification">Justification</Label>
                    <Textarea
                      id="justification"
                      value={formData.justification}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      placeholder="Explain why this supply request is needed..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Items</Label>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                        <Input
                          placeholder="Item name"
                          value={item.item_name}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].item_name = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].quantity = parseInt(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                        <Input
                          placeholder="Unit"
                          value={item.unit}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].unit = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].description = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setFormData({
                        ...formData,
                        items: [...formData.items, { item_name: '', quantity: 1, unit: '', description: '' }]
                      })}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRequest}>
                    Create Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p>Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No supply requests found
              </p>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(request.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-semibold">
                              {request.request_number}
                            </span>
                            {getStatusBadge(request.status)}
                            {getPriorityBadge(request.priority)}
                            <Badge variant="outline">{request.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.justification}
                          </p>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              {request.items?.length || 0} items • Created {format(new Date(request.created_at), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveRequest(request.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectRequest(request.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
