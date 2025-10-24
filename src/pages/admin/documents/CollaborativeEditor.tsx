import { useParams, useNavigate } from "react-router-dom";
import { CollaborativeDocumentEditor } from "@/components/documents/CollaborativeDocumentEditor";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CollaborativeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Invalid Document ID</h1>
            <p className="text-muted-foreground">
              Please provide a valid document ID in the URL
            </p>
            <Button onClick={() => navigate("/admin/documents")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Collaborative Editor</h1>
              <p className="text-muted-foreground">
                Real-time document collaboration with TipTap + Yjs + WebRTC
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/documents")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <CollaborativeDocumentEditor documentId={id} />

          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-semibold">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open this same URL in another browser tab or share with colleagues</li>
              <li>Start typing - changes will appear in real-time for all users</li>
              <li>See cursor positions of other users as they type</li>
              <li>All changes are synchronized via WebRTC peer-to-peer connection</li>
            </ol>
          </div>
        </div>
      </div>
    </RoleBasedAccess>
  );
}
