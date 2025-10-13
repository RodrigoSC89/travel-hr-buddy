import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { debounce } from 'lodash';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DocumentEditorProps {
  documentId: string;
}

interface Version {
  content: string;
  timestamp: number;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  // Initialize collaboration provider
  useEffect(() => {
    const webrtcProvider = new WebrtcProvider(
      `document-${documentId}`,
      ydoc,
      {
        signaling: ['wss://signaling.yjs.dev'],
      }
    );

    webrtcProvider.on('status', (event: { status: string }) => {
      console.log('WebRTC status:', event.status);
    });

    setProvider(webrtcProvider);

    return () => {
      webrtcProvider.destroy();
    };
  }, [documentId, ydoc]);

  // Load initial content from Supabase
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('content')
          .eq('id', documentId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data?.content) {
          const fragment = ydoc.getXmlFragment('prosemirror');
          if (fragment.length === 0) {
            // Only load if document is empty
            const tempEditor = useEditor({
              extensions: [StarterKit],
              content: data.content,
            });
            
            if (tempEditor) {
              // Convert HTML to Yjs structure
              const prosemirrorJSON = tempEditor.getJSON();
              // This is a simplified approach - in production you'd use proper Yjs conversion
              tempEditor.destroy();
            }
          }
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: 'Error',
          description: 'Failed to load document',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (provider) {
      loadDocument();
    }
  }, [documentId, provider, ydoc, toast]);

  // Auto-save functionality with debounce
  const saveDocument = useCallback(
    async (content: string) => {
      try {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { error } = await supabase
          .from('documents')
          .upsert({
            id: documentId,
            content,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        // Save version to local history
        setVersions(prev => [
          ...prev,
          { content, timestamp: Date.now() }
        ].slice(-10)); // Keep last 10 versions
      } catch (error) {
        console.error('Error saving document:', error);
        toast({
          title: 'Error',
          description: 'Failed to save document',
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [documentId, toast]
  );

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((content: string) => {
      saveDocument(content);
    }, 3000),
    [saveDocument]
  );

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable history since we're using Yjs
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider || undefined,
        user: {
          name: 'Anonymous User',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave(html);
    },
  }, [provider, ydoc]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleClear = () => {
    if (editor && confirm('Are you sure you want to clear the document?')) {
      editor.commands.clearContent();
      toast({
        title: 'Document cleared',
        description: 'The document has been cleared',
      });
    }
  };

  const handleRestore = () => {
    if (versions.length === 0) {
      toast({
        title: 'No versions available',
        description: 'There are no previous versions to restore',
      });
      return;
    }

    if (editor && confirm('Restore the previous version?')) {
      const lastVersion = versions[versions.length - 1];
      editor.commands.setContent(lastVersion.content);
      toast({
        title: 'Version restored',
        description: 'The previous version has been restored',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collaborative Document Editor</span>
          {saving && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
          <Button onClick={handleRestore} variant="outline">
            Restore Previous Version
          </Button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground self-center">
            {versions.length} version(s) saved locally
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentEditor;
