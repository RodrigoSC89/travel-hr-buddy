/**
 * Capacitor Mobile Configuration Guide
 * Instructions for building and publishing native apps
 * 
 * This file documents the build process — not imported at runtime.
 * 
 * ═══════════════════════════════════════════════════════════════
 * SETUP INSTRUCTIONS
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. Export to GitHub via "Export to GitHub" button in Lovable
 * 2. Clone the repository locally:
 *    git clone <your-repo-url>
 *    cd <project-folder>
 * 
 * 3. Install dependencies:
 *    npm install
 * 
 * 4. Add native platforms:
 *    npx cap add ios
 *    npx cap add android
 * 
 * 5. Build the web app:
 *    npm run build
 * 
 * 6. Sync to native platforms:
 *    npx cap sync
 * 
 * 7. Run on emulator or device:
 *    npx cap run ios       (requires Mac + Xcode)
 *    npx cap run android   (requires Android Studio)
 * 
 * ═══════════════════════════════════════════════════════════════
 * APP STORE SUBMISSION CHECKLIST
 * ═══════════════════════════════════════════════════════════════
 * 
 * iOS (Apple App Store):
 * - [ ] Apple Developer Account ($99/year)
 * - [ ] App icons: 1024x1024 (App Store), plus sizes for device
 * - [ ] Launch screen / splash configured in Xcode
 * - [ ] Privacy descriptions in Info.plist (camera, location, etc.)
 * - [ ] Push notification certificates (APNs)
 * - [ ] App Store screenshots (6.7", 6.5", 5.5")
 * - [ ] App description, keywords, and category
 * 
 * Android (Google Play Store):
 * - [ ] Google Play Console account ($25 one-time)
 * - [ ] App icons: 512x512 (Play Store), adaptive icons
 * - [ ] Splash screen configured in styles.xml
 * - [ ] Permissions declared in AndroidManifest.xml
 * - [ ] Firebase project for FCM push notifications
 * - [ ] Play Store screenshots (phone, tablet)
 * - [ ] Signed APK or AAB (release build)
 * 
 * ═══════════════════════════════════════════════════════════════
 * ICON SIZES REQUIRED
 * ═══════════════════════════════════════════════════════════════
 * 
 * Place icons in:
 *   public/icons/icon-72x72.png
 *   public/icons/icon-96x96.png
 *   public/icons/icon-128x128.png
 *   public/icons/icon-144x144.png
 *   public/icons/icon-152x152.png
 *   public/icons/icon-192x192.png
 *   public/icons/icon-384x384.png
 *   public/icons/icon-512x512.png
 * 
 * ═══════════════════════════════════════════════════════════════
 * CAPACITOR PLUGINS INSTALLED
 * ═══════════════════════════════════════════════════════════════
 * 
 * @capacitor/core         - Core runtime
 * @capacitor/cli          - Build tooling
 * @capacitor/ios          - iOS platform
 * @capacitor/android      - Android platform  
 * @capacitor/haptics      - Haptic feedback (vibration)
 * @capacitor/camera        - Camera access for inspections
 * @capacitor/push-notifications - Firebase push notifications
 * @capacitor/local-notifications - Offline alert scheduling
 * @capacitor/app          - App lifecycle events
 * 
 * ═══════════════════════════════════════════════════════════════
 * HOT RELOAD (DEVELOPMENT)
 * ═══════════════════════════════════════════════════════════════
 * 
 * The capacitor.config.ts has server.url pointing to the Lovable
 * preview URL for hot-reload during development. Before building
 * for production/store submission, REMOVE the server.url config
 * so the app uses the bundled web assets instead.
 * 
 * For production build:
 *   1. Comment out or remove `server: { url: "..." }` in capacitor.config.ts
 *   2. Run `npm run build`
 *   3. Run `npx cap sync`
 *   4. Build in Xcode / Android Studio
 */

export const CAPACITOR_BUILD_CONFIG = {
  appId: "app.lovable.ead06aada7d445d3bdf7e23796c6ac50",
  appName: "Nautilus One",
  platforms: ["ios", "android"] as const,
  minIosVersion: "14.0",
  minAndroidSdk: 22,
  targetAndroidSdk: 34,
  plugins: {
    haptics: true,
    camera: true,
    pushNotifications: true,
    localNotifications: true,
    geolocation: true,
  },
  icons: {
    source: "public/icons/icon-512x512.png",
    sizes: [72, 96, 128, 144, 152, 192, 384, 512],
  },
  splash: {
    backgroundColor: "#0a0a0a",
    showSpinner: false,
    spinnerColor: "#0f766e",
  },
} as const;
