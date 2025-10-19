import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TipTapPreviewProps {
  content: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * TipTap editor component for previewing content
 * @param content - The content to display (HTML or plain text)
 * @param readOnly - Whether the editor is read-only (default: true)
 * @param className - Additional CSS classes
 */
export default function TipTapPreview({ content, readOnly = true, className = "" }: TipTapPreviewProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${className}`,
      },
    },
  });

  return (
    <div className={`border rounded-lg bg-white ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
