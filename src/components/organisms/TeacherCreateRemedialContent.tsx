"use client";

import dynamic from "next/dynamic";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { cn } from "@/libs/utils";
import { showToast } from "@/libs/toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGsCreateRemedialTest,
  useGsUpdateRemedialTest,
  useGsRemedialTestById,
  useGsUploadFile,
  useGsDeleteFile,
} from "@/services";
import SearchableInput from "@/components/atoms/SearchableInput";
import type { GsRemedialTest, GsRemedialVariant } from "@/types/gs-remedial";
import MathText from "../atoms/MathText";

const MathEditor = dynamic(() => import("@/components/atoms/MathEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[80px] rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB]" />
  ),
});

type ChoiceKey = "A" | "B" | "C" | "D";
const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

type VariantLabel = "A" | "B" | "C";
const VARIANT_LABELS: VariantLabel[] = ["A", "B", "C"];

interface IOptionDraft {
  id?: string;
  text: string;
}

interface IVariantDraft {
  id?: string;
  prompt: string;
  options: Record<ChoiceKey, IOptionDraft>;
  correctAnswer: ChoiceKey;
}

interface IRemedialQuestionDraft {
  id: string;
  pembahasan: string;
  videoUrl: string;
  variants: Record<VariantLabel, IVariantDraft>;
}

function createEmptyVariant(label: string): IVariantDraft {
  return {
    prompt: "",
    options: {
      A: { text: "" },
      B: { text: "" },
      C: { text: "" },
      D: { text: "" },
    },
    correctAnswer: "A",
  };
}

function createEmptyQuestion(): IRemedialQuestionDraft {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    pembahasan: "",
    videoUrl: "",
    variants: {
      A: createEmptyVariant("A"),
      B: createEmptyVariant("B"),
      C: createEmptyVariant("C"),
    },
  };
}

function latexTextToTiptapHtml(text: string): string {
  if (!text) return "";
  
  if (text.includes("<p>") || text.includes("<span data-type=")) return text;

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

function tiptapHtmlToLatexHtml(html: string): string {
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
      const attributes = Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(" ");
      return `<${tag}${attributes ? " " + attributes : ""}>${inner}</${tag}>`;
    }
    return "";
  }
  return Array.from(doc.body.childNodes)
    .map(processNode)
    .join("")
    .replace(/\n+$/, "");
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname === "youtu.be")
      return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/"))
      return url;
    return null;
  } catch {
    return null;
  }
}

function parseVariant(v?: GsRemedialVariant, label: string = "A"): IVariantDraft {
  if (!v) return createEmptyVariant(label);
  return {
    id: v.id,
    prompt: latexTextToTiptapHtml(v.textQuestion ?? ""),
    options: {
      A: {
        id: v.options.find((o) => o.option === "A")?.id,
        text: latexTextToTiptapHtml(
          v.options.find((o) => o.option === "A")?.textAnswer ?? "",
        ),
      },
      B: {
        id: v.options.find((o) => o.option === "B")?.id,
        text: latexTextToTiptapHtml(
          v.options.find((o) => o.option === "B")?.textAnswer ?? "",
        ),
      },
      C: {
        id: v.options.find((o) => o.option === "C")?.id,
        text: latexTextToTiptapHtml(
          v.options.find((o) => o.option === "C")?.textAnswer ?? "",
        ),
      },
      D: {
        id: v.options.find((o) => o.option === "D")?.id,
        text: latexTextToTiptapHtml(
          v.options.find((o) => o.option === "D")?.textAnswer ?? "",
        ),
      },
    },
    correctAnswer:
      (v.options.find((o) => o.isCorrect)?.option as ChoiceKey) ?? "A",
  };
}

function prefillQuestions(rt: GsRemedialTest): IRemedialQuestionDraft[] {
  if (!rt.questions?.length) return [createEmptyQuestion()];
  return rt.questions.map((q) => ({
    id: q.id,
    pembahasan: latexTextToTiptapHtml(q.discussionText ?? ""),
    videoUrl: q.discussionVideoUrl ?? "",
    variants: {
      A: parseVariant(q.variants.find((v) => v.packageLabel === "A"), "A"),
      B: parseVariant(q.variants.find((v) => v.packageLabel === "B"), "B"),
      C: parseVariant(q.variants.find((v) => v.packageLabel === "C"), "C"),
    },
  }));
}

interface IProps {
  editId?: string;
  role?: "admin" | "teacher";
}

