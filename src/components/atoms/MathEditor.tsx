"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mathematics from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";
import katex from "katex";
import { cn } from "@/libs/utils";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Toolbar button                                                       */
/* ------------------------------------------------------------------ */
function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-sm transition",
        active
          ? "bg-[#BFDBFE] text-[#1D4ED8]"
          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface IMathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function MathEditor({
  value,
  onChange,
  placeholder = "Ketik teks di sini…",
  className,
  disabled = false,
}: IMathEditorProps) {
  /* math dialog state */
  const [showMathDialog, setShowMathDialog] = useState(false);
  const [mathInput, setMathInput] = useState("");
  const [mathError, setMathError] = useState("");
  const mathInputRef = useRef<HTMLInputElement>(null);

  /**
   * Track the last HTML that came from the editor's own onUpdate.
   * If `value` prop changes to something different, it means an external
   * (parent) update happened (e.g. edit-mode hydration) and we must
   * call setContent to sync the editor.
   */
  const lastOnUpdateHtml = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Mathematics,
    ],
    content: value,
    editable: !disabled,
    onUpdate({ editor: e }) {
      const html = e.getHTML();
      lastOnUpdateHtml.current = html;
      onChange(html);
    },
    immediatelyRender: false,
  });

  /* Sync editor content when value changes from outside (hydration) */
  useEffect(() => {
    if (!editor) return;
    if (value === lastOnUpdateHtml.current) return; // came from this editor's own onUpdate
    lastOnUpdateHtml.current = value;
    // Tiptap v3: emitUpdate is inside the options object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.commands.setContent(value || "", { emitUpdate: false } as any);
  }, [editor, value]);

  /* ---------- math insert ---------- */
  const openMathDialog = () => {
    setMathInput("");
    setMathError("");
    setShowMathDialog(true);
    setTimeout(() => mathInputRef.current?.focus(), 50);
  };

  const insertMath = () => {
    if (!editor || !mathInput.trim()) return;
    // validate with katex
    try {
      katex.renderToString(mathInput.trim());
    } catch {
      setMathError("Rumus tidak valid — periksa kembali sintaks LaTeX.");
      return;
    }
    // Insert as an inlineMath node (the node type registered by @tiptap/extension-mathematics)
    // insertContent with a string goes in as plain text and won't render — we must insert the node directly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.chain().focus() as any)
      .insertInlineMath({ latex: mathInput.trim() })
      .run();
    setShowMathDialog(false);
    setMathInput("");
    setMathError("");
  };

  /* ---------- live preview ---------- */
  let mathPreviewHtml = "";
  if (mathInput.trim()) {
    try {
      mathPreviewHtml = katex.renderToString(mathInput.trim(), {
        throwOnError: true,
        displayMode: false,
      });
    } catch {
      mathPreviewHtml = "";
    }
  }

  /* ---------- quick-insert snippets ---------- */
  const SNIPPETS = [
    { label: "xⁿ", latex: "x^{n}" },
    { label: "√x", latex: "\\sqrt{x}" },
    { label: "a/b", latex: "\\frac{a}{b}" },
    { label: "∑", latex: "\\sum_{i=1}^{n}" },
    { label: "∫", latex: "\\int_{a}^{b}" },
    { label: "π", latex: "\\pi" },
    { label: "≤", latex: "\\leq" },
    { label: "≥", latex: "\\geq" },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#D1D5DB] bg-white text-sm text-[#111827] transition",
        "focus-within:border-[#93C5FD] focus-within:ring-2 focus-within:ring-[#BFDBFE]",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1.5">
        <ToolBtn
          title="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          title="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          title="Strikethrough"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike")}
        >
          <s>S</s>
        </ToolBtn>

        {/* divider */}
        <span className="mx-1 h-5 w-px bg-[#E5E7EB]" />

        {/* Insert Math button */}
        <button
          type="button"
          title="Sisipkan Rumus Matematika"
          onMouseDown={(e) => {
            e.preventDefault();
            openMathDialog();
          }}
          className="inline-flex items-center gap-1 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#DBEAFE]"
        >
          <span className="text-base leading-none">∑</span>
          Rumus
        </button>
      </div>

      {/* ── Math insert dialog ── */}
      {showMathDialog && (
        <div className="border-b border-[#E5E7EB] bg-[#FAFBFF] px-3 py-3 space-y-2">
          <p className="text-xs font-semibold text-[#374151]">Sisipkan Rumus</p>

          {/* Quick-insert snippets */}
          <div className="flex flex-wrap gap-1">
            {SNIPPETS.map((s) => (
              <button
                key={s.latex}
                type="button"
                title={s.latex}
                onClick={() =>
                  setMathInput((prev) =>
                    prev ? prev + " " + s.latex : s.latex,
                  )
                }
                className="rounded border border-[#BFDBFE] bg-white px-2 py-0.5 text-xs font-medium text-[#1D4ED8] hover:bg-[#EFF6FF]"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* LaTeX input */}
          <input
            ref={mathInputRef}
            type="text"
            value={mathInput}
            onChange={(e) => {
              setMathInput(e.target.value);
              setMathError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") insertMath();
              if (e.key === "Escape") setShowMathDialog(false);
            }}
            placeholder="Contoh: x^2 + \frac{b}{c}"
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-sm font-mono outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#BFDBFE]"
          />

          {/* Live preview */}
          {mathPreviewHtml && (
            <div
              className="flex min-h-8 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-1"
              dangerouslySetInnerHTML={{ __html: mathPreviewHtml }}
            />
          )}
          {mathError && <p className="text-xs text-[#EF4444]">{mathError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowMathDialog(false)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={insertMath}
              disabled={!mathInput.trim()}
              className="rounded-lg bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              Sisipkan
            </button>
          </div>
        </div>
      )}

      {/* ── Editor content ── */}
      <EditorContent
        editor={editor}
        placeholder={placeholder}
        className={cn(
          "math-editor-content min-h-[80px] px-4 py-3 outline-none",
          "[&_.tiptap]:outline-none",
          "[&_.tiptap_p:first-child]:mt-0",
          "[&_.tiptap_p:last-child]:mb-0",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:text-[#9CA3AF]",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
