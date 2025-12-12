import { useState } from "react";;
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatePriceAlertInput, PriceAlert, UpdatePriceAlertInput } from "@/services/price-alerts-service";

interface AlertFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  alert?: PriceAlert | null;
  mode: "create" | "edit";
}

export const AlertForm: React.FC<AlertFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  alert,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePriceAlertInput>({
    product_name: alert?.product_name || "",
    target_price: alert?.target_price || 0,
    current_price: alert?.current_price || undefined,
    product_url: alert?.product_url || "",
    route: alert?.route || "",
    travel_date: alert?.travel_date || "",
    notification_email: alert?.notification_email ?? true,
    notification_push: alert?.notification_push ?? true,
    notification_frequency: alert?.notification_frequency || "immediate",
  });
  const [travelDate, setTravelDate] = useState<Date | undefined>(
    alert?.travel_date ? new Date(alert.travel_date) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        travel_date: travelDate ? format(travelDate, "yyyy-MM-dd") : undefined,
      };
      await onSubmit(submitData);
      onOpenChange(false);
      // Reset form
      if (mode === "create") {
        setFormData({
          product_name: "",
          target_price: 0,
          current_price: undefined,
          product_url: "",
          route: "",
          travel_date: "",
          notification_email: true,
          notification_push: true,
          notification_frequency: "immediate",
        });
        setTravelDate(undefined);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Price Alert" : "Edit Price Alert"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Set up a new price alert to track travel prices and get notified when prices change."
              : "Update the price alert settings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              placeholder="e.g., Flight to New York"
              required
            />
          </div>

          {/* Route */}
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              value={formData.route || ""}
              onChange={(e) =>
                setFormData({ ...formData, route: e.target.value })
              }
              placeholder="e.g., São Paulo - Rio de Janeiro"
            />
          </div>

          {/* Travel Date */}
          <div className="space-y-2">
            <Label>Travel Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !travelDate && "text-muted-foreground"
                  )}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {travelDate ? format(travelDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={travelDate}
                  onSelect={setTravelDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_price">Target Price *</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.target_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_price">Current Price</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.current_price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_price: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Product URL */}
          <div className="space-y-2">
            <Label htmlFor="product_url">Product URL *</Label>
            <Input
              id="product_url"
              type="url"
              value={formData.product_url}
              onChange={(e) =>
                setFormData({ ...formData, product_url: e.target.value })
              }
              placeholder="https://example.com/product"
              required
            />
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Notification Settings</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="notification_email">Email Notifications</Label>
              <Switch
                id="notification_email"
                checked={formData.notification_email}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notification_email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notification_push">Push Notifications</Label>
              <Switch
                id="notification_push"
                checked={formData.notification_push}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notification_push: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_frequency">Notification Frequency</Label>
              <Select
                value={formData.notification_frequency}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, notification_frequency: value })
                }
              >
                <SelectTrigger id="notification_frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Alert" : "Update Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
