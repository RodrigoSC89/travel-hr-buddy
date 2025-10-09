import * as Sentry from "@sentry/react";

/**
 * Sentry Configuration for Nautilus One
 * Provides error monitoring and performance tracking for the application
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || "development";
  
  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn("Sentry DSN not configured. Error monitoring is disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    
    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Enable performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Filter out some errors
    ignoreErrors: [
      // Random plugins/extensions
      "top.GLOBALS",
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      "http://tt.epicplay.com",
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",
      "http://loading.retry.widdit.com/",
      "atomicFindClose",
      // Facebook borked
      "fb_xd_fragment",
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
      // reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268
      "bmi_SafeAddOnload",
      "EBCallBackMessageReceived",
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      "conduitPage",
    ],
    
    // Filter out URLs from certain sources
    denyUrls: [
      // Google Adsense
      /pagead\/js/i,
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    ],
    
    // Set user context
    beforeSend(event) {
      // Filter out development errors if needed
      if (environment === "development") {
        console.log("Sentry Event (dev):", event);
      }
      return event;
    },
  });
};
