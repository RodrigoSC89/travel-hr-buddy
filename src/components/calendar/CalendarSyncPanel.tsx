import { useState } from "react";
import { Calendar, Download, Link, Copy, Check, Clock, Wrench, GraduationCap, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  generateICalFeed,
  downloadICalFile,
  getCalendarSubscriptionUrl,
  CalendarEvent
} from "@/lib/calendar/calendar-sync";

interface CalendarSyncPanelProps {
  vesselId?: string;
  vesselName?: string;
  crewMemberId?: string;
  events?: CalendarEvent[];
}

const CATEGORY_OPTIONS = [
  { id: "watch", label: "Watch Schedules", icon: Clock, color: "bg-info" },
  { id: "training", label: "Training Sessions", icon: GraduationCap, color: "bg-success" },
  { id: "maintenance", label: "Maintenance Windows", icon: Wrench, color: "bg-warning" },
  { id: "audit", label: "Audits & Inspections", icon: ClipboardCheck, color: "bg-accent" },
];

export function CalendarSyncPanel({
  vesselId,
  vesselName,
  crewMemberId,
  events = []
}: CalendarSyncPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["watch", "training", "maintenance", "audit"]);
  const [copied, setCopied] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDownloadIcal = () => {
    const filteredEvents = events.filter(e => selectedCategories.includes(e.category));
    
    if (filteredEvents.length === 0) {
      toast.info("No events to export", {
        description: "Select categories with events to download"
      });
      return;
    }

    const calendarName = vesselName 
      ? `Nautilus - ${vesselName}` 
      : "Nautilus Maritime Calendar";
    
    const icalContent = generateICalFeed(filteredEvents, calendarName);
    downloadICalFile(icalContent, `nautilus-calendar-${Date.now()}.ics`);
    
    toast.success("Calendar downloaded", {
      description: `${filteredEvents.length} events exported to iCal format`
    });
  };

  const handleCopySubscriptionUrl = async () => {
    const url = getCalendarSubscriptionUrl(vesselId, crewMemberId, selectedCategories);
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied", {
        description: "Add this URL to Google Calendar or Outlook"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const subscriptionUrl = getCalendarSubscriptionUrl(vesselId, crewMemberId, selectedCategories);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Calendar Sync</CardTitle>
        </div>
        <CardDescription>
          Subscribe to schedules in Google Calendar, Outlook, or Apple Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Include in calendar:</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map(category => {
              const Icon = category.icon;
              const isSelected = selectedCategories.includes(category.id);
              
              return (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{category.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Event Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {events.filter(e => selectedCategories.includes(e.category)).length} events
          </Badge>
          {vesselName && (
            <Badge variant="outline">{vesselName}</Badge>
          )}
        </div>

        {/* Subscription URL */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Subscription URL:</p>
          <div className="flex gap-2">
            <code className="flex-1 p-2 text-xs bg-muted rounded-md truncate">
              {subscriptionUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopySubscriptionUrl}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this URL to subscribe in your calendar app for automatic updates
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleDownloadIcal} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download .ics
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(subscriptionUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link className="h-4 w-4 mr-2" />
              Google Calendar
            </a>
          </Button>
        </div>

        {/* Instructions */}
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            How to subscribe
          </summary>
          <div className="mt-2 space-y-2 text-muted-foreground">
            <p><strong>Google Calendar:</strong> Click "Google Calendar" button or go to Settings → Add calendar → From URL</p>
            <p><strong>Outlook:</strong> Calendar → Add calendar → Subscribe from web → Paste URL</p>
            <p><strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste URL</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
