"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string | object;
  onChange: (content: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: typeof content === "object" ? JSON.stringify(content) : content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (!editor) return;
    
    const currentContent = editor.getHTML();
    const newContent = typeof content === "object" ? JSON.stringify(content) : content;
    
    // Only update if content has actually changed
    if (currentContent !== newContent && newContent !== "") {
      editor.commands.setContent(newContent);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-white">
      <EditorContent editor={editor} />
    </div>
  );
}
