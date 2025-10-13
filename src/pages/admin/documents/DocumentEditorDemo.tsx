import { useState, useEffect } from "react";
import DocumentEditor from "@/components/documents/DocumentEditor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function DocumentEditorDemo() {
  const [documentId, setDocumentId] = useState<string>("");

  useEffect(() => {
    // Generate or retrieve a document ID
    const existingId = localStorage.getItem("demo-document-id");
    if (existingId) {
      setDocumentId(existingId);
    } else {
      const newId = generateUUID();
      localStorage.setItem("demo-document-id", newId);
      setDocumentId(newId);
    }
  }, []);

  const createNewDocument = () => {
    const newId = generateUUID();
    localStorage.setItem("demo-document-id", newId);
    setDocumentId(newId);
    window.location.reload();
  };

  if (!documentId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📝 Collaborative Document Editor Demo</CardTitle>
          <CardDescription>
            This is a demonstration of the collaborative document editor with real-time
            editing capabilities powered by TipTap, Yjs, and WebRTC.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Document ID: <code className="bg-muted px-2 py-1 rounded">{documentId}</code>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                💡 Open this page in multiple browser tabs or windows to see real-time
                collaboration in action!
              </p>
            </div>
            <Button onClick={createNewDocument} variant="outline">
              Create New Document
            </Button>
          </div>
        </CardContent>
      </Card>

      <DocumentEditor documentId={documentId} />

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ Real-time collaborative editing with WebRTC</li>
            <li>✅ Auto-save to Supabase database (3-second debounce)</li>
            <li>✅ Version history tracking</li>
            <li>✅ User cursor tracking and presence</li>
            <li>✅ Rich text editing with TipTap</li>
            <li>✅ Clear and restore functionality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
