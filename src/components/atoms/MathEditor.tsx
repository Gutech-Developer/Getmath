"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mathematics from "@tiptap/extension-mathematics";
import Image from "@tiptap/extension-image";
import "katex/dist/katex.min.css";
import TrashIcon from "./icons/TrashIcon";
import katex from "katex";
import { cn, resolveAssetUrl } from "@/libs/utils";
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
  onImageUpload?: (file: File) => Promise<string>;
  onImageDelete?: (url: string) => void;
  isUploadingImage?: boolean;
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
  onImageUpload,
  onImageDelete,
  isUploadingImage,
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
      Image.configure({
        HTMLAttributes: {
          class: "max-h-64 object-contain rounded-lg border border-[#E5E7EB] my-2 inline-block max-w-full",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate({ editor: e }) {
      const html = e.getHTML();
      
      // Detect deleted images using regex
      const imageRegex = /(?:https?:\/\/[^\s"'>]+|\/api)\/uploads\/[^\s"'>]+/g;
      const oldImages = Array.from(lastOnUpdateHtml.current.match(imageRegex) || []);
      const newImages = Array.from(html.match(imageRegex) || []);
      
      const deletedImages = oldImages.filter(url => !newImages.includes(url));
      deletedImages.forEach(url => {
        if (onImageDelete) onImageDelete(url);
      });

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

        {onImageUpload && (
          <label
            title="Sisipkan Gambar"
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#DBEAFE] cursor-pointer",
              isUploadingImage && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gambar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && onImageUpload && editor) {
                  try {
                    const url = await onImageUpload(file);
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  } catch (err) {
                    console.error("Image upload failed", err);
                  }
                }
                e.target.value = "";
              }}
            />
          </label>
        )}
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

      {/* ── Image preview & delete ── */}
      {(() => {
        const currentHtml = editor ? editor.getHTML() : value;
        const imageRegex = /(?:https?:\/\/[^\s"'>]+|\/api)\/uploads\/[^\s"'>]+/g;
        const images = Array.from(currentHtml?.match(imageRegex) || []);
        if (images.length === 0) return null;
        
        return (
          <div className="border-t border-[#E5E7EB] p-3 flex flex-wrap gap-3 bg-[#F9FAFB] rounded-b-xl">
            {images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={resolveAssetUrl(url)}
                  alt={`Lampiran ${idx + 1}`}
                  className="h-16 w-16 object-cover rounded border border-[#E5E7EB] bg-white"
                  title="Gambar dalam teks"
                />
                {onImageDelete && (
                  <button
                    type="button"
                    title="Hapus Gambar"
                    onClick={() => {
                      if (editor) {
                        const html = editor.getHTML();
                        const temp = document.createElement("div");
                        temp.innerHTML = html;
                        const imgs = temp.querySelectorAll(`img[src="${url}"]`);
                        imgs.forEach(img => img.remove());
                        editor.commands.setContent(temp.innerHTML);
                      }
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-white border border-[#DC2626] text-[#DC2626] p-1 rounded-full shadow-sm hover:bg-[#FEF2F2] transition"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })()}

    </div>
  );
}
