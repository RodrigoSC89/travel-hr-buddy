import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * TipTap rich text editor component
 * Supports editing with full HTML formatting (bold, italic, lists, headers)
 * @param content - The initial content to display (HTML or plain text)
 * @param onChange - Callback when content changes
 * @param readOnly - Whether the editor is read-only (default: false)
 * @param className - Additional CSS classes
 */
export default function TipTapEditor({ 
  content, 
  onChange, 
  readOnly = false, 
  className = "" 
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`border rounded-lg bg-white ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
