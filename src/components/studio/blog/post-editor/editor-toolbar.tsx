"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  TextT,
  TextHTwo,
  TextHThree,
  TextB,
  TextItalic,
  TextStrikethrough,
  Code,
  CodeBlock,
  ListBullets,
  ListNumbers,
  Quotes,
  Minus,
  LinkSimple,
  ImageSquare,
  Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { MediaRow } from "@/services/media";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MediaPickerDialog from "@/components/studio/media/media-picker-dialog";

type ToolButtonProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
};

const ToolButton = ({ active = false, disabled = false, onClick, label, children }: ToolButtonProps) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(
      "studio-focus rounded-md p-1.5 disabled:opacity-40",
      active ? "bg-brand-soft text-brand" : "text-muted hover:text-ink",
    )}
  >
    {children}
  </button>
);

const EditorToolbar = ({ editor }: { editor: Editor }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = (media: MediaRow) => {
    editor
      .chain()
      .focus()
      .setImage({ src: media.url, alt: media.alt ?? media.filename })
      .run();
  };

  return (
    <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-0.5 rounded-lg border border-hairline bg-surface px-1 py-0.5">
      <ToolButton
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
        label="Paragraph"
      >
        <TextT size={15} />
      </ToolButton>
      <ToolButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        <TextHTwo size={15} />
      </ToolButton>
      <ToolButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="Heading 3"
      >
        <TextHThree size={15} />
      </ToolButton>

      <span className="mx-1 h-4 w-px bg-hairline" />

      <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
        <TextB size={15} />
      </ToolButton>
      <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
        <TextItalic size={15} />
      </ToolButton>
      <ToolButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
        <TextStrikethrough size={15} />
      </ToolButton>
      <ToolButton active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} label="Inline code">
        <Code size={15} />
      </ToolButton>

      <span className="mx-1 h-4 w-px bg-hairline" />

      <ToolButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        <ListBullets size={15} />
      </ToolButton>
      <ToolButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        <ListNumbers size={15} />
      </ToolButton>
      <ToolButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Blockquote"
      >
        <Quotes size={15} />
      </ToolButton>
      <ToolButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        label="Code block"
      >
        <CodeBlock size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
        <Minus size={15} />
      </ToolButton>

      <span className="mx-1 h-4 w-px bg-hairline" />

      <ToolButton active={editor.isActive("link")} onClick={promptLink} label="Link">
        <LinkSimple size={15} />
      </ToolButton>
      <ToolButton onClick={() => setPickerOpen(true)} label="Image">
        <ImageSquare size={15} />
      </ToolButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Insert"
            title="Insert"
            className="studio-focus ml-auto rounded-md p-1.5 text-muted hover:text-ink"
          >
            <Plus size={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setPickerOpen(true)}>Image…</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setHorizontalRule().run()}>Divider</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleBlockquote().run()}>Blockquote</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleCodeBlock().run()}>Code block</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} accept="image" onPick={insertImage} />
    </div>
  );
};

export default EditorToolbar;
