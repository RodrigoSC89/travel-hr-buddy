/**
 * Crew Rotation Schedule Component
 * PATCH 853 - Removed @ts-nocheck, using crew_embarkations table
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ship, User, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { logger } from '@/lib/logger';

type CrewEmbarkation = Database["public"]["Tables"]["crew_embarkations"]["Row"];

export function CrewRotationSchedule() {
  const [embarkations, setEmbarkations] = useState<CrewEmbarkation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmbarkations();
  }, []);

  const loadEmbarkations = async () => {
    try {
      const { data, error } = await supabase
        .from("crew_embarkations")
        .select("*")
        .order("embark_date", { ascending: true })
        .limit(50);

      if (error) throw error;
      setEmbarkations(data || []);
    } catch (error) {
      logger.error("Error loading embarkations:", error);
      toast.error("Failed to load crew embarkations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromDates = (embarkDate: string | null, disembarkDate: string | null): string => {
    if (!embarkDate) return "pending";
    const now = new Date();
    const embark = new Date(embarkDate);
    const disembark = disembarkDate ? new Date(disembarkDate) : null;
    
    if (disembark && now > disembark) return "completed";
    if (now >= embark && (!disembark || now <= disembark)) return "active";
    if (now < embark) return "scheduled";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "secondary",
      active: "default",
      completed: "outline",
      pending: "destructive"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
        {embarkations.length === 0 ? (
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
          embarkations.map((embarkation) => {
            const status = getStatusFromDates(embarkation.embark_date, embarkation.disembark_date);
            return (
              <Card key={embarkation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Ship className="h-4 w-4" />
                      <CardTitle className="text-lg">
                        {embarkation.vessel_name || "Unknown Vessel"}
                      </CardTitle>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                  <CardDescription>
                    {embarkation.embark_date 
                      ? format(new Date(embarkation.embark_date), "PPP")
                      : "Date not set"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {embarkation.embark_location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">From:</span>
                        <span className="font-medium">{embarkation.embark_location}</span>
                      </div>
                    )}
                    {embarkation.disembark_location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">{embarkation.disembark_location}</span>
                      </div>
                    )}
                    {embarkation.function_role && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <span className="font-medium">{embarkation.function_role}</span>
                      </div>
                    )}
                    {embarkation.hours_worked !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours:</span>
                        <Badge variant="outline" className="text-xs">
                          {embarkation.hours_worked}h
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
