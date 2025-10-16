import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TipTapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onUpdate, placeholder = "Digite o conteúdo aqui..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || `<p>${placeholder}</p>`,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || `<p>${placeholder}</p>`);
    }
  }, [content, editor, placeholder]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-white">
      <EditorContent editor={editor} />
    </div>
  );
}
