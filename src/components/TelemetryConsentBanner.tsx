import { useEffect, useState } from "react";;

/**
 * PATCH 499: Telemetry Consent Banner
 * GDPR-compliant consent banner for telemetry
 */

import React, { useState, useEffect } from "react";
import { ConsentManager } from "@/lib/telemetry/consent";
import { initTelemetry } from "@/lib/telemetry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export const TelemetryConsentBanner = memo(function() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if consent hasn't been decided
    setShowBanner(ConsentManager.needsConsent());
  }, []);

  const handleAccept = () => {
    ConsentManager.grantConsent();
    initTelemetry();
    setShowBanner(false);
  };

  const handleDecline = () => {
    ConsentManager.revokeConsent();
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-sm">🍪 Analytics & Telemetry</h3>
          <button
            onClick={handleDecline}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          We use analytics to improve your experience and understand how our platform is used. 
          Your data is never sold and you can opt-out anytime.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            size="sm"
            className="flex-1"
          >
            Accept
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Decline
          </Button>
        </div>

        <a
          href="/privacy-policy"
          className="text-xs text-primary hover:underline mt-3 block text-center"
        >
          Privacy Policy
        </a>
      </Card>
    </div>
  );
});
