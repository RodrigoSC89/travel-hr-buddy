// PATCH 110.0: Offline Mode + Local Cache Module
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, 
  CloudOff,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { offlineCacheService } from "@/services/offline-cache";
import { supabase } from "@/integrations/supabase/client";
import type { OfflineStatus, PendingAction, SyncResult } from "@/types/offline";

const OfflineCache: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    is_offline: false,
    last_sync: null,
    pending_actions: 0,
    cached_data_size: 0,
  });
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    initializeOfflineMode();
    setupEventListeners();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeOfflineMode = async () => {
    try {
      setLoading(true);
      await offlineCacheService.initialize();
      await loadOfflineStatus();
    } catch (error) {
      console.error('Error initializing offline mode:', error);
      toast({
        title: "Error",
        description: "Failed to initialize offline mode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleOnline = async () => {
    setIsOnline(true);
    toast({
      title: "Back Online",
      description: "Connection restored. Syncing pending changes...",
    });
    await syncPendingActions();
  };

  const handleOffline = () => {
    setIsOnline(false);
    toast({
      title: "Offline Mode",
      description: "Working offline. Changes will sync when connection is restored.",
      variant: "default",
    });
  };

  const loadOfflineStatus = async () => {
    try {
      const status = await offlineCacheService.getOfflineStatus();
      const actions = await offlineCacheService.getPendingActions();
      
      setOfflineStatus(status);
      setPendingActions(actions);
    } catch (error) {
      console.error('Error loading offline status:', error);
    }
  };

  const cacheCurrentData = async () => {
    try {
      setLoading(true);
      
      // Cache routes
      const { data: routes } = await supabase
        .from('routes')
        .select('*')
        .limit(50);
      
      if (routes) {
        await offlineCacheService.cacheRoutes(routes.map(r => ({
          id: r.id,
          name: r.name || '',
          departure_port: r.origin_port_id || 'Unknown',
          arrival_port: r.destination_port_id || 'Unknown',
          estimated_duration: r.estimated_duration_hours || 0,
          cached_at: new Date().toISOString(),
        })));
      }

      // Cache crew
      const { data: crew } = await supabase
        .from('crew_members')
        .select('*')
        .limit(100);
      
      if (crew) {
        await offlineCacheService.cacheCrew(crew.map(c => ({
          id: c.id,
          name: (c as any).full_name || (c as any).name || 'Unknown',
          position: c.position || 'Unknown',
          onboard_status: (c as any).status === 'onboard',
          cached_at: new Date().toISOString(),
        })));
      }

      // Cache vessels
      const { data: vessels } = await supabase
        .from('vessels')
        .select('*')
        .limit(50);
      
      if (vessels) {
        await offlineCacheService.cacheVessels(vessels.map(v => ({
          id: v.id,
          name: v.name,
          imo_code: v.imo_number || '',
          status: v.status || 'unknown',
          last_known_position: v.current_location ? { lat: 0, lng: 0 } : null,
          cached_at: new Date().toISOString(),
        })));
      }

      await offlineCacheService.updateLastSync();
      await loadOfflineStatus();

      toast({
        title: "Cache Updated",
        description: "Local data cache refreshed successfully",
      });
    } catch (error) {
      console.error('Error caching data:', error);
      toast({
        title: "Error",
        description: "Failed to update cache",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncPendingActions = async (): Promise<SyncResult> => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline",
        variant: "destructive",
      });
      return { success: false, synced_actions: 0, failed_actions: 0, errors: ['Offline'] };
    }

    try {
      setSyncing(true);
      const actions = await offlineCacheService.getPendingActions();
      
      let synced = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const action of actions) {
        try {
          // Attempt to sync action to Supabase
          switch (action.type) {
            case 'create':
              await (supabase as any).from(action.table).insert(action.data);
              break;
            case 'update':
              await (supabase as any).from(action.table).update(action.data).eq('id', action.data.id || '');
              break;
            case 'delete':
              await (supabase as any).from(action.table).delete().eq('id', action.data.id || '');
              break;
          }
          
          await offlineCacheService.markActionSynced(action.id);
          synced++;
        } catch (error) {
          failed++;
          errors.push(`Failed to sync ${action.type} on ${action.table}`);
          console.error('Sync error:', error);
        }
      }

      await loadOfflineStatus();

      const result: SyncResult = {
        success: failed === 0,
        synced_actions: synced,
        failed_actions: failed,
        errors,
      };

      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `${synced} actions synced successfully`,
        });
      } else {
        toast({
          title: "Sync Partial",
          description: `${synced} synced, ${failed} failed`,
          variant: "default",
        });
      }

      return result;
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: "Error",
        description: "Failed to sync pending actions",
        variant: "destructive",
      });
      return { success: false, synced_actions: 0, failed_actions: 0, errors: ['Sync failed'] };
    } finally {
      setSyncing(false);
    }
  };

  const clearCache = async () => {
    try {
      await offlineCacheService.clearAll();
      await loadOfflineStatus();
      
      toast({
        title: "Cache Cleared",
        description: "All offline data has been removed",
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  return (
    <ModulePageWrapper>
      <ModuleHeader
        title="Offline Mode & Cache"
        description="Manage offline data and synchronization"
        icon={Database}
      />

      {/* Status Banner */}
      <Card className={`mb-6 ${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <Cloud className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Online</h3>
                    <p className="text-sm text-green-700">Connected to server</p>
                  </div>
                </>
              ) : (
                <>
                  <CloudOff className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Offline Mode Active</h3>
                    <p className="text-sm text-orange-700">Working with cached data</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={isOnline ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {offlineStatus.last_sync 
                ? new Date(offlineStatus.last_sync).toLocaleString()
                : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">Last successful synchronization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {offlineStatus.pending_actions}
            </div>
            <p className="text-xs text-muted-foreground">Waiting to sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isOnline ? 'Active' : 'In Use'}
            </div>
            <p className="text-xs text-muted-foreground">Local data available</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cache Status</CardTitle>
                  <CardDescription>View and manage offline data</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={cacheCurrentData}
                    disabled={!isOnline || loading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Update Cache
                  </Button>
                  <Button 
                    onClick={syncPendingActions}
                    disabled={!isOnline || syncing || pendingActions.length === 0}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Routes</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Latest routes cached</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Crew Members</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Current crew data available</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Fleet Status</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Vessel information cached</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Actions waiting to be synchronized</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingActions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Synced</h3>
                  <p className="text-muted-foreground">
                    No pending actions to synchronize
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingActions.map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{action.type}</Badge>
                          <span className="font-medium">{action.table}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(action.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Upload className="h-5 w-5 text-orange-600" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cache Settings</CardTitle>
              <CardDescription>Manage offline data and cache</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Automatic Sync</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automatically sync pending changes when connection is restored
                  </p>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Cache Lifetime</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    How long to keep cached data before refreshing
                  </p>
                  <Badge variant="outline">24 hours</Badge>
                </div>

                <div className="p-4 border rounded-lg border-red-200">
                  <h4 className="font-semibold mb-2 text-red-600">Clear Cache</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Remove all locally cached data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={clearCache}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default OfflineCache;
