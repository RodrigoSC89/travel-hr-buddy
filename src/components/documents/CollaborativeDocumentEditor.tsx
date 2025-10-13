"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Doc as YDoc } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Users } from "lucide-react";

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
  const ydoc = useRef<YDoc | null>(null);
  const provider = useRef<WebrtcProvider | null>(null);

  // Generate a random color for user cursor
  const randomColor = useRef(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );

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
          // @ts-ignore
          ext.options.document = ydoc.current;
        }
        if (ext.name === "collaborationCursor") {
          // @ts-ignore
          ext.options.provider = provider.current;
        }
      });
    }

    // Cleanup
    return () => {
      if (provider.current) {
        provider.current.destroy();
      }
      if (ydoc.current) {
        ydoc.current.destroy();
      }
    };
  }, [documentId]);

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{connectedUsers + 1} online</span>
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
        </div>
      </CardContent>
    </Card>
  );
}
