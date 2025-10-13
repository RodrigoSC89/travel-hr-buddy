import { useEffect, useState, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

export default function DocumentEditor({ documentId }: { documentId: string }) {
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<WebrtcProvider | null>(null)
  const ydoc = useRef<Y.Doc>(new Y.Doc())

  useEffect(() => {
    async function fetchSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    fetchSession()
  }, [])

  useEffect(() => {
    if (!user) return
    const roomName = `doc-${documentId}`
    const webrtcProvider = new WebrtcProvider(roomName, ydoc.current)
    setProvider(webrtcProvider)
    return () => webrtcProvider.destroy()
  }, [user, documentId])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({ document: ydoc.current }),
      ...(provider ? [
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: user?.email || 'User',
            color: '#58a6ff'
          }
        })
      ] : [])
    ],
    content: ''
  }, [provider, user])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📝 Editor Colaborativo - Documento #{documentId}</h1>
      <EditorContent editor={editor} className="border rounded-md p-4 bg-white min-h-[400px]" />
      <Button variant="outline" onClick={() => editor?.commands.setContent('')}>🧹 Limpar</Button>
    </div>
  )
}
