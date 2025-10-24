import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Phone, MapPin, Users, Clock, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Emergency {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  location: string;
  description: string;
  status: "active" | "responding" | "resolved";
  timestamp: string;
  responders: number;
}

const EmergencyResponse = () => {
  const [emergencies] = useState<Emergency[]>([
    {
      id: "1",
      type: "Medical Emergency",
      severity: "critical",
      location: "Vessel Alpha - Deck 3",
      description: "Crew member requires immediate medical attention",
      status: "responding",
      timestamp: new Date().toISOString(),
      responders: 3
    },
    {
      id: "2",
      type: "Fire Alert",
      severity: "high",
      location: "Engine Room - Vessel Beta",
      description: "Smoke detected in engine compartment",
      status: "active",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      responders: 5
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>;
      case "responding":
        return <Badge className="bg-yellow-500">Responding</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Emergency Response</h1>
          <p className="text-muted-foreground">Monitor and manage emergency situations</p>
        </div>
      </div>

      {emergencies.filter(e => e.status === "active").length > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <strong className="text-red-700 dark:text-red-400">
              {emergencies.filter(e => e.status === "active").length} active emergency alert(s)
            </strong>
            {" "}requiring immediate attention
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {emergencies.filter(e => e.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Require action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Responding</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {emergencies.filter(e => e.status === "responding").length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Responders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emergencies.reduce((acc, e) => acc + e.responders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">On duty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4min</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Alerts ({emergencies.filter(e => e.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="responding">
            Responding ({emergencies.filter(e => e.status === "responding").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {emergencies.filter(e => e.status === "active").map((emergency) => (
            <Card key={emergency.id} className="border-red-200 dark:border-red-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{emergency.type}</CardTitle>
                      <Badge variant={getSeverityColor(emergency.severity)}>
                        {emergency.severity.toUpperCase()}
                      </Badge>
                      {getStatusBadge(emergency.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {emergency.location}
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(emergency.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{emergency.description}</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{emergency.responders} responders assigned</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Location
                  </Button>
                  <Button variant="outline" size="sm">
                    Assign Responders
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="responding" className="space-y-4">
          {emergencies.filter(e => e.status === "responding").map((emergency) => (
            <Card key={emergency.id} className="border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{emergency.type}</CardTitle>
                      <Badge variant={getSeverityColor(emergency.severity)}>
                        {emergency.severity.toUpperCase()}
                      </Badge>
                      {getStatusBadge(emergency.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {emergency.location}
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(emergency.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{emergency.description}</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{emergency.responders} responders on scene</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">Mark as Resolved</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No recently resolved emergencies to display.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Protocols</CardTitle>
              <CardDescription>Standard operating procedures for emergency situations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Medical Emergency Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    Immediate response procedures for medical emergencies on vessels
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Fire Response Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    Fire detection, containment, and evacuation procedures
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Man Overboard Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    Immediate actions and rescue procedures for man overboard situations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyResponse;