export default function TeacherCreateRemedialContent({ editId, role = "teacher" }: IProps) {
  const basePath = role === "admin" ? "/admin/dashboard" : "/teacher/dashboard";
  const router = useRouter();
  const isEditing = Boolean(editId);
  const { data: existingTest, isLoading: loadingExisting } =
    useGsRemedialTestById(editId ?? "");
  const createMutation = useGsCreateRemedialTest();
  const updateMutation = useGsUpdateRemedialTest();
  const uploadMutation = useGsUploadFile();
  const deleteMutation = useGsDeleteFile();

  const [testTitle, setTestTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [kkm, setKkm] = useState<number>(75);
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<IRemedialQuestionDraft[]>([
    createEmptyQuestion(),
  ]);
  const [activePackage, setActivePackage] = useState<VariantLabel>("A");
  const [openQuestionIds, setOpenQuestionIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [teacherId, setTeacherId] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");

  useEffect(() => {
    if (isEditing && existingTest && !hydrated) {
      setTestTitle(existingTest.testName);
      setDurationMinutes(String(existingTest.durationMinutes));
      setKkm(existingTest.passingScore);
      setDescription(existingTest.description ?? "");
      const prefilled = prefillQuestions(existingTest);
      setQuestions(prefilled);
      setOpenQuestionIds(prefilled.map((q) => q.id));
      setHydrated(true);
    }
  }, [isEditing, existingTest, hydrated]);

  /* ── helpers ── */
  const addQuestion = () => {
    const q = createEmptyQuestion();
    setQuestions((prev) => [...prev, q]);
    setOpenQuestionIds((prev) => [...prev, q.id]);
  };

  const removeQuestion = (qId: string) => {
    // Cari soal yang akan dihapus untuk menghapus gambarnya di server
    const targetQ = questions.find((q) => q.id === qId);
    if (targetQ) {
      const urlsToDelete: string[] = [];
      const imageRegex = /https?:\/\/[^\s"'>]+\/uploads\/images\/[^\s"'>]+/g;
      
      const extractUrls = (html: string) => {
        const matches = html.match(imageRegex);
        if (matches) urlsToDelete.push(...matches);
      };

      extractUrls(targetQ.pembahasan);
      
      VARIANT_LABELS.forEach(vLabel => {
        const variant = targetQ.variants[vLabel];
        extractUrls(variant.prompt);
        CHOICE_KEYS.forEach(key => {
          extractUrls(variant.options[key].text);
        });
      });

      // Hapus di background tanpa memblokir UI
      urlsToDelete.forEach(async (url) => {
        try {
          await deleteMutation.mutateAsync(url);
        } catch (e) {}
      });
    }

    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== qId);
      if (next.length === 0) {
        const fallback = createEmptyQuestion();
        setOpenQuestionIds((o) => [...o.filter((x) => x !== qId), fallback.id]);
        return [fallback];
      }
      return next;
    });
    setOpenQuestionIds((prev) => prev.filter((x) => x !== qId));
  };

  const toggleQuestion = (id: string) =>
    setOpenQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const updateQuestion = (
    qId: string,
    updater: (q: IRemedialQuestionDraft) => Partial<IRemedialQuestionDraft>,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          ...updater(q),
        };
      }),
    );
  };

  const updateVariant = (
    qId: string,
    updater: (v: IVariantDraft) => IVariantDraft,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          variants: {
            ...q.variants,
            [activePackage]: updater(q.variants[activePackage]),
          },
        };
      }),
    );
  };

  /* ── build payload ── */
  const buildPayload = (isUpsert: boolean) =>
    questions.map((q, qi) => {
      return {
        ...(isUpsert && q.id && !q.id.startsWith("q-") ? { id: q.id } : {}),
        questionNumber: qi + 1,
        discussionText: tiptapHtmlToLatexHtml(q.pembahasan) || `Pembahasan soal ${qi + 1}`,
        discussionVideoUrl: q.videoUrl || null,
        variants: VARIANT_LABELS.map((label) => {
          const variant = q.variants[label];
          return {
            ...(isUpsert && variant.id ? { id: variant.id } : {}),
            packageLabel: label,
            textQuestion: tiptapHtmlToLatexHtml(variant.prompt) || `Soal ${label} ${qi + 1}`,
            options: CHOICE_KEYS.map((key) => {
              return {
                ...(isUpsert && variant.options[key].id
                  ? { id: variant.options[key].id }
                  : {}),
                option: key,
                textAnswer: tiptapHtmlToLatexHtml(variant.options[key].text) || `Jawaban ${key}`,
                isCorrect: variant.correctAnswer === key,
              };
            }),
          };
        }),
      };
    });

  /* ── submit ── */
  const handleSave = () => {
    if (!testTitle.trim()) {
      showToast.error("Judul tes tidak boleh kosong");
      return;
    }

    // Validate each question
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const errorLabel = `Soal ${qi + 1}`;

      if (!tiptapHtmlToLatexHtml(q.pembahasan).trim()) {
        showToast.error(`${errorLabel}: Pembahasan tidak boleh kosong`);
        setOpenQuestionIds((prev) => [...new Set([...prev, q.id])]);
        return;
      }

      if (!q.videoUrl.trim()) {
        showToast.error(`${errorLabel}: URL video pembahasan wajib diisi`);
        setOpenQuestionIds((prev) => [...new Set([...prev, q.id])]);
        return;
      }
      try {
        new URL(q.videoUrl);
      } catch {
        showToast.error(`${errorLabel}: URL video pembahasan tidak valid`);
        setOpenQuestionIds((prev) => [...new Set([...prev, q.id])]);
        return;
      }

      for (const label of VARIANT_LABELS) {
        const variant = q.variants[label];
        const varErrorLabel = `Paket ${label}, Soal ${qi + 1}`;
        if (!tiptapHtmlToLatexHtml(variant.prompt).trim()) {
          showToast.error(`${varErrorLabel}: Pertanyaan tidak boleh kosong`);
          setOpenQuestionIds((prev) => [...new Set([...prev, q.id])]);
          setActivePackage(label);
          return;
        }
      }
    }

    if (isEditing && editId) {
      updateMutation.mutate(
        {
          id: editId,
          data: {
            testName: testTitle,
            description: description || null,
            durationMinutes: Number(durationMinutes) || 60,
            passingScore: kkm,
            teacherId: teacherId || undefined,
            questions: buildPayload(true),
          },
        },
        {
          onSuccess: () => {
            showToast.success("Tes remedial berhasil diperbarui");
            router.push(`${basePath}/manage-remedial`);
          },
          onError: () => showToast.error("Gagal memperbarui tes remedial"),
        },
      );
    } else {
      createMutation.mutate(
        {
          testName: testTitle,
          description: description || null,
          durationMinutes: Number(durationMinutes) || 60,
          passingScore: kkm,
          teacherId: teacherId || undefined,
          questions: buildPayload(false),
        },
        {
          onSuccess: (data) => {
            showToast.success("Tes remedial berhasil dibuat");
            const id = (data as GsRemedialTest).id;
            router.push(
              id
                ? `${basePath}/manage-remedial/${id}`
                : `${basePath}/manage-remedial`,
            );
          },
          onError: () => showToast.error("Gagal membuat tes remedial"),
        },
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
          onClick={() => router.push(`${basePath}/manage-remedial`)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F3F4F6]"
          aria-label="Kembali"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">
            {isEditing ? "Edit Tes Remedial" : "Buat Tes Remedial Baru"}
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            {isEditing
              ? "Ubah informasi dan soal tes remedial"
              : "Isi informasi dan tambahkan soal tes remedial"}
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
            placeholder="Misal: Remedial Aljabar Dasar"
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
            placeholder="Deskripsi singkat..."
            rows={2}
            className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
          />
        </div>

        {/* Input Guru (Hanya Admin) */}
        {role === "admin" && (
          <div className="space-y-1.5">
            <SearchableInput
              label="Guru (Pembuat Tes)"
              placeholder="Cari guru..."
              value={teacherName}
              onChange={(label, option) => {
                setTeacherName(label);
                if (option?.value) {
                  setTeacherId(option.value);
                }
              }}
              options={[
                // TODO: Nanti diisi dengan data dari endpoint API khusus pencarian guru
                { value: "dummy-1", label: "Guru Dummy 1" },
                { value: "dummy-2", label: "Guru Dummy 2" },
              ]}
              required
            />
          </div>
        )}
      </section>

      {/* Paket Soal */}
      <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
        {/* Tab bar */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-[#E5E7EB] bg-[#F9FAFB]">
          {VARIANT_LABELS.map((label) => {
            const isActive = activePackage === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActivePackage(label)}
                className={cn(
                  "relative flex-1 px-5 py-3 text-sm font-semibold transition whitespace-nowrap",
                  isActive
                    ? "border-b-2 border-[#2563EB] bg-white text-[#2563EB]"
                    : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]",
                )}
              >
                Paket {label}
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-3">
          {questions.map((question, qi) => {
            const isOpen = openQuestionIds.includes(question.id);
            const variant = question.variants[activePackage];
            const preview = tiptapHtmlToLatexHtml(variant.prompt);

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
                      Benar: {variant.correctAnswer}
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
                        value={variant.prompt}
                        onChange={(v) =>
                          updateVariant(question.id, (prev) => ({
                            ...prev,
                            prompt: v,
                          }))
                        }
                        placeholder="Masukkan teks soal…"
                        isUploadingImage={uploadMutation.isPending}
                        onImageUpload={async (file) => {
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await uploadMutation.mutateAsync(formData);
                            showToast.success("Gambar berhasil diunggah");
                            return res.url;
                          } catch (err: any) {
                            showToast.error(err.message || "Gagal mengunggah gambar");
                            throw err;
                          }
                        }}
                        onImageDelete={async (url) => {
                          try {
                            await deleteMutation.mutateAsync(url);
                          } catch {
                            // showToast.error("Gagal menghapus gambar");
                          }
                        }}
                      />
                    </div>

                    {/* Pilihan Jawaban */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#4B5563]">
                        Pilihan Jawaban (A – D)
                      </p>
                      <div className="space-y-2">
                        {CHOICE_KEYS.map((key) => {
                          const isCorrect = variant.correctAnswer === key;
                          return (
                            <div
                              key={key}
                              className={cn(
                                "flex items-start gap-3 rounded-2xl border p-3 transition-colors",
                                isCorrect
                                  ? "border-[#3B82F6] bg-[#EFF6FF]"
                                  : "border-[#E5E7EB] bg-white",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateVariant(question.id, (prev) => ({
                                    ...prev,
                                    correctAnswer: key,
                                  }))
                                }
                                className={cn(
                                  "mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                                  isCorrect
                                    ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                                    : "border-[#D1D5DB] text-[#9CA3AF] hover:border-[#9CA3AF]",
                                )}
                              >
                                {key}
                              </button>
                              <div className="min-w-0 flex-1">
                                <MathEditor
                                  value={variant.options[key].text}
                                  onChange={(v) =>
                                    updateVariant(question.id, (prev) => ({
                                      ...prev,
                                      options: {
                                        ...prev.options,
                                        [key]: { ...prev.options[key], text: v },
                                      },
                                    }))
                                  }
                                  placeholder={`Jawaban ${key}…`}
                                  isUploadingImage={uploadMutation.isPending}
                                  onImageUpload={async (file) => {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
                                      const res = await uploadMutation.mutateAsync(formData);
                                      showToast.success("Gambar berhasil diunggah");
                                      return res.url;
                                    } catch (err: any) {
                                      showToast.error(err.message || "Gagal mengunggah gambar");
                                      throw err;
                                    }
                                  }}
                                  onImageDelete={async (url) => {
                                    try {
                                      await deleteMutation.mutateAsync(url);
                                    } catch {
                                      // showToast.error("Gagal menghapus gambar");
                                    }
                                  }}
                                />
                              </div>
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
                          updateQuestion(question.id, () => ({
                            pembahasan: v,
                          }))
                        }
                        placeholder="Tuliskan pembahasan…"
                        isUploadingImage={uploadMutation.isPending}
                        onImageUpload={async (file) => {
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await uploadMutation.mutateAsync(formData);
                            showToast.success("Gambar berhasil diunggah");
                            return res.url;
                          } catch (err: any) {
                            showToast.error(err.message || "Gagal mengunggah gambar");
                            throw err;
                          }
                        }}
                        onImageDelete={async (url) => {
                          try {
                            await deleteMutation.mutateAsync(url);
                          } catch {
                            // showToast.error("Gagal menghapus gambar");
                          }
                        }}
                      />
                    </div>

                    {/* Video URL */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#4B5563]">
                        Video Pembahasan (URL){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="url"
                        value={question.videoUrl}
                        onChange={(e) =>
                          updateQuestion(question.id, () => ({
                            videoUrl: e.target.value,
                          }))
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                      />
                      {(() => {
                        const embed = getYouTubeEmbedUrl(question.videoUrl);
                        if (!embed) return null;
                        return (
                          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
                            <iframe
                              src={embed}
                              title="Preview video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="aspect-video w-full"
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {/* Hapus soal */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Hapus Soal (Seluruh Paket)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tambah Soal */}
          <button
            type="button"
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#93C5FD] bg-[#F0F9FF] py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Soal Baru
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-end gap-3 rounded-3xl border border-[#E5E7EB] bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => router.push(`${basePath}/manage-remedial`)}
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
