"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextB, TextItalic, ListBullets, ListNumbers, TextHOne, TextHTwo, LinkSimple } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
};

const ToolButton = ({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    aria-label={label}
    className={cn(
      "studio-focus rounded p-1",
      active ? "bg-brand-soft text-brand" : "text-muted hover:text-ink",
    )}
  >
    {children}
  </button>
);

// Inline TipTap for richtext widget fields. Emits HTML; the API sanitizes it
// again at save time.
const RichtextControl = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Write something…" })],
    content: typeof value === "string" ? value : "",
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-24 max-h-64 overflow-y-auto px-2.5 py-2 text-xs leading-relaxed focus:outline-none",
      },
    },
  });

  if (!editor) return <div className="h-24 rounded-lg border border-hairline bg-app" />;

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
      <div className="flex items-center gap-0.5 border-b border-hairline bg-app px-1 py-0.5">
        <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
          <TextB size={13} />
        </ToolButton>
        <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
          <TextItalic size={13} />
        </ToolButton>
        <ToolButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading 2"
        >
          <TextHOne size={13} />
        </ToolButton>
        <ToolButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Heading 3"
        >
          <TextHTwo size={13} />
        </ToolButton>
        <ToolButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
          <ListBullets size={13} />
        </ToolButton>
        <ToolButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <ListNumbers size={13} />
        </ToolButton>
        <ToolButton
          active={editor.isActive("link")}
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Link URL", previous ?? "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().setLink({ href: url }).run();
          }}
          label="Link"
        >
          <LinkSimple size={13} />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichtextControl;
