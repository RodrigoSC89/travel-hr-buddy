import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content, onUpdate, placeholder = "Digite o conteúdo aqui..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[300px] p-4 border rounded-md",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
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
