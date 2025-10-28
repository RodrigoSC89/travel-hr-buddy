import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  RefreshCw, 
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target
} from 'lucide-react';
import { usePriceAlerts, usePriceNotifications } from '@/hooks/use-price-alerts';
import { PriceAlertsTable } from './price-alerts-table';
import { AlertForm } from './alert-form';
import { NotificationsPanel } from './notifications-panel';
import { PriceAlert, CreatePriceAlertInput, UpdatePriceAlertInput } from '@/services/price-alerts-service';

export const PriceAlertsDashboard: React.FC = () => {
  const {
    alerts,
    loading: alertsLoading,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    refreshAlerts,
  } = usePriceAlerts();

  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = usePriceNotifications();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [viewingAlert, setViewingAlert] = useState<PriceAlert | null>(null);

  // Calculate statistics
  const activeAlerts = alerts.filter((a) => a.is_active).length;
  const alertsTriggered = alerts.filter(
    (a) => a.current_price && a.current_price <= a.target_price
  ).length;
  const potentialSavings = alerts
    .filter((a) => a.current_price && a.current_price < a.target_price)
    .reduce((sum, a) => sum + (a.target_price - (a.current_price || 0)), 0);

  const handleCreateAlert = async (data: CreatePriceAlertInput) => {
    await createAlert(data);
  };

  const handleUpdateAlert = async (data: UpdatePriceAlertInput) => {
    if (editingAlert) {
      await updateAlert(editingAlert.id, data);
      setEditingAlert(null);
    }
  };

  const handleEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
  };

  const handleViewAlert = (alert: PriceAlert) => {
    setViewingAlert(alert);
  };

  const handleRefresh = async () => {
    await refreshAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.length} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts Triggered</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsTriggered}</div>
            <p className="text-xs text-muted-foreground">
              Target price reached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${potentialSavings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Below target price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => !n.is_read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {notifications.length} total notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price Alerts Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage price alerts for travel services
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={alertsLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="alerts">
                <Target className="w-4 h-4 mr-2" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notifications.filter((n) => !n.is_read).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts">
              {alertsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <PriceAlertsTable
                  alerts={alerts}
                  onToggle={toggleAlert}
                  onEdit={handleEditAlert}
                  onDelete={deleteAlert}
                  onView={handleViewAlert}
                />
              )}
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsPanel
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                loading={notificationsLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <AlertForm
        open={showCreateDialog || !!editingAlert}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingAlert(null);
          }
        }}
        onSubmit={editingAlert ? handleUpdateAlert : handleCreateAlert}
        alert={editingAlert}
        mode={editingAlert ? 'edit' : 'create'}
      />
    </div>
  );
};
