import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle2,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';

interface TokenValidation {
  valid: boolean;
  vessel_id: string | null;
  organization_id: string | null;
  can_view_audits: boolean;
  can_view_documents: boolean;
  can_view_metrics: boolean;
  auditor_name: string | null;
  expires_at: string | null;
}

export default function CertViewer() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<TokenValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) {
      setError('No token provided');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get IP and user agent
      const userAgent = navigator.userAgent;
      
      const { data, error: rpcError } = await supabase.rpc('validate_cert_token', {
        p_token: token,
        p_ip_address: null, // Would need server-side to get real IP
        p_user_agent: userAgent
      });

      if (rpcError) {
        throw rpcError;
      }

      if (!data || data.length === 0 || !data[0].valid) {
        setError('Invalid or expired token');
        setValidation(null);
      } else {
        setValidation(data[0]);
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError('Failed to validate token');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating access token...</p>
        </div>
      </div>
    );
  }

  if (error || !validation?.valid) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              {error || 'The certification token is invalid or has expired'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Token Validation Failed</AlertTitle>
              <AlertDescription>
                Please contact the organization administrator for a valid access token.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expiresAt = validation.expires_at ? new Date(validation.expires_at) : null;
  const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">External Auditor Access</h1>
                <p className="text-sm text-muted-foreground">
                  Read-only certification viewer
                </p>
              </div>
            </div>
            {validation.auditor_name && (
              <Badge variant="outline" className="text-sm">
                {validation.auditor_name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Token Info Banner */}
      {expiresAt && (
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Token expires: {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
                </span>
              </div>
              {isExpiringSoon && (
                <Badge variant="destructive" className="animate-pulse">
                  Expiring Soon
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Info className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            {validation.can_view_audits && (
              <TabsTrigger value="audits">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Audits
              </TabsTrigger>
            )}
            {validation.can_view_documents && (
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            )}
            {validation.can_view_metrics && (
              <TabsTrigger value="metrics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Permissions</CardTitle>
                <CardDescription>
                  Your current access level and available sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    {validation.can_view_audits ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Audit Access</p>
                      <p className="text-sm text-muted-foreground">
                        {validation.can_view_audits ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    {validation.can_view_documents ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Document Access</p>
                      <p className="text-sm text-muted-foreground">
                        {validation.can_view_documents ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    {validation.can_view_metrics ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Metrics Access</p>
                      <p className="text-sm text-muted-foreground">
                        {validation.can_view_metrics ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Read-Only Access</AlertTitle>
                  <AlertDescription>
                    This is a read-only view. You cannot modify any data. All access is logged for security purposes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audits Tab */}
          {validation.can_view_audits && (
            <TabsContent value="audits">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Information</CardTitle>
                  <CardDescription>
                    View vessel audit records and compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Audit data would be displayed here. This is a placeholder for the actual implementation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Documents Tab */}
          {validation.can_view_documents && (
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Certification Documents</CardTitle>
                  <CardDescription>
                    View and download vessel certification documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Document list would be displayed here. This is a placeholder for the actual implementation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Metrics Tab */}
          {validation.can_view_metrics && (
            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Metrics</CardTitle>
                  <CardDescription>
                    View vessel safety and compliance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Metrics and charts would be displayed here. This is a placeholder for the actual implementation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
