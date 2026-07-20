"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "@/components/studio/blog/post-editor/editor-toolbar";

type Props = {
  initialContent: unknown;
  onChange: (json: unknown) => void;
};

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

const ContentEditor = ({ initialContent, onChange }: Props) => {
  // useEditor captures callbacks at creation; the ref keeps onChange fresh.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const [words, setWords] = useState(0);

  const editor = useEditor({
    extensions: [
      // StarterKit v3 ships Link; configure it instead of adding a duplicate.
      StarterKit.configure({ link: { openOnClick: false } }),
      Image,
      Placeholder.configure({ placeholder: "Write your story…" }),
    ],
    content: (initialContent as JSONContent | null) ?? null,
    immediatelyRender: false,
    onCreate: ({ editor: instance }) => setWords(countWords(instance.getText())),
    onUpdate: ({ editor: instance }) => {
      onChangeRef.current(instance.getJSON());
      setWords(countWords(instance.getText()));
    },
    editorProps: {
      attributes: {
        class: "pp-post-editor min-h-[55vh] py-4 text-[15px] leading-relaxed text-body focus:outline-none",
      },
    },
  });

  if (!editor) return <div className="mt-4 h-64 animate-pulse rounded-xl border border-hairline bg-surface" />;

  return (
    <div className="mt-2">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <p className="border-t border-hairline pt-2 text-xs text-muted">
        {words} word{words === 1 ? "" : "s"} · {Math.max(1, Math.round(words / 200))} min read
      </p>
    </div>
  );
};

export default ContentEditor;
