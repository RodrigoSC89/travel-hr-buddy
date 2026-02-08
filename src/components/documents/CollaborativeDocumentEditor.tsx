"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Doc as YDoc } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { debounce } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Users, Save, Loader2, AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";

interface CollaborativeDocumentEditorProps {
  documentId: string;
  initialTitle?: string;
  readOnly?: boolean;
}

interface PeersEvent {
  added: string[];
  removed: string[];
  webrtcPeers: string[];
}

interface CollaborationExtensionOptions {
  document?: YDoc;
}

interface CollaborationCursorExtensionOptions {
  provider?: WebrtcProvider | null;
}

export function CollaborativeDocumentEditor({ 
  documentId,
  initialTitle = "Untitled Document",
  readOnly = false
}: CollaborativeDocumentEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const ydocRef = useRef<YDoc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const editorRef = useRef<Editor | null>(null);

  // Generate a stable color based on component mount time
  const randomColor = useRef(
    `hsl(${Date.now() % 360}, 70%, 50%)`
  );

  // Save content to database
  const saveToDatabase = useCallback(async (content: string) => {
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from("documents")
        .upsert({
          id: documentId,
          content,
          updated_by: user.id,
        });

      if (error) throw error;

      setSaveCount(prev => prev + 1);
      setLastSaved(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save document";
      logger.error("Error saving document:", error);
      setSaveError(message);
      toast({
        title: "Error saving document",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [documentId, user]);

  // Debounced save function - 3 seconds delay
  const debouncedSave = useRef(
    debounce((content: string) => {
      saveToDatabase(content);
    }, 3000)
  ).current;

  // Initialize Yjs document and provider
  useEffect(() => {
    ydocRef.current = new YDoc();

    // Setup WebRTC provider for peer-to-peer communication
    providerRef.current = new WebrtcProvider(`doc-${documentId}`, ydocRef.current, {
      signaling: ["wss://signaling.yjs.dev"],
    });

    // Track connected users
    const handlePeers = (event: PeersEvent) => {
      setConnectedUsers(event.webrtcPeers.length);
    };

    providerRef.current.on("peers", handlePeers);

    // Cleanup
    return () => {
      debouncedSave.cancel();
      
      if (providerRef.current) {
        providerRef.current.off("peers", handlePeers);
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
    };
  }, [documentId, debouncedSave]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydocRef.current ?? undefined,
      }),
      CollaborationCursor.configure({
        provider: providerRef.current ?? undefined,
        user: {
          name: user?.email ?? "Anonymous User",
          color: randomColor.current,
        },
      }),
    ],
    content: "<p>Start typing to collaborate in real-time...</p>",
    editable: !readOnly,
    onUpdate: ({ editor: updatedEditor }) => {
      const content = updatedEditor.getHTML();
      debouncedSave(content);
    },
    onCreate: ({ editor: createdEditor }) => {
      editorRef.current = createdEditor;
    },
  });

  // Update editor extensions when provider changes
  useEffect(() => {
    if (editor && !editor.isDestroyed && ydocRef.current && providerRef.current) {
      editor.extensionManager.extensions.forEach((ext) => {
        if (ext.name === "collaboration") {
          const options = ext.options as CollaborationExtensionOptions;
          options.document = ydocRef.current ?? undefined;
        }
        if (ext.name === "collaborationCursor") {
          const options = ext.options as CollaborationCursorExtensionOptions;
          options.provider = providerRef.current;
        }
      });
    }
  }, [editor]);

  const handleClear = useCallback(() => {
    if (editor) {
      editor.commands.setContent("<p>Start typing to collaborate in real-time...</p>");
    }
  }, [editor]);

  const handleManualSave = useCallback(async () => {
    if (editor) {
      debouncedSave.cancel();
      await saveToDatabase(editor.getHTML());
    }
  }, [editor, debouncedSave, saveToDatabase]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
              placeholder="Document Title"
              disabled={readOnly}
              aria-label="Document title"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2" aria-live="polite">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{connectedUsers + 1} online</span>
            </div>
            {isSaving && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Saving...</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 text-destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>Error</span>
              </div>
            )}
            {lastSaved && !isSaving && !saveError && (
              <div className="flex items-center gap-2 text-primary">
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none dark:prose-invert focus-within:ring-2 focus-within:ring-ring"
          role="textbox"
          aria-label="Document editor"
          aria-multiline="true"
        >
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleManualSave} 
            variant="default" 
            size="sm"
            disabled={readOnly || isSaving}
            aria-label="Save document now"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Now
              </>
            )}
          </Button>
          <Button 
            onClick={handleClear} 
            variant="outline" 
            size="sm"
            disabled={readOnly}
            aria-label="Clear document content"
          >
            Clear Content
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1" role="note">
          <p>💡 This is a real-time collaborative editor</p>
          <p>👥 Share the document ID with others to collaborate</p>
          <p>🔄 Changes sync automatically across all connected users</p>
          <p>💾 Auto-save: {saveCount} saves | Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : "Not saved yet"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CollaborativeDocumentEditor;
