"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import { FileText, Users, Save } from "lucide-react";

interface CollaborativeDocumentEditorProps {
  documentId: string;
  initialTitle?: string;
}

export function CollaborativeDocumentEditor({ 
  documentId,
  initialTitle = "Untitled Document"
}: CollaborativeDocumentEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const ydoc = useRef<YDoc | null>(null);
  const provider = useRef<WebrtcProvider | null>(null);

  // Generate a random color for user cursor
  const randomColor = useRef(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );

  // Save content to database
  const saveToDatabase = useCallback(async (content: string) => {
    if (!user) return;

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
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: "Failed to save document to database",
        variant: "destructive",
      });
    }
  }, [documentId, user]);

  // Debounced save function - 3 seconds delay
  const debouncedSave = useRef(
    debounce((content: string) => {
      saveToDatabase(content);
    }, 3000)
  ).current;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc.current || new YDoc(),
      }),
      CollaborationCursor.configure({
        provider: provider.current,
        user: {
          name: user?.email || "Anonymous User",
          color: randomColor.current,
        },
      }),
    ],
    content: "<p>Start typing to collaborate in real-time...</p>",
    onUpdate: ({ editor }) => {
      // Trigger debounced save on content change
      const content = editor.getHTML();
      debouncedSave(content);
    },
  });

  useEffect(() => {
    // Initialize Yjs document
    ydoc.current = new YDoc();

    // Setup WebRTC provider for peer-to-peer communication
    provider.current = new WebrtcProvider(`doc-${documentId}`, ydoc.current, {
      signaling: ["wss://signaling.yjs.dev"],
    });

    // Track connected users
    provider.current.on("peers", (event: { added: string[]; removed: string[]; webrtcPeers: string[] }) => {
      setConnectedUsers(event.webrtcPeers.length);
    });

    // Update editor with collaboration extensions
    if (editor && !editor.isDestroyed) {
      editor.extensionManager.extensions.forEach((ext) => {
        if (ext.name === "collaboration") {
          // @ts-expect-error - TipTap extension options are not fully typed
          ext.options.document = ydoc.current;
        }
        if (ext.name === "collaborationCursor") {
          // @ts-expect-error - TipTap extension options are not fully typed
          ext.options.provider = provider.current;
        }
      });
    }

    // Cleanup
    return () => {
      // Cancel any pending debounced saves
      debouncedSave.cancel();
      
      if (provider.current) {
        provider.current.destroy();
      }
      if (ydoc.current) {
        ydoc.current.destroy();
      }
    };
  }, [documentId, debouncedSave]);

  const handleClear = () => {
    if (editor) {
      editor.commands.setContent("<p>Start typing to collaborate in real-time...</p>");
    }
  };

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
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{connectedUsers + 1} online</span>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleClear} variant="outline" size="sm">
            Clear Content
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 This is a real-time collaborative editor</p>
          <p>👥 Share the document ID with others to collaborate</p>
          <p>🔄 Changes sync automatically across all connected users</p>
          <p>💾 Auto-save: {saveCount} saves | Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : "Not saved yet"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
