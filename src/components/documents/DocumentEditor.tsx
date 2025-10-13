"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { debounce } from "lodash";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Users, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentEditorProps {
  documentId: string;
}

// Generate random color for user cursor
const getRandomColor = () => {
  const colors = [
    "#958DF1",
    "#F98181",
    "#FBBC88",
    "#FAF594",
    "#70CFF8",
    "#94FADB",
    "#B9F18D",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [versions, setVersions] = useState<number>(0);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);

  // Initialize Yjs document and WebRTC provider
  useEffect(() => {
    if (!documentId) return;

    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create WebRTC provider for P2P sync
    const provider = new WebrtcProvider(documentId, ydoc, {
      signaling: ["wss://signaling.yjs.dev"],
    });
    providerRef.current = provider;

    // Track connected users
    provider.on("peers", ({ added, removed, webrtcPeers }) => {
      setConnectedUsers(webrtcPeers.length + 1); // +1 for current user
    });

    // Load initial content from database
    loadInitialContent(ydoc);

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  // Load initial content from database
  const loadInitialContent = async (ydoc: Y.Doc) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("content")
        .eq("id", documentId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data?.content) {
        const yXmlFragment = ydoc.getXmlFragment("prosemirror");
        // Content already exists, Yjs will sync it
      }
    } catch (error) {
      console.error("Error loading document:", error);
    }
  };

  // Debounced save function
  const saveToDatabase = debounce(async (content: string) => {
    if (!user || !documentId) return;

    setSaving(true);
    try {
      // Save to documents table
      const { error: docError } = await supabase.from("documents").upsert({
        id: documentId,
        content,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      });

      if (docError) throw docError;

      setLastSaved(new Date());
      setVersions((prev) => prev + 1);
      
      toast({
        title: "Auto-save completed",
        description: "Document saved automatically",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Save error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, 3000);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable default history, use Yjs
      }),
      Collaboration.configure({
        document: ydocRef.current!,
      }),
      CollaborationCursor.configure({
        provider: providerRef.current!,
        user: {
          name: user?.email || "Anonymous",
          color: getRandomColor(),
        },
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      saveToDatabase(html);
    },
  });

  // Manual save
  const handleManualSave = async () => {
    if (!editor || !user) return;

    setSaving(true);
    try {
      const content = editor.getHTML();

      const { error } = await supabase.from("documents").upsert({
        id: documentId,
        content,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setLastSaved(new Date());
      setVersions((prev) => prev + 1);
      
      toast({
        title: "Document saved",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Save error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📝 Collaborative Document Editor
          </span>
          <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {connectedUsers} user{connectedUsers !== 1 ? "s" : ""}
            </span>
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TipTap Editor Menu Bar */}
        <div className="border rounded-md p-2 flex gap-2 flex-wrap bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-primary/20" : ""}
          >
            <strong>B</strong>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-primary/20" : ""}
          >
            <em>I</em>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-primary/20" : ""}
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-primary/20" : ""}
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-primary/20" : ""}
          >
            • List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "bg-primary/20" : ""}
          >
            {"</>"}
          </Button>
        </div>

        {/* Editor Content */}
        <div className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>

        {/* Save Button and Status */}
        <div className="flex items-center justify-between">
          <Button onClick={handleManualSave} disabled={saving}>
            {saving ? (
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

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💾 Auto-save: Every 3 seconds after changes</p>
            <p>🔄 Versions saved: {versions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
