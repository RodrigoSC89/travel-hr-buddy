import { useParams, useNavigate } from "react-router-dom";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CollaborativeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Document ID is required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/documents")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collaborative Document Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentEditor documentId={id} />
        </CardContent>
      </Card>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to use:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Open this URL in another browser tab or window to see real-time collaboration</li>
          <li>Changes appear instantly across all connected users</li>
          <li>You can see other users' cursor positions with their email addresses</li>
          <li>The document is synchronized peer-to-peer using WebRTC</li>
        </ul>
      </div>
    </div>
  );
}
