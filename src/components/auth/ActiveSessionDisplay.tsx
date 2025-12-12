/**
 * PATCH 510: Active Session Display Component
 * Show current session information to users
 */

import { memo, memo, useEffect, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Clock, 
  User, 
  LogOut, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw 
} from "lucide-react";
import { 
  getSessionMetadata, 
  secureLogout,
  initializeTokenRefresh 
} from "@/services/enhanced-auth-service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";

interface SessionMetadata {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  expiresIn: string;
  tokenType: string;
  isExpiring: boolean;
}

export const ActiveSessionDisplay = memo(function() {
  const [session, setSession] = useState<SessionMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessionInfo();
    
    // Initialize auto-refresh
    const tokenManager = initializeTokenRefresh();

    // Refresh session info every minute
    const interval = setInterval(loadSessionInfo, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadSessionInfo = async () => {
    try {
      setLoading(true);
      const metadata = await getSessionMetadata();
      setSession(metadata);
    } catch (error) {
      logger.error("Error loading session:", error);
      toast({
        title: "Error",
        description: "Failed to load session information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const result = await secureLogout();

      if (!result.success) {
        throw new Error(result.error || "Logout failed");
      }

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      navigate("/auth/login");
    } catch (error) {
      logger.error("Logout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading session...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No active session found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {session.isExpiring && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your session is expiring soon. The system will automatically refresh your token.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Active Session
              </CardTitle>
              <CardDescription>Your current authentication session</CardDescription>
            </div>
            <Badge variant={session.isExpiring ? "destructive" : "default"}>
              {session.isExpiring ? "Expiring Soon" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                Email
              </div>
              <div className="font-medium">{session.email}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Expires In
              </div>
              <div className="font-medium">{session.expiresIn}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Token Type</div>
              <div className="font-medium">{session.tokenType}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">User ID</div>
              <div className="font-mono text-xs">{session.userId.slice(0, 20)}...</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Session Created</div>
              <div className="text-sm">{session.createdAt}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Expires At</div>
              <div className="text-sm">{session.expiresAt}</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">
                  Automatic token refresh enabled
                </span>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loggingOut ? "Logging out..." : "Secure Logout"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>JWT tokens with automatic refresh</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure token invalidation on logout</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Session expiry monitoring</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Row-level security (RLS) enabled</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
});
