import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical,
  Key,
  Webhook,
  Link2,
  Power,
  Trash2,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Integration } from '../index';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onToggle,
  onDelete,
  onRefresh,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const getTypeIcon = () => {
    switch (integration.type) {
      case 'oauth2':
        return <Key className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      default:
        return <Link2 className="h-4 w-4" />;
    }
  };

  const handleTestIntegration = async () => {
    setIsTesting(true);
    try {
      if (integration.type === 'webhook') {
        // Test webhook by sending a test payload
        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-handler?integration_id=${integration.id}`;
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            message: 'Test webhook from Integrations Hub',
          }),
        });

        if (response.ok) {
          toast({
            title: 'Webhook test successful',
            description: 'Test payload sent successfully',
          });
        } else {
          throw new Error('Webhook test failed');
        }
      } else if (integration.type === 'oauth2') {
        // Check OAuth token validity
        const { data, error } = await supabase
          .from('integrations_registry')
          .select('oauth_token_expires_at')
          .eq('id', integration.id)
          .single();

        if (error) throw error;

        const expiresAt = new Date(data.oauth_token_expires_at);
        const now = new Date();

        if (expiresAt > now) {
          toast({
            title: 'OAuth token valid',
            description: `Token expires on ${expiresAt.toLocaleString()}`,
          });
        } else {
          toast({
            title: 'OAuth token expired',
            description: 'Please re-authenticate',
            variant: 'destructive',
          });
        }
      }

      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleTestIntegration} disabled={isTesting}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Integration
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggle(integration.id, !integration.is_active)}
              >
                <Power className="h-4 w-4 mr-2" />
                {integration.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Provider</span>
              <Badge variant="outline" className="capitalize">
                {integration.provider}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="secondary" className="capitalize">
                {integration.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {integration.is_active ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Created {new Date(integration.created_at).toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{integration.name}"? This action cannot be
              undone and all associated logs will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(integration.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
