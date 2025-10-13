'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { Button } from '@/components/ui/button'
import { debounce } from 'lodash'

export default function DocumentEditor({ documentId }: { documentId: string }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<WebrtcProvider | null>(null)
  const ydoc = useRef<Y.Doc>(new Y.Doc())
  const versionRef = useRef<any[]>([])

  useEffect(() => {
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    fetchSession()
  }, [supabase])

  useEffect(() => {
    if (!user) return
    const roomName = `doc-${documentId}`
    const webrtcProvider = new WebrtcProvider(roomName, ydoc.current)
    setProvider(webrtcProvider)
    return () => webrtcProvider.destroy()
  }, [user, documentId])

  async function saveContentToDB(content: string) {
    const { error } = await supabase.from('documents').upsert({
      id: documentId,
      content,
      updated_by: user?.id,
    })
    if (!error) {
      versionRef.current.push({ content, saved_at: new Date().toISOString() })
    }
  }

  const debouncedSave = useRef(
    debounce((html) => saveContentToDB(html), 3000)
  ).current

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({ document: ydoc.current }),
      CollaborationCursor.configure({
        provider: provider!,
        user: {
          name: user?.email || 'User',
          color: '#58a6ff',
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      debouncedSave(html)
    },
  })

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📝 Editor Colaborativo</h1>
      <EditorContent
        editor={editor}
        className="border rounded-md p-4 bg-white min-h-[400px]"
      />
      <div className="flex gap-4 mt-2">
        <Button
          variant="outline"
          onClick={() => editor?.commands.setContent('')}
        >
          🧹 Limpar
        </Button>
        <Button
          onClick={() => {
            const last = versionRef.current?.at(-1)
            if (last?.content) editor?.commands.setContent(last.content)
          }}
        >
          ♻️ Restaurar Última Versão
        </Button>
      </div>
    </div>
  )
}
