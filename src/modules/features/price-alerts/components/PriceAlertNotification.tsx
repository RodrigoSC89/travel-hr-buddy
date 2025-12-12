import { useEffect, useState, useCallback } from "react";;

/**
 * PATCH 418: Price Alerts Notification Integration
 * Integrates price alerts with the notifications center
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff, Mail, MessageSquare, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  id?: string;
  alert_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  frequency: "once" | "daily" | "weekly" | "realtime";
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface PriceAlertNotificationProps {
  alertId: string;
  alertName: string;
}

export const PriceAlertNotification: React.FC<PriceAlertNotificationProps> = ({
  alertId,
  alertName
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    alert_id: alertId,
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    frequency: "once"
});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [alertId]);

  const loadSettings = async () => {
    try {
      // Load existing settings for this alert
      const { data: alertData, error: alertError } = await supabase
        .from("price_alerts")
        .select("frequency, last_triggered_at, triggered_count")
        .eq("id", alertId)
        .single();

      if (alertError) throw alertError;

      if (alertData) {
        setSettings(prev => ({
          ...prev,
          frequency: alertData.frequency || "once"
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Update alert frequency
      const { error: updateError } = await supabase
        .from("price_alerts")
        .update({ 
          frequency: settings.frequency,
          updated_at: new Date().toISOString()
        })
        .eq("id", alertId);

      if (updateError) throw updateError;

      toast({
        title: "Settings Saved",
        description: "Notification preferences updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    try {
      // Create a test notification
      const { error } = await supabase
        .from("price_notifications")
        .insert({
          alert_id: alertId,
          notification_type: "test",
          message: `Test notification for ${alertName}`,
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Test Notification Sent",
        description: "Check your notification center",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Notification Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.email_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="push-notifications">Push Notifications</Label>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.push_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, push_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Badge variant="outline" className="ml-2 text-xs">Premium</Badge>
            </div>
            <Switch
              id="sms-notifications"
              checked={settings.sms_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, sms_enabled: checked })
              }
              disabled
            />
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label>Alert Frequency</Label>
          <Select
            value={settings.frequency}
            onValueChange={(value: unknown) =>
              setSettings({ ...settings, frequency: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">
                <div className="flex items-center gap-2">
                  <BellOff className="w-4 h-4" />
                  Once - Notify once then disable
                </div>
              </SelectItem>
              <SelectItem value="realtime">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Real-time - Notify immediately
                </div>
              </SelectItem>
              <SelectItem value="daily">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Daily - Once per day maximum
                </div>
              </SelectItem>
              <SelectItem value="weekly">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Weekly - Once per week maximum
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Controls how often you receive notifications for this alert
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={saveSettings} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          <Button onClick={testNotification} variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Test
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <Bell className="w-4 h-4 inline mr-1" />
            Notifications are checked every 5 minutes. Real-time alerts may have a slight delay.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
