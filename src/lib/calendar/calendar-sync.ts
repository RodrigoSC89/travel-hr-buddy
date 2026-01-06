/**
 * Calendar Sync Service
 * Generates iCal feeds and syncs with Google Calendar/Outlook
 * For crew schedules, training, maintenance, audits
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  category: "watch" | "training" | "maintenance" | "audit" | "leave" | "port" | "deadline";
  vesselId?: string;
  vesselName?: string;
  crewMemberId?: string;
  reminder?: number; // minutes before
}

/**
 * Generate iCal format string from events
 */
export function generateICalFeed(events: CalendarEvent[], calendarName: string): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const escapeText = (text: string): string => {
    return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  };

  const vevents = events.map(event => {
    const lines = [
      "BEGIN:VEVENT",
      `UID:${event.id}@nautilus.app`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${escapeText(event.title)}`,
    ];

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeText(event.location)}`);
    }
    if (event.vesselName) {
      lines.push(`X-VESSEL:${escapeText(event.vesselName)}`);
    }

    // Add category
    const categoryMap: Record<string, string> = {
      watch: "WORK",
      training: "EDUCATION",
      maintenance: "APPOINTMENT",
      audit: "MEETING",
      leave: "HOLIDAY",
      port: "TRAVEL",
      deadline: "REMINDER"
    };
    lines.push(`CATEGORIES:${categoryMap[event.category] || "WORK"}`);

    // Add alarm if reminder set
    if (event.reminder) {
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${escapeText(event.title)} starts soon`);
      lines.push(`TRIGGER:-PT${event.reminder}M`);
      lines.push("END:VALARM");
    }

    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  }).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nautilus One//Maritime Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:UTC",
    vevents,
    "END:VCALENDAR"
  ].join("\r\n");
}

/**
 * Convert crew watch schedule to calendar events
 */
export function watchScheduleToEvents(
  schedule: Array<{
    id: string;
    crewMemberId: string;
    crewName: string;
    watch: string[];
    startTime: Date;
    endTime: Date;
    vesselId: string;
    vesselName: string;
  }>
): CalendarEvent[] {
  return schedule.map(shift => ({
    id: `watch_${shift.id}`,
    title: `Watch: ${shift.watch.join("/")}`,
    description: `Watch rotation for ${shift.crewName}\nVessel: ${shift.vesselName}`,
    startDate: shift.startTime,
    endDate: shift.endTime,
    location: `Vessel: ${shift.vesselName}`,
    category: "watch" as const,
    vesselId: shift.vesselId,
    vesselName: shift.vesselName,
    crewMemberId: shift.crewMemberId,
    reminder: 60 // 1 hour before
  }));
}

/**
 * Convert training sessions to calendar events
 */
export function trainingToEvents(
  sessions: Array<{
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    vesselId?: string;
    vesselName?: string;
  }>
): CalendarEvent[] {
  return sessions.map(session => ({
    id: `training_${session.id}`,
    title: `Training: ${session.title}`,
    description: session.description,
    startDate: session.startDate,
    endDate: session.endDate,
    location: session.location || session.vesselName,
    category: "training" as const,
    vesselId: session.vesselId,
    vesselName: session.vesselName,
    reminder: 1440 // 24 hours before
  }));
}

/**
 * Convert maintenance windows to calendar events
 */
export function maintenanceToEvents(
  windows: Array<{
    id: string;
    title: string;
    description?: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    vesselId: string;
    vesselName: string;
    equipment?: string;
  }>
): CalendarEvent[] {
  return windows.map(window => ({
    id: `maint_${window.id}`,
    title: `Maintenance: ${window.title}`,
    description: `${window.description || ""}\nEquipment: ${window.equipment || "N/A"}`,
    startDate: window.scheduledStart,
    endDate: window.scheduledEnd,
    location: `Vessel: ${window.vesselName}`,
    category: "maintenance" as const,
    vesselId: window.vesselId,
    vesselName: window.vesselName,
    reminder: 1440 // 24 hours before
  }));
}

/**
 * Convert audit schedule to calendar events
 */
export function auditToEvents(
  audits: Array<{
    id: string;
    auditType: string;
    scheduledDate: Date;
    estimatedDuration: number; // hours
    vesselId: string;
    vesselName: string;
    auditor?: string;
  }>
): CalendarEvent[] {
  return audits.map(audit => {
    const endDate = new Date(audit.scheduledDate);
    endDate.setHours(endDate.getHours() + audit.estimatedDuration);

    return {
      id: `audit_${audit.id}`,
      title: `Audit: ${audit.auditType}`,
      description: `Audit scheduled for ${audit.vesselName}${audit.auditor ? `\nAuditor: ${audit.auditor}` : ""}`,
      startDate: audit.scheduledDate,
      endDate,
      location: `Vessel: ${audit.vesselName}`,
      category: "audit" as const,
      vesselId: audit.vesselId,
      vesselName: audit.vesselName,
      reminder: 2880 // 48 hours before
    };
  });
}

/**
 * Download iCal file
 */
export function downloadICalFile(icalContent: string, filename: string): void {
  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate calendar subscription URL (for future API endpoint)
 */
export function getCalendarSubscriptionUrl(
  vesselId?: string,
  crewMemberId?: string,
  categories?: string[]
): string {
  const baseUrl = "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/ical-feed";
  const params = new URLSearchParams();
  
  if (vesselId) params.set("vessel", vesselId);
  if (crewMemberId) params.set("crew", crewMemberId);
  if (categories?.length) params.set("categories", categories.join(","));
  
  return `${baseUrl}?${params.toString()}`;
}
