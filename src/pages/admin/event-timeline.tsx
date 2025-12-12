
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventTimeline, TimelineEvent } from "@/components/timeline/EventTimeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Clock } from "lucide-react";

/**
 * PATCH 631: Event Timeline Admin Page
 * Display system events in visual timeline format
 */
export default function EventTimelinePage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["system-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as TimelineEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const loginEvents = events?.filter(e => e.event_type === "login") || [];
  const failureEvents = events?.filter(e => e.severity === "error") || [];
  const adminEvents = events?.filter(e => e.event_category === "admin_action") || [];
  const deployEvents = events?.filter(e => e.event_type === "deploy") || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Event Timeline
        </h1>
        <p className="text-muted-foreground mt-2">
          PATCH 631: Visual timeline of system events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{events?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{loginEvents.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{failureEvents.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{adminEvents.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="logins">Logins</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="admin">Admin Actions</TabsTrigger>
          <TabsTrigger value="deploys">Deploys</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <EventTimeline events={events || []} />
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
          <EventTimeline events={loginEvents} />
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <EventTimeline events={failureEvents} />
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <EventTimeline events={adminEvents} />
        </TabsContent>

        <TabsContent value="deploys" className="space-y-4">
          <EventTimeline events={deployEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
