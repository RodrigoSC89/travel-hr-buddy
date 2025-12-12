import { useEffect, useState, useCallback } from "react";;

/**
 * PATCH 417: Document Templates WYSIWYG Editor
 * TipTap-based rich text editor with dynamic placeholders
 */

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Code,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  Braces
} from "lucide-react";

interface TemplateEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  variables?: string[];
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialContent = "",
  onChange,
  placeholder = "Start typing your template...",
  variables = []
}) => {
  const [charCount, setCharCount] = useState({ characters: 0, words: 0 });
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
      // Update character and word count manually
      const text = editor.getText();
      setCharCount({
        characters: text.length,
        words: text.split(/\s+/).filter(word => word.length > 0).length
};
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4"
      }
    }
  });

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${variable}}}`).run();
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const MenuButton = ({ onClick, active, children, title }: unknown: unknown: unknown) => (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      type="button"
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Template Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-zinc-900/50 rounded-lg border border-zinc-700">
          {/* Text Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>

          <Separator orientation="vertical" className="mx-1 h-8" />

          {/* Headings */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </MenuButton>

          <Separator orientation="vertical" className="mx-1 h-8" />

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </MenuButton>

          <Separator orientation="vertical" className="mx-1 h-8" />

          {/* Undo/Redo */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Variables Panel */}
        {variables.length > 0 && (
          <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Braces className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold">Available Variables</span>
              <Badge variant="outline" className="ml-auto text-xs">
                Click to insert
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => handleinsertVariable}
                  className="text-xs"
                  type="button"
                >
                  {`{{${variable}}}`}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Variables will be replaced with actual data when the template is used
            </p>
          </div>
        )}

        {/* Editor */}
        <div className="border border-zinc-700 rounded-lg bg-zinc-950 min-h-[400px]">
          <EditorContent editor={editor} />
        </div>

        {/* Editor Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{charCount.characters} characters</div>
          <div>{charCount.words} words</div>
        </div>
      </CardContent>
    </Card>
  );
};
