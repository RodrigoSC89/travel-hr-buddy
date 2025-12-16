import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.ead06aada7d445d3bdf7e23796c6ac50",
  appName: "Nautilus One",
  webDir: "dist",
  server: {
    url: "https://ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Haptics: {
      enabled: true
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0f766e",
      sound: "beep.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: true,
    scrollEnabled: true
  }
};

export default config;