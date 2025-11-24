import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, UserAccessLog } from "@/types/modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Activity, Download, Upload } from "lucide-react";
import { toast } from "sonner";

export function UserManagementDashboard() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [accessLogs, setAccessLogs] = useState<UserAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0
  });

  useEffect(() => {
    loadUserManagementData();
  }, []);

  const loadUserManagementData = async () => {
    try {
      const [rolesRes, logsRes, usersCount] = await Promise.all([
        supabase
          .from("user_roles")
          .select("*")
          .order("hierarchy_level", { ascending: true }),
        supabase
          .from("user_access_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("crew_assignments")
          .select("id", { count: "exact", head: true })
          .eq("assignment_status", "active")
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (logsRes.error) throw logsRes.error;

      setRoles(rolesRes.data || []);
      setAccessLogs(logsRes.data || []);
      setStats({
        totalUsers: usersCount.count || 0,
        activeUsers: usersCount.count || 0,
        totalRoles: rolesRes.data?.length || 0
      });
    } catch (error) {
      console.error("Error loading user management data:", error);
      toast.error("Failed to load user management data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failure: "destructive",
      blocked: "destructive"
    };

    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      login: "🔐",
      logout: "🚪",
      page_view: "👁️",
      api_call: "📡",
      data_access: "📂",
      data_modify: "✏️",
      failed_login: "❌",
      permission_denied: "🚫"
    };

    return icons[action] || "📝";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading user management data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, permissions, and access logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Users
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              Permission groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="mr-2 h-4 w-4" />
            Access Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {roles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No roles defined</p>
                <Button className="mt-4">
                  Create First Role
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        {role.role_name}
                      </CardTitle>
                      {role.is_system_role && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Level {role.hierarchy_level}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {role.role_description || "No description"}
                    </p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                          role.permissions.slice(0, 5).map((permission: any, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {typeof permission === "string" ? permission : permission.name || "Permission"}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No permissions set</span>
                        )}
                        {role.permissions && Array.isArray(role.permissions) && role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      {!role.is_system_role && (
                        <Button size="sm" variant="outline">Delete</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Access Activity</CardTitle>
              <CardDescription>
                Track user actions and system access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accessLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No access logs available
                  </p>
                ) : (
                  accessLogs.slice(0, 20).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{getActionIcon(log.action)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">
                            {log.action.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                          {log.resource_type && (
                            <p className="text-xs text-muted-foreground">
                              Resource: {log.resource_type}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.ip_address && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {log.ip_address}
                          </Badge>
                        )}
                        {log.status && getStatusBadge(log.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
