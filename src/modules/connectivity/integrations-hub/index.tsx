// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Link2, 
  Webhook, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  Settings
} from "lucide-react";
import { CreateIntegrationDialog } from "./components/CreateIntegrationDialog";
import { IntegrationCard } from "./components/IntegrationCard";
import { IntegrationLogs } from "./components/IntegrationLogs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  config?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const IntegrationsHub = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("integrations_registry")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIntegration = async (integrationData: any) => {
    try {
      const { data, error } = await supabase
        .from("integrations_registry")
        .insert([integrationData])
        .select()
        .single();

      if (error) throw error;

      setIntegrations([data, ...integrations]);
      setShowCreateDialog(false);
      
      toast({
        title: "Integration created",
        description: "Your integration has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating integration",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleIntegration = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("integrations_registry")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      setIntegrations(integrations.map(int => 
        int.id === id ? { ...int, is_active: isActive } : int
      ));

      toast({
        title: isActive ? "Integration activated" : "Integration deactivated",
        description: `Integration has been ${isActive ? "activated" : "deactivated"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating integration",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("integrations_registry")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setIntegrations(integrations.filter(int => int.id !== id));
      
      toast({
        title: "Integration deleted",
        description: "Integration has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting integration",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: integrations.length,
    active: integrations.filter(i => i.is_active).length,
    oauth: integrations.filter(i => i.type === "oauth2").length,
    webhook: integrations.filter(i => i.type === "webhook").length,
  };

  const filteredIntegrations = integrations.filter(int => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return int.is_active;
    if (activeTab === "inactive") return !int.is_active;
    return int.type === activeTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations Hub</h1>
          <p className="text-muted-foreground mt-1">
            Manage OAuth connections, webhooks, and API integrations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Integration
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">OAuth Connections</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.oauth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.webhook}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="oauth2">OAuth</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading integrations...</p>
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first integration
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={handleToggleIntegration}
                  onDelete={handleDeleteIntegration}
                  onRefresh={loadIntegrations}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            View recent integration events and webhook deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationLogs />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateIntegrationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateIntegration}
      />
    </div>
  );
};

export default IntegrationsHub;
