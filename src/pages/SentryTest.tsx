import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bug, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import * as Sentry from "@sentry/react";

/**
 * Sentry Test Page
 * This page helps developers test Sentry integration by triggering various error scenarios
 * Only accessible in development mode or for testing purposes
 */
const SentryTest = () => {
  const [lastError, setLastError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleThrowError = () => {
    setLastError("Synchronous error thrown");
    setSuccessMessage("");
    throw new Error("Test Error: This is a synchronous error thrown to test Sentry");
  };

  const handleAsyncError = async () => {
    setLastError("Async error thrown");
    setSuccessMessage("");
    await Promise.reject(new Error("Test Error: This is an async/promise error"));
  };

  const handleCaptureException = () => {
    const error = new Error("Test Error: Manually captured exception");
    Sentry.captureException(error, {
      tags: {
        testType: "manual-capture",
        page: "sentry-test",
      },
      extra: {
        testData: "This is additional context data",
        timestamp: new Date().toISOString(),
      },
    });
    setSuccessMessage("Exception manually captured and sent to Sentry");
    setLastError("");
  };

  const handleCaptureMessage = () => {
    Sentry.captureMessage("Test Message: This is a test message for Sentry", {
      level: "info",
      tags: {
        testType: "message",
        page: "sentry-test",
      },
    });
    setSuccessMessage("Test message sent to Sentry");
    setLastError("");
  };

  const handleNetworkError = async () => {
    setLastError("Network error triggered");
    setSuccessMessage("");
    try {
      await fetch("https://api.example.com/nonexistent-endpoint");
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          testType: "network-error",
        },
      });
    }
  };

  const handleSetUserContext = () => {
    Sentry.setUser({
      id: "test-user-123",
      email: "test@nautilus-one.com",
      username: "Test User",
    });
    setSuccessMessage("User context set in Sentry");
    setLastError("");
  };

  const handleAddBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: "test",
      message: "User clicked test breadcrumb button",
      level: "info",
    });
    setSuccessMessage("Breadcrumb added to Sentry");
    setLastError("");
  };

  const isSentryConfigured = !!import.meta.env.VITE_SENTRY_DSN;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Bug className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sentry Test Page</h1>
              <p className="text-muted-foreground">
                Test error monitoring and exception tracking
              </p>
            </div>
          </div>

          {!isSentryConfigured && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sentry Not Configured</AlertTitle>
              <AlertDescription>
                VITE_SENTRY_DSN is not set. Please add it to your .env file to test Sentry integration.
              </AlertDescription>
            </Alert>
          )}

          {isSentryConfigured && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Sentry Configured</AlertTitle>
              <AlertDescription>
                Sentry is configured and ready to capture errors.
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {lastError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Triggered</AlertTitle>
              <AlertDescription>{lastError}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Error Test Actions</CardTitle>
              <CardDescription>
                Click any button below to test different error scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="destructive"
                  onClick={handleThrowError}
                  className="w-full"
                >
                  Throw Synchronous Error
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleAsyncError}
                  className="w-full"
                >
                  Throw Async Error
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCaptureException}
                  className="w-full"
                >
                  Capture Exception Manually
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCaptureMessage}
                  className="w-full"
                >
                  Send Test Message
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNetworkError}
                  className="w-full"
                >
                  Trigger Network Error
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleSetUserContext}
                  className="w-full"
                >
                  Set User Context
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleAddBreadcrumb}
                  className="w-full"
                >
                  Add Breadcrumb
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Info className="inline h-5 w-5 mr-2" />
                Testing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>1. Synchronous Error:</strong> Throws an error immediately, should be caught by ErrorBoundary
              </p>
              <p>
                <strong>2. Async Error:</strong> Throws an error in a Promise, should be reported to Sentry
              </p>
              <p>
                <strong>3. Manual Capture:</strong> Manually captures and sends an exception to Sentry with context
              </p>
              <p>
                <strong>4. Test Message:</strong> Sends a simple message to Sentry for logging
              </p>
              <p>
                <strong>5. Network Error:</strong> Simulates a failed network request
              </p>
              <p>
                <strong>6. User Context:</strong> Sets user information in Sentry for better error tracking
              </p>
              <p>
                <strong>7. Breadcrumb:</strong> Adds a breadcrumb trail to help debug errors
              </p>
              <p className="mt-4 pt-4 border-t">
                After triggering errors, check your Sentry dashboard to see if they were captured correctly.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SentryTest;
