/**
 * Live Region Component for Screen Reader Announcements
 * WCAG 2.1 AA compliant dynamic content announcer
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiveRegionProps {
  /** The message to announce */
  children: React.ReactNode;
  /** Politeness level - use "assertive" for errors, "polite" for updates */
  politeness?: "polite" | "assertive" | "off";
  /** Whether the entire content should be announced, not just changes */
  atomic?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to visually hide the content */
  visuallyHidden?: boolean;
}

/**
 * LiveRegion announces dynamic content to screen readers.
 * 
 * @example
 * // Polite announcement for status updates
 * <LiveRegion>Data saved successfully</LiveRegion>
 * 
 * @example
 * // Assertive announcement for errors
 * <LiveRegion politeness="assertive">Error: Form validation failed</LiveRegion>
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = "polite",
  atomic = true,
  className,
  visuallyHidden = true,
}) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn(
        visuallyHidden && "sr-only",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Hook to manage live region announcements programmatically
 */
export function useLiveAnnouncement() {
  const [message, setMessage] = React.useState<string | null>(null);
  const [politeness, setPoliteness] = React.useState<"polite" | "assertive">("polite");

  const announce = React.useCallback((
    newMessage: string, 
    level: "polite" | "assertive" = "polite"
  ) => {
    setPoliteness(level);
    // Clear first to ensure announcement even if same message
    setMessage(null);
    setTimeout(() => setMessage(newMessage), 100);
  }, []);

  const clearAnnouncement = React.useCallback(() => {
    setMessage(null);
  }, []);

  const AnnouncementRegion = React.useMemo(() => {
    return function AnnouncementComponent() {
      if (!message) return null;
      return (
        <LiveRegion politeness={politeness}>
          {message}
        </LiveRegion>
      );
    };
  }, [message, politeness]);

  return {
    announce,
    clearAnnouncement,
    AnnouncementRegion,
  };
}

export default LiveRegion;
