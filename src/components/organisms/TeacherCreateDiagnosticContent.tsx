"use client";

import dynamic from "next/dynamic";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { cn } from "@/libs/utils";
import { showToast } from "@/libs/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGsCreateDiagnosticTest,
  useGsUpdateDiagnosticTest,
  useGsDiagnosticTestById,
} from "@/services";
import type { GsDiagnosticTest } from "@/types/gs-diagnostic-test";
import MathText from "../atoms/MathText";

const MathEditor = dynamic(() => import("@/components/atoms/MathEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[80px] rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB]" />
  ),
});

type ChoiceKey = "A" | "B" | "C" | "D";
const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

interface IOptionDraft {
  id?: string;
  text: string;
}
interface IQuestionDraft {
  id: string;
  isBackendId: boolean;
  prompt: string;
  options: Record<ChoiceKey, IOptionDraft>;
  correctAnswer: ChoiceKey;
  pembahasan: string;
}
function createEmptyQuestion(index: number): IQuestionDraft {
  return {
    id: `q-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    isBackendId: false,
    prompt: "",
    options: {
      A: { text: "" },
      B: { text: "" },
      C: { text: "" },
      D: { text: "" },
    },
    correctAnswer: "A",
    pembahasan: "",
  };
}

function latexTextToTiptapHtml(text: string): string {
  if (!text) return "";

  // Convert each line into a Tiptap <p> block so newlines are preserved in the editor
  return text
    .split("\n")
    .map((line) => {
      const lineHtml = line
        .split(/(\$[^$\n]+\$)/g)
        .map((part) => {
          if (/^\$[^$\n]+\$$/.test(part)) {
            const latex = part.slice(1, -1).replace(/"/g, "&quot;");
            return `<span data-type="inline-math" data-latex="${latex}"></span>`;
          }
          // Escape HTML special chars in plain text
          return part
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        })
        .join("");
      return `<p>${lineHtml || "<br>"}</p>`;
    })
    .join("");
}

function tiptapHtmlToLatexText(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, "").trim();
  const doc = new DOMParser().parseFromString(html, "text/html");
  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const dt = el.getAttribute("data-type");
      if (dt === "inline-math") {
        const l = el.getAttribute("data-latex") ?? "";
        return l ? `$${l}$` : "";
      }
      if (dt === "block-math") {
        const l = el.getAttribute("data-latex") ?? "";
        return l ? `$$${l}$$` : "";
      }
      const tag = el.tagName.toLowerCase();
      const inner = Array.from(el.childNodes).map(processNode).join("");
      // Tiptap wraps each paragraph in <p> — treat as a line break
      if (tag === "p") return inner + "\n";
      if (tag === "br") return "\n";
      return inner;
    }
    return "";
  }
  return Array.from(doc.body.childNodes)
    .map(processNode)
    .join("")
    .replace(/\n+$/, ""); // trim trailing newlines only
}

function prefillQuestions(dt: GsDiagnosticTest): IQuestionDraft[] {
  if (!dt.questions?.length) return [createEmptyQuestion(1)];
  return dt.questions.map((q, i) => ({
    id: q.id,
    isBackendId: true,
    prompt: latexTextToTiptapHtml(q.textQuestion ?? `Soal ${i + 1}`),
    options: {
      A: {
        text: latexTextToTiptapHtml(
          q.options.find((o) => o.option === "A")?.textAnswer ?? "",
        ),
      },
      B: {
        text: latexTextToTiptapHtml(
          q.options.find((o) => o.option === "B")?.textAnswer ?? "",
        ),
      },
      C: {
        text: latexTextToTiptapHtml(
          q.options.find((o) => o.option === "C")?.textAnswer ?? "",
        ),
      },
      D: {
        text: latexTextToTiptapHtml(
          q.options.find((o) => o.option === "D")?.textAnswer ?? "",
        ),
      },
    },
    correctAnswer:
      (q.options.find((o) => o.isCorrect)?.option as ChoiceKey) ?? "A",
    pembahasan: latexTextToTiptapHtml(q.pembahasan),
  }));
}

interface IProps {
  editId?: string;
}

export default function TeacherCreateDiagnosticContent({ editId }: IProps) {
  const router = useRouter();
  const isEditing = Boolean(editId);
  const { data: existingTest, isLoading: loadingExisting } =
    useGsDiagnosticTestById(editId ?? "");
  const createMutation = useGsCreateDiagnosticTest();
  const updateMutation = useGsUpdateDiagnosticTest();

  const [testTitle, setTestTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [kkm, setKkm] = useState<number>(75);
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<IQuestionDraft[]>(() => [
    createEmptyQuestion(1),
  ]);
  const [openQuestionIds, setOpenQuestionIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  if (isEditing && existingTest && !hydrated) {
    setTestTitle(existingTest.testName);
    setDurationMinutes(String(existingTest.durationMinutes));
    setKkm(existingTest.passingScore);
    setDescription(existingTest.description ?? "");
    const initialQuestions = prefillQuestions(existingTest);
    setQuestions(initialQuestions);
    setOpenQuestionIds(initialQuestions.map((q) => q.id));
    setHydrated(true);
  }

  /* ── question helpers ── */
  const addQuestion = () => {
    const q = createEmptyQuestion(questions.length + 1);
    setQuestions((prev) => [...prev, q]);
    setOpenQuestionIds((o) => [...o, q.id]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== qId);
      setOpenQuestionIds((o) => o.filter((x) => x !== qId));
      if (next.length === 0) {
        const fallback = createEmptyQuestion(1);
        setOpenQuestionIds((o) => [...o, fallback.id]);
        return [fallback];
      }
      return next;
    });
  };

  const toggleQuestion = (id: string) =>
    setOpenQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const updateQuestion = (
    qId: string,
    updater: (q: IQuestionDraft) => IQuestionDraft,
  ) => setQuestions((prev) => prev.map((q) => (q.id === qId ? updater(q) : q)));

  /* ── build payload ── */
  const buildPayload = (isUpsert: boolean) =>
    questions.map((q, qi) => ({
      ...(isUpsert && q.id && !q.id.startsWith("q-") ? { id: q.id } : {}),
      questionNumber: qi + 1,
      textQuestion: tiptapHtmlToLatexText(q.prompt) || `Soal ${qi + 1}`,
      pembahasan:
        tiptapHtmlToLatexText(q.pembahasan) || `Pembahasan soal ${qi + 1}`,
      discussion: {
        textDiscussion:
          tiptapHtmlToLatexText(q.pembahasan) || `Pembahasan soal ${qi + 1}`,
      },
      options: CHOICE_KEYS.map((key) => ({
        option: key,
        textAnswer: tiptapHtmlToLatexText(q.options[key].text),
        isCorrect: q.correctAnswer === key,
      })),
    }));

  /* ── submit ── */
  const handleSave = () => {
    if (!testTitle.trim()) {
      showToast.error("Judul tes tidak boleh kosong");
      return;
    }
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const label = `Soal ${qi + 1}`;
      if (!tiptapHtmlToLatexText(q.prompt).trim()) {
        showToast.error(`${label}: Pertanyaan tidak boleh kosong`);
        setOpenQuestionIds((prev) => [...new Set([...prev, q.id])]);
        return;
      }
    }

    if (isEditing && editId) {
      updateMutation.mutate(
        {
          id: editId,
          data: {
            testName: testTitle,
            description: description || undefined,
            durationMinutes: Number(durationMinutes) || 60,
            passingScore: kkm,
            questions: buildPayload(true),
          },
        },
        {
          onSuccess: () => {
            showToast.success("Tes diagnostik berhasil diperbarui");
            router.push("/teacher/dashboard/manage-diagnostics");
          },
          onError: () => showToast.error("Gagal memperbarui tes diagnostik"),
        },
      );
    } else {
      createMutation.mutate(
        {
          testName: testTitle,
          description: description || undefined,
          durationMinutes: Number(durationMinutes) || 60,
          passingScore: kkm,
          questions: buildPayload(false),
        },
        {
          onSuccess: (data) => {
            showToast.success("Tes diagnostik berhasil dibuat");
            const id = (data as GsDiagnosticTest).id;
            router.push(
              id
                ? `/teacher/dashboard/manage-diagnostics/${id}`
                : "/teacher/dashboard/manage-diagnostics",
            );
          },
          onError: () => showToast.error("Gagal membuat tes diagnostik"),
        },
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const totalQuestions = questions.length;

  if (isEditing && loadingExisting)
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat data…
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/teacher/dashboard/manage-diagnostics")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F3F4F6]"
          aria-label="Kembali"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">
            {isEditing ? "Edit Tes Diagnostik" : "Buat Tes Diagnostik Baru"}
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            {isEditing
              ? "Ubah informasi dan soal tes diagnostik"
              : "Isi informasi dan tambahkan soal tes diagnostik"}
          </p>
        </div>
      </div>

      {/* Info Tes */}
      <section className="space-y-4 rounded-3xl border border-[#E5E7EB] bg-white px-6 py-5">
        <p className="text-sm font-semibold text-[#374151]">Informasi Tes</p>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#374151]">
            Judul Tes <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            placeholder="Judul tes diagnostik"
            className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#374151]">
              Durasi (menit)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#374151]">
              Nilai KKM (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={kkm}
              onChange={(e) => setKkm(Number(e.target.value))}
              className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#374151]">
            Deskripsi (opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi tes diagnostik"
            rows={2}
            className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
          />
        </div>
      </section>

      {/* Soal Tes */}
      <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1F2937]">Daftar Soal</h2>
          <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
            {questions.length} Soal
          </span>
        </div>

        <div className="space-y-3 p-4">
          {questions.map((question, qi) => {
            const isOpen = openQuestionIds.includes(question.id);
            const preview = tiptapHtmlToLatexText(question.prompt);
            return (
              <div
                key={question.id}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB]"
              >
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(question.id)}
                  className="flex w-full justify-between items-center gap-3 bg-[#F9FAFB] px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
                      {qi + 1}
                    </span>
                    <p className="max-w-md">
                      <MathText text={preview ?? `Soal ${qi + 1}`} />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                      Benar: {question.correctAnswer}
                    </span>
                    <ChevronLeftIcon
                      className={cn(
                        "h-5 w-5 shrink-0 text-[#6B7280] transition-transform",
                        isOpen ? "-rotate-90" : "rotate-90",
                      )}
                    />
                  </div>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="space-y-5 border-t border-[#E5E7EB] p-4">
                    {/* Pertanyaan */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#4B5563]">
                        Pertanyaan <span className="text-[#EF4444]">*</span>
                      </label>
                      <MathEditor
                        value={question.prompt}
                        onChange={(v) =>
                          updateQuestion(question.id, (q) => ({
                            ...q,
                            prompt: v,
                          }))
                        }
                        placeholder="Masukkan teks soal…"
                      />
                    </div>

                    {/* Pilihan Jawaban */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#4B5563]">
                        Pilihan Jawaban (A – D)
                      </p>
                      <div className="space-y-2">
                        {CHOICE_KEYS.map((key) => {
                          const isCorrect = question.correctAnswer === key;
                          return (
                            <div
                              key={key}
                              className={cn(
                                "rounded-2xl border p-3",
                                isCorrect
                                  ? "border-[#93C5FD] bg-[#EFF6FF]"
                                  : "border-[#E5E7EB] bg-white",
                              )}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-[#374151]">
                                  {key}
                                </span>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-[#4B5563]">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={isCorrect}
                                    onChange={() =>
                                      updateQuestion(question.id, (q) => ({
                                        ...q,
                                        correctAnswer: key,
                                      }))
                                    }
                                    className="h-4 w-4 accent-[#2563EB]"
                                  />
                                  Jawaban benar
                                </label>
                              </div>
                              <MathEditor
                                value={question.options[key].text}
                                onChange={(v) =>
                                  updateQuestion(question.id, (q) => ({
                                    ...q,
                                    options: {
                                      ...q.options,
                                      [key]: { text: v },
                                    },
                                  }))
                                }
                                placeholder={`Pilihan ${key}`}
                                className="min-h-14"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pembahasan */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#4B5563]">
                        Pembahasan <span className="text-[#EF4444]">*</span>
                      </label>
                      <MathEditor
                        value={question.pembahasan}
                        onChange={(v) =>
                          updateQuestion(question.id, (q) => ({
                            ...q,
                            pembahasan: v,
                          }))
                        }
                        placeholder="Tuliskan pembahasan…"
                      />
                    </div>

                    {/* Hapus soal */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Hapus Soal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => addQuestion()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#93C5FD] bg-[#F0F9FF] py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Soal
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-end gap-3 rounded-3xl border border-[#E5E7EB] bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/teacher/dashboard/manage-diagnostics")}
          className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-8 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-2xl bg-[#2563EB] px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {isSaving
            ? "Menyimpan…"
            : isEditing
              ? "Simpan Perubahan"
              : "Simpan & Lihat Preview"}
        </button>
      </div>
    </div>
  );
}
