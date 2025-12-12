import { useState, useCallback } from "react";;;
import { logger } from "@/lib/logger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Users, Settings, History, Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserGroup {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  member_count?: number;
}

interface RoleAuditLog {
  id: string;
  user_id: string;
  old_role: string;
  new_role: string;
  changed_by: string;
  change_reason: string;
  created_at: string;
}

export default function UserManagementRBAC() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [auditLogs, setAuditLogs] = useState<RoleAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as unknown)
        .from("user_groups")
        .select("*")
        .order("name");

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      logger.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load user groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as unknown)
        .from("role_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      logger.error("Error fetching audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description: string) => {
    try {
      const { error } = await (supabase as unknown)
        .from("user_groups")
        .insert({ name, description });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User group created successfully",
      });
      fetchGroups();
    } catch (error) {
      logger.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create user group",
        variant: "destructive",
      });
    }
  };

  const addUserToGroup = async (userId: string, groupId: string) => {
    try {
      const { error } = await (supabase as unknown).rpc("add_user_to_group", {
        p_user_id: userId,
        p_group_id: groupId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User added to group successfully",
      });
    } catch (error) {
      logger.error("Error adding user to group:", error);
      toast({
        title: "Error",
        description: "Failed to add user to group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            User Management & RBAC
          </h1>
          <p className="text-muted-foreground">
            Manage roles, permissions, and user groups
          </p>
        </div>
        <Button onClick={fetchGroups}>
          <Users className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            User Groups
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Settings className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="mr-2 h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Groups</CardTitle>
              <CardDescription>
                Organize users into groups with inherited permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => fetchGroups(}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </div>

                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <Card
                        key={group.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={handleSetSelectedGroup}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{group.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {group.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={group.is_active ? "default" : "secondary"}>
                                {group.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Permissions</CardTitle>
              <CardDescription>
                Manage permissions for user groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="permission-group">Select Group</Label>
                    <Select value={selectedGroup || ""} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>View Users</span>
                        <Badge variant="outline">Read</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Manage Certificates</span>
                        <Badge variant="outline">Write</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>View Reports</span>
                        <Badge variant="outline">Read</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Change Audit Logs</CardTitle>
              <CardDescription>
                Track all role and permission changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={fetchAuditLogs}>
                  <History className="mr-2 h-4 w-4" />
                  Load Audit Logs
                </Button>

                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <Card key={log.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{log.old_role}</Badge>
                                <span>→</span>
                                <Badge>{log.new_role}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.change_reason}
                              </p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>{new Date(log.created_at).toLocaleDateString()}</p>
                              <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
