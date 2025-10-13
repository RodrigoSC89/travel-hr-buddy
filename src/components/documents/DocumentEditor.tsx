import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Doc as YDoc } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { Button } from "@/components/ui/button";
import { useAuthProfile } from "@/hooks/use-auth-profile";

interface DocumentEditorProps {
  documentId: string;
}

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const { profile } = useAuthProfile();
  const ydoc = useRef<YDoc>(new YDoc());
  const provider = useRef<WebrtcProvider | null>(null);
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    // Initialize WebRTC provider for peer-to-peer sync
    const roomName = `doc-${documentId}`;
    provider.current = new WebrtcProvider(roomName, ydoc.current, {
      signaling: ["wss://signaling.yjs.dev"],
    });

    // Wait for provider to be ready
    setProviderReady(true);

    return () => {
      provider.current?.destroy();
      setProviderReady(false);
    };
  }, [documentId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable default history, Yjs handles it
      }),
      Collaboration.configure({
        document: ydoc.current,
      }),
      ...(providerReady && provider.current ? [
        CollaborationCursor.configure({
          provider: provider.current,
          user: {
            name: profile?.email || "Anonymous User",
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
          },
        })
      ] : []),
    ],
    content: "",
  }, [providerReady]);

  const clearContent = () => {
    editor?.commands.clearContent();
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Document: {documentId}</h2>
        <Button onClick={clearContent} variant="outline">
          Clear Content
        </Button>
      </div>
      <div className="border rounded-lg p-4 min-h-[500px] bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
