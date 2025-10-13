import React, { useState } from 'react';
import DocumentEditor from '@/components/documents/DocumentEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Copy, Check } from 'lucide-react';

const DocumentEditorDemo = () => {
  const [documentId, setDocumentId] = useState<string>(() => {
    // Generate a random UUID for demo purposes
    return crypto.randomUUID();
  });
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(documentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewId = () => {
    setDocumentId(crypto.randomUUID());
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaborative Document Editor Demo</CardTitle>
          <CardDescription>
            Test real-time collaborative editing with multiple users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>How to Test Collaboration</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Copy the Document ID below</li>
                <li>Open this page in multiple browser tabs or different browsers</li>
                <li>Use the same Document ID in all tabs</li>
                <li>Start editing - changes will sync in real-time!</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="documentId">Document ID</Label>
            <div className="flex gap-2">
              <Input
                id="documentId"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Enter or generate a document ID"
              />
              <Button onClick={handleCopyId} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button onClick={generateNewId} variant="outline">
                Generate New
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this ID with others to collaborate on the same document
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>Real-time Collaboration:</strong> Multiple users can edit simultaneously using WebRTC peer-to-peer connections</li>
            <li><strong>Auto-save:</strong> Changes are automatically saved to Supabase after 3 seconds of inactivity</li>
            <li><strong>User Presence:</strong> See other users' cursors and names while editing</li>
            <li><strong>Version History:</strong> Local version tracking with restore capability (last 10 versions)</li>
            <li><strong>Rich Text Editing:</strong> Full TipTap StarterKit features including headings, bold, italic, lists, etc.</li>
          </ul>
        </CardContent>
      </Card>

      <DocumentEditor documentId={documentId} />

      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Architecture</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`User Input → TipTap Editor → Yjs CRDT → WebRTC Provider → Other Users
                  ↓
            Debounced Save (3s)
                  ↓
          Supabase Database`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Dependencies</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>@tiptap/react - React editor component</li>
                <li>@tiptap/starter-kit - Rich text editing features</li>
                <li>@tiptap/extension-collaboration - Collaborative editing</li>
                <li>@tiptap/extension-collaboration-cursor - User presence</li>
                <li>yjs - CRDT library for conflict-free merging</li>
                <li>y-webrtc - WebRTC provider for peer-to-peer sync</li>
                <li>lodash - Utility functions (debounce)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Security</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Authentication required for all operations</li>
                <li>Row Level Security (RLS) enabled on database table</li>
                <li>User tracking on all document updates</li>
                <li>WebRTC peer-to-peer encryption</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentEditorDemo;
