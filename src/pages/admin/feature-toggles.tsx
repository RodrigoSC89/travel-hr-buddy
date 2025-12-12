
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatureFlags, useToggleFeatureFlag } from "@/hooks/use-feature-flag";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag, Plus, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * PATCH 629: Feature Flags Admin UI
 * Control panel for enabling/disabling features by tenant, user, or globally
 */
export default function FeatureToggles() {
  const { data: flags, isLoading } = useFeatureFlags();
  const toggleFeatureFlag = useToggleFeatureFlag();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newFlagKey, setNewFlagKey] = useState("");
  const [newFlagDescription, setNewFlagDescription] = useState("");

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    try {
      await toggleFeatureFlag(key, !currentEnabled);
      await queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      
      toast({
        title: "Feature flag updated",
        description: `${key} is now ${!currentEnabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const enabledCount = flags?.filter(f => f.enabled).length || 0;
  const totalCount = flags?.length || 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="h-8 w-8" />
          Feature Flags
        </h1>
        <p className="text-muted-foreground mt-2">
          PATCH 629: Dynamic feature control system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{enabledCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-400">{totalCount - enabledCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Flags</TabsTrigger>
          <TabsTrigger value="enabled">Enabled</TabsTrigger>
          <TabsTrigger value="disabled">Disabled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FeatureFlagsList flags={flags || []} onToggle={handleToggle} />
        </TabsContent>

        <TabsContent value="enabled" className="space-y-4">
          <FeatureFlagsList 
            flags={flags?.filter(f => f.enabled) || []} 
            onToggle={handleToggle} 
          />
        </TabsContent>

        <TabsContent value="disabled" className="space-y-4">
          <FeatureFlagsList 
            flags={flags?.filter(f => !f.enabled) || []} 
            onToggle={handleToggle} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FeatureFlagsListProps {
  flags: Array<{
    id: string;
    key: string;
    enabled: boolean;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>;
  onToggle: (key: string, currentEnabled: boolean) => void;
}

function FeatureFlagsList({ flags, onToggle }: FeatureFlagsListProps) {
  if (flags.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No feature flags in this category
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {flags.map((flag) => (
        <Card key={flag.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{flag.key}</CardTitle>
                  <Badge variant={flag.enabled ? "default" : "secondary"}>
                    {flag.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {flag.description && (
                  <CardDescription>{flag.description}</CardDescription>
                )}
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={() => onToggle(flag.key, flag.enabled)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div>
                Created: {new Date(flag.created_at).toLocaleDateString()}
              </div>
              <div>
                Updated: {new Date(flag.updated_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
