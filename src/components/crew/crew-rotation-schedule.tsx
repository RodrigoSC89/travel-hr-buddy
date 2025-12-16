// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CrewRotation } from "@/types/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ship, User, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function CrewRotationSchedule() {
  const [rotations, setRotations] = useState<CrewRotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRotations();
  }, []);

  const loadRotations = async () => {
    try {
      const { data, error } = await supabase
        .from("crew_rotations")
        .select("*")
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setRotations(data || []);
    } catch (error) {
      console.error("Error loading rotations:", error);
      toast.error("Failed to load crew rotations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
      delayed: "outline"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRotationTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      embarkation: <Ship className="h-4 w-4" />,
      disembarkation: <User className="h-4 w-4" />,
      rotation: <Calendar className="h-4 w-4" />,
      leave: <Clock className="h-4 w-4" />,
      emergency: <AlertCircle className="h-4 w-4" />
    };

    return icons[type] || <Calendar className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading crew rotations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Crew Rotation Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Manage crew embarkation and disembarkation schedules
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          New Rotation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rotations.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No crew rotations scheduled</p>
              <Button variant="outline" className="mt-4">
                Schedule First Rotation
              </Button>
            </CardContent>
          </Card>
        ) : (
          rotations.map((rotation) => (
            <Card key={rotation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRotationTypeIcon(rotation.rotation_type)}
                    <CardTitle className="text-lg">
                      {rotation.rotation_type.charAt(0).toUpperCase() + rotation.rotation_type.slice(1)}
                    </CardTitle>
                  </div>
                  {getStatusBadge(rotation.status)}
                </div>
                <CardDescription>
                  {format(new Date(rotation.scheduled_date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {rotation.departure_port && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">{rotation.departure_port}</span>
                    </div>
                  )}
                  {rotation.arrival_port && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{rotation.arrival_port}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical:</span>
                    <span className="flex items-center">
                      {rotation.medical_clearance ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Documents:</span>
                    <Badge variant="outline" className="text-xs">
                      {rotation.documentation_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
