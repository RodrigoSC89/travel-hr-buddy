/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 840: System Bootstrap Component
 * Initializes all system components and shows loading state
 */

import React, { useEffect, useState } from "react";
import { systemInit } from "@/lib/system/unified-init";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { VoiceCommandButton } from "@/components/voice/VoiceCommandButton";
import { NotificationBell } from "@/components/unified/NotificationCenter.unified";

interface SystemBootstrapProps {
  children: React.ReactNode;
  showOfflineIndicator?: boolean;
  showVoiceCommands?: boolean;
  showNotifications?: boolean;
  showPWAPrompts?: boolean;
}

export const SystemBootstrap = memo(function({
  children,
  showOfflineIndicator = true,
  showVoiceCommands = false,
  showNotifications = true,
  showPWAPrompts = true,
}: SystemBootstrapProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    systemInit.initialize().then(() => {
      setInitialized(true);
  };
  }, []);

  return (
    <>
      {children}
      
      {/* Offline Status */}
      <OfflineBanner />
      {showOfflineIndicator && <OfflineIndicator />}
      
      {/* PWA Prompts */}
      {showPWAPrompts && (
        <>
          <UpdatePrompt />
          <InstallPrompt />
        </>
      )}
      
      {/* Voice Commands */}
      {showVoiceCommands && <VoiceCommandButton />}
    </>
  );
}

export default SystemBootstrap;
