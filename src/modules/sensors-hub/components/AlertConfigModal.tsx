/**
 * PATCH 461 - Sensor Alert Configuration Component
 * UI for configuring alert thresholds per sensor type
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertTriangle, Save } from "lucide-react";

interface AlertConfig {
  sensorType: string;
  enabled: boolean;
  thresholdMin?: number;
  thresholdMax?: number;
  severity: "low" | "medium" | "high" | "critical";
  notifyEmail: boolean;
  notifyUI: boolean;
}

interface AlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorType?: string;
  onSave: (config: AlertConfig) => void;
  existingConfig?: AlertConfig;
}

export const AlertConfigModal: React.FC<AlertConfigModalProps> = ({
  isOpen,
  onClose,
  sensorType: initialSensorType,
  onSave,
  existingConfig,
}) => {
  const [config, setConfig] = useState<AlertConfig>({
    sensorType: initialSensorType || "temperature",
    enabled: true,
    thresholdMin: 0,
    thresholdMax: 100,
    severity: "medium",
    notifyEmail: false,
    notifyUI: true,
  });

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig);
    } else if (initialSensorType) {
      setConfig((prev) => ({ ...prev, sensorType: initialSensorType }));
    }
  }, [existingConfig, initialSensorType]);

  const handleSave = () => {
    if (!config.sensorType) {
      toast.error("Please select a sensor type");
      return;
    }

    if (config.thresholdMin !== undefined && config.thresholdMax !== undefined) {
      if (config.thresholdMin >= config.thresholdMax) {
        toast.error("Minimum threshold must be less than maximum threshold");
        return;
      }
    }

    onSave(config);
    toast.success("Alert configuration saved");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Configure Alert Thresholds
          </DialogTitle>
          <DialogDescription>
            Set up alert thresholds and notification preferences for sensor monitoring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sensor Type */}
          <div className="space-y-2">
            <Label htmlFor="sensorType">Sensor Type</Label>
            <Select
              value={config.sensorType}
              onValueChange={(value) =>
                setConfig({ ...config, sensorType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sensor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="pressure">Pressure</SelectItem>
                <SelectItem value="vibration">Vibration</SelectItem>
                <SelectItem value="depth">Depth</SelectItem>
                <SelectItem value="motion">Motion</SelectItem>
                <SelectItem value="humidity">Humidity</SelectItem>
                <SelectItem value="flow">Flow Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Alerts</Label>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
          </div>

          {/* Threshold Min */}
          <div className="space-y-2">
            <Label htmlFor="thresholdMin">Minimum Threshold</Label>
            <Input
              id="thresholdMin"
              type="number"
              value={config.thresholdMin || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  thresholdMin: parseFloat(e.target.value),
                })
              }
              placeholder="e.g., 0"
            />
          </div>

          {/* Threshold Max */}
          <div className="space-y-2">
            <Label htmlFor="thresholdMax">Maximum Threshold</Label>
            <Input
              id="thresholdMax"
              type="number"
              value={config.thresholdMax || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  thresholdMax: parseFloat(e.target.value),
                })
              }
              placeholder="e.g., 100"
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Alert Severity</Label>
            <Select
              value={config.severity}
              onValueChange={(value: any) =>
                setConfig({ ...config, severity: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 pt-2 border-t">
            <Label>Notification Preferences</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyUI" className="text-sm font-normal">
                Show UI Notifications
              </Label>
              <Switch
                id="notifyUI"
                checked={config.notifyUI}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, notifyUI: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifyEmail" className="text-sm font-normal">
                Send Email Alerts
              </Label>
              <Switch
                id="notifyEmail"
                checked={config.notifyEmail}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, notifyEmail: checked })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertConfigModal;
