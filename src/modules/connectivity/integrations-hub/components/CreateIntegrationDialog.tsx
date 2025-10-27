import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => void;
}

export const CreateIntegrationDialog: React.FC<CreateIntegrationDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'oauth2',
    provider: '',
    oauth_client_id: '',
    oauth_client_secret: '',
    oauth_redirect_uri: '',
    webhook_url: '',
    webhook_secret: '',
    config: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      type: 'oauth2',
      provider: '',
      oauth_client_id: '',
      oauth_client_secret: '',
      oauth_redirect_uri: '',
      webhook_url: '',
      webhook_secret: '',
      config: {},
    });
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Integration</DialogTitle>
          <DialogDescription>
            Configure a new OAuth or webhook integration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Google Integration"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Integration Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData({ ...formData, provider: value })}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="make">Make.com</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'oauth2' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="oauth_client_id">Client ID</Label>
                <Input
                  id="oauth_client_id"
                  value={formData.oauth_client_id}
                  onChange={(e) =>
                    setFormData({ ...formData, oauth_client_id: e.target.value })
                  }
                  placeholder="Enter OAuth client ID"
                  required={formData.type === 'oauth2'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oauth_client_secret">Client Secret</Label>
                <Input
                  id="oauth_client_secret"
                  type="password"
                  value={formData.oauth_client_secret}
                  onChange={(e) =>
                    setFormData({ ...formData, oauth_client_secret: e.target.value })
                  }
                  placeholder="Enter OAuth client secret"
                  required={formData.type === 'oauth2'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oauth_redirect_uri">Redirect URI</Label>
                <Input
                  id="oauth_redirect_uri"
                  value={formData.oauth_redirect_uri}
                  onChange={(e) =>
                    setFormData({ ...formData, oauth_redirect_uri: e.target.value })
                  }
                  placeholder="https://your-app.com/oauth/callback"
                  required={formData.type === 'oauth2'}
                />
              </div>
            </>
          )}

          {formData.type === 'webhook' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={formData.webhook_url}
                  onChange={(e) =>
                    setFormData({ ...formData, webhook_url: e.target.value })
                  }
                  placeholder="https://your-webhook-endpoint.com"
                  required={formData.type === 'webhook'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) =>
                    setFormData({ ...formData, webhook_secret: e.target.value })
                  }
                  placeholder="Enter webhook signing secret"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Integration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
