import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  FileText,
  Calendar,
  Bell,
  Award,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye
} from "lucide-react";

interface EmployeeRequest {
  id: string;
  employee_id: string;
  request_type: 'vacation' | 'travel' | 'certificate' | 'document' | 'training' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  approver_id?: string;
  approved_at?: string;
  approval_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'reminder';
  category: 'general' | 'request' | 'training' | 'compliance' | 'document';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  department?: string;
  created_at: string;
}

export const EmployeePortalSelfService: React.FC = () => {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const [requestForm, setRequestForm] = useState({
    request_type: "vacation" as const,
    title: "",
    description: "",
    priority: "normal" as const,
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    fetchUserProfile();
    fetchRequests();
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: data?.full_name,
        role: data?.role,
        department: data?.department,
        created_at: user.created_at
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employee_requests')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employee_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employee_notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const createRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please log in", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('employee_requests')
        .insert([{
          employee_id: user.id,
          ...requestForm
        }]);

      if (error) throw error;

      toast({ title: "Success", description: "Request submitted successfully" });
      setIsCreateRequestOpen(false);
      resetRequestForm();
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive"
      });
    }
  };

  const cancelRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    try {
      const { error } = await supabase
        .from('employee_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Request cancelled" });
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive"
      });
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('employee_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      toast({ title: "Success", description: "All notifications marked as read" });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  const resetRequestForm = () => {
    setRequestForm({
      request_type: "vacation",
      title: "",
      description: "",
      priority: "normal",
      start_date: "",
      end_date: ""
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-8 w-8" />
                Employee Self-Service Portal
              </CardTitle>
              <CardDescription>
                Manage your personal information, requests, and stay updated with notifications
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{pendingRequests}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-muted-foreground">Unread</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="requests">
                <FileText className="h-4 w-4 mr-2" />
                My Requests
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <Award className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <div className="font-medium">{profile?.full_name || 'Not set'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium">{profile?.email}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Role</Label>
                      <div className="font-medium">{profile?.role || 'Not set'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Department</Label>
                      <div className="font-medium">{profile?.department || 'Not set'}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => {
                        setRequestForm({ ...requestForm, request_type: 'vacation' });
                        setIsCreateRequestOpen(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Request Vacation
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => {
                        setRequestForm({ ...requestForm, request_type: 'certificate' });
                        setIsCreateRequestOpen(true);
                      }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Request Certificate
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => {
                        setRequestForm({ ...requestForm, request_type: 'document' });
                        setIsCreateRequestOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Request Document
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => {
                        setRequestForm({ ...requestForm, request_type: 'training' });
                        setIsCreateRequestOpen(true);
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Request Training
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.slice(0, 5).length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No requests yet. Create your first request!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {requests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(request.status)}
                            <div>
                              <div className="font-medium">{request.title}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {request.request_type} • {new Date(request.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Requests</h3>
                <Button onClick={() => setIsCreateRequestOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No requests found. Create your first request to get started.
                </div>
              ) : (
                <div className="grid gap-4">
                  {requests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              {request.title}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(request.created_at).toLocaleDateString()} • 
                              <span className="capitalize"> {request.request_type}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                        {request.start_date && request.end_date && (
                          <div className="text-sm mb-3">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </div>
                        )}
                        {request.status === 'rejected' && request.rejection_reason && (
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                            <div className="font-semibold text-red-800 dark:text-red-300">Rejection Reason:</div>
                            <div className="text-red-700 dark:text-red-300">{request.rejection_reason}</div>
                          </div>
                        )}
                        {request.status === 'approved' && request.approval_notes && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                            <div className="font-semibold text-green-800 dark:text-green-300">Approval Notes:</div>
                            <div className="text-green-700 dark:text-green-300">{request.approval_notes}</div>
                          </div>
                        )}
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelRequest(request.id)}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="outline" onClick={markAllNotificationsRead}>
                    Mark All as Read
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={notification.is_read ? 'opacity-60' : 'border-primary/50'}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{notification.title}</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <div className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.created_at).toLocaleString()}
                                </div>
                              </div>
                              {!notification.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markNotificationRead(notification.id)}
                                >
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4 mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your documents and certificates will appear here.</p>
                <p className="text-sm mt-2">Integration with document management system coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={isCreateRequestOpen} onOpenChange={(open) => { if (!open) resetRequestForm(); setIsCreateRequestOpen(open); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="request_type">Request Type</Label>
              <Select
                value={requestForm.request_type}
                onValueChange={(value: any) => setRequestForm({ ...requestForm, request_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={requestForm.title}
                onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                placeholder="Brief title for your request"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="Provide details about your request"
                rows={4}
              />
            </div>
            {(requestForm.request_type === 'vacation' || requestForm.request_type === 'travel') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={requestForm.start_date}
                    onChange={(e) => setRequestForm({ ...requestForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={requestForm.end_date}
                    onChange={(e) => setRequestForm({ ...requestForm, end_date: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={requestForm.priority}
                onValueChange={(value: any) => setRequestForm({ ...requestForm, priority: value })}
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
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createRequest} disabled={!requestForm.title || !requestForm.description}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
