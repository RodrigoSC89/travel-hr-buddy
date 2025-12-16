import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TipTapEditorProps {
  content: string | object;
  onChange?: (content: string | object) => void;
  className?: string;
  editable?: boolean;
}

/**
 * TipTap rich text editor component
 * Supports both string (HTML) and object (JSON) content formats
 * @param content - Initial content (HTML string or TipTap JSON object)
 * @param onChange - Callback when content changes
 * @param className - Additional CSS classes
 * @param editable - Whether the editor is editable (default: true)
 */
export default function TipTapEditor({
  content,
  onChange,
  className = "",
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: editable,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        // Try to return content in the same format it was provided
        if (typeof content === "string") {
          onChange(editor.getHTML());
        } else {
          onChange(editor.getJSON());
        }
      }
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent =
        typeof content === "string" ? editor.getHTML() : editor.getJSON();

      // Only update if content has actually changed to avoid cursor jumps
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  return (
    <div className={`border rounded-lg bg-white ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
