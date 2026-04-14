"use client";

import CalendarIcon from "@/components/atoms/icons/CalendarIcon";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import EditIcon from "@/components/atoms/icons/EditIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import { cn } from "@/libs/utils";
import { useEffect, useState } from "react";

type DiagnosticType = string;
type ChoiceKey = "A" | "B" | "C" | "D";

interface IDiagnosticItem {
  id: string;
  title: string;
  description: string;
  typeLabel: string;
  totalQuestions: number;
  durationMinutes: number;
  dateLabel: string;
}

interface IQuestionDraft {
  id: string;
  formula: string;
  prompt: string;
  options: Record<ChoiceKey, string>;
  correctAnswer: ChoiceKey;
}

const DIAGNOSTIC_ITEMS: IDiagnosticItem[] = [
  {
    id: "diagnostic-1",
    title: "Tes Diagnostik 1 - Persamaan Kuadrat",
    description: "Tes untuk mengukur pemahaman siswa tentang persamaan kuadrat",
    typeLabel: "Tipe A - Pilihan Ganda Biasa",
    totalQuestions: 2,
    durationMinutes: 60,
    dateLabel: "18 Mar 2026",
  },
  {
    id: "diagnostic-2",
    title: "Tes Diagnostik 2 - Fungsi Kuadrat",
    description:
      "Evaluasi pemahaman tentang grafik dan titik puncak fungsi kuadrat",
    typeLabel: "Tipe B - Benar / Salah",
    totalQuestions: 1,
    durationMinutes: 45,
    dateLabel: "25 Mar 2026",
  },
];

const initialTypeOptions: Array<{
  value: DiagnosticType;
  label: string;
  description: string;
}> = [
  {
    value: "type-a",
    label: "Tipe A",
    description: "Satu jawaban benar dari empat pilihan (A, B, C, D)",
  },
];

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

function createEmptyQuestion(index: number): IQuestionDraft {
  return {
    id: `question-${Date.now()}-${index}`,
    formula: "",
    prompt: "",
    options: {
      A: "",
      B: "",
      C: "",
      D: "",
    },
    correctAnswer: "A",
  };
}

export default function TeacherManageDiagnosticsContent() {
  const [diagnostics, setDiagnostics] =
    useState<IDiagnosticItem[]>(DIAGNOSTIC_ITEMS);
  const [typeOptions, setTypeOptions] =
    useState<typeof initialTypeOptions>(initialTypeOptions);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDiagnosticId, setEditingDiagnosticId] = useState<string | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<DiagnosticType>(
    initialTypeOptions[0].value,
  );
  const [testTitle, setTestTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<IQuestionDraft[]>(() => {
    const firstQuestion = createEmptyQuestion(1);
    return [firstQuestion];
  });
  const [openQuestionIds, setOpenQuestionIds] = useState<string[]>(() => []);

  const isEditing = editingDiagnosticId !== null;

  useEffect(() => {
    if (!isAddModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAddModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isAddModalOpen]);

  const selectedTypeMeta = typeOptions.find(
    (option) => option.value === selectedType,
  );

  const addTypeOption = () => {
    const nextOption = createNextTypeOption();
    setTypeOptions((previous) => [...previous, nextOption]);
    setSelectedType(nextOption.value);
  };

  const createNextTypeOption = () => {
    const nextIndex = typeOptions.length + 1;
    const nextLetter = String.fromCharCode(64 + nextIndex);
    const nextValue = `type-${nextLetter.toLowerCase()}`;

    return {
      value: nextValue,
      label: `Tipe ${nextLetter}`,
      description:
        nextIndex === 1
          ? "Satu jawaban benar dari empat pilihan (A, B, C, D)"
          : `Pilihan tipe ${nextLetter} untuk variasi penilaian`,
    };
  };

  const formatDateLabel = (date: Date) =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const resetForm = (diagnostic?: IDiagnosticItem) => {
    const firstQuestion = createEmptyQuestion(1);

    if (diagnostic) {
      setSelectedType(
        typeOptions.find((option) => option.label === diagnostic.typeLabel)
          ?.value ?? "type-a",
      );
      setTestTitle(diagnostic.title);
      setDurationMinutes(String(diagnostic.durationMinutes));
      setDescription(diagnostic.description);
      const nextQuestions = Array.from(
        { length: diagnostic.totalQuestions },
        (_, index) => {
          const question = createEmptyQuestion(index + 1);
          return question;
        },
      );

      setQuestions(nextQuestions);
      setOpenQuestionIds(nextQuestions.map((question) => question.id));
      return;
    }

    setSelectedType("type-a");
    setTestTitle("");
    setDurationMinutes("60");
    setDescription("");
    setQuestions([firstQuestion]);
    setOpenQuestionIds([firstQuestion.id]);
  };

  const openModal = (diagnostic?: IDiagnosticItem) => {
    resetForm(diagnostic);
    setEditingDiagnosticId(diagnostic?.id ?? null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingDiagnosticId(null);
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleSave = () => {
    const nextItem: IDiagnosticItem = {
      id: editingDiagnosticId ?? `diagnostic-${Date.now()}`,
      title: testTitle || "Tes Diagnostik Baru",
      description,
      typeLabel: selectedTypeMeta?.label ?? "Tipe A",
      totalQuestions: questions.length,
      durationMinutes: Number(durationMinutes) || 0,
      dateLabel: editingDiagnosticId
        ? (diagnostics.find((item) => item.id === editingDiagnosticId)
            ?.dateLabel ?? formatDateLabel(new Date()))
        : formatDateLabel(new Date()),
    };

    setDiagnostics((previous) => {
      if (editingDiagnosticId) {
        return previous.map((item) =>
          item.id === editingDiagnosticId ? nextItem : item,
        );
      }

      return [nextItem, ...previous];
    });

    closeModal();
  };

  const handleEditDiagnostic = (diagnostic: IDiagnosticItem) => {
    openModal(diagnostic);
  };

  const handleDeleteDiagnostic = (diagnosticId: string) => {
    setDiagnostics((previous) =>
      previous.filter((diagnostic) => diagnostic.id !== diagnosticId),
    );
  };

  const addQuestion = () => {
    const nextQuestion = createEmptyQuestion(questions.length + 1);
    setQuestions((previous) => [...previous, nextQuestion]);
    setOpenQuestionIds([nextQuestion.id]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((previous) => {
      const nextQuestions = previous.filter(
        (question) => question.id !== questionId,
      );
      if (nextQuestions.length === 0) {
        const fallback = createEmptyQuestion(1);
        setOpenQuestionIds([fallback.id]);
        return [fallback];
      }

      setOpenQuestionIds((prevOpen) => {
        const filteredOpen = prevOpen.filter((id) => id !== questionId);
        if (filteredOpen.length > 0) {
          return filteredOpen;
        }

        return [nextQuestions[0].id];
      });

      return nextQuestions;
    });
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestionIds((previous) => {
      if (previous.includes(questionId)) {
        return previous.filter((id) => id !== questionId);
      }

      return [...previous, questionId];
    });
  };

  const updateQuestion = (
    questionId: string,
    updater: (question: IQuestionDraft) => IQuestionDraft,
  ) => {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId ? updater(question) : question,
      ),
    );
  };

  const questionCountLabel = `${questions.length} soal ditambahkan`;

  return (
    <>
      <section className="w-full space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold leading-tight text-[#111827]">
              Kelola Tes Diagnostik
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {diagnostics.length} tes tersedia . Tes ini dapat dipilih ke dalam
              tiap kelas
            </p>
          </div>

          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#2563EB] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Tes Diagnostik</span>
          </button>
        </header>

        <ul className="space-y-3">
          {diagnostics.map((diagnostic) => (
            <li
              key={diagnostic.id}
              className="flex items-start gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-5"
            >
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-semibold leading-tight text-[#111827]">
                  {diagnostic.title}
                </h2>

                <p className="mt-1.5 truncate text-lg text-[#6B7280]">
                  {diagnostic.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-[#9CA3AF]">
                  <span className="inline-flex rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-base font-semibold leading-none text-[#2563EB]">
                    {diagnostic.typeLabel}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardIcon className="h-4 w-4" />
                    {diagnostic.totalQuestions} soal
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    {diagnostic.durationMinutes} menit
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    {diagnostic.dateLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditDiagnostic(diagnostic)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition hover:bg-[#DBEAFE]"
                  aria-label={`Edit ${diagnostic.title}`}
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDiagnostic(diagnostic.id)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"
                  aria-label={`Delete ${diagnostic.title}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-[#111827]/50 p-4">
          <div
            className="absolute inset-0"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-90 w-full max-w-[900px] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
              <h3 className="text-xl font-semibold text-[#111827]">
                {isEditing
                  ? "Edit Tes Diagnostik"
                  : "Tambah Tes Diagnostik Baru"}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#1F2937]"
                aria-label="Tutup popup"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[72vh] space-y-6 overflow-y-auto px-6 py-5 thinnest-scrollbar">
              <div>
                <p className="text-lg font-semibold text-[#374151]">
                  Tipe Soal
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <div className="flex flex-wrap gap-2.5">
                    {typeOptions.map((option) => {
                      const isActive = selectedType === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedType(option.value)}
                          className={cn(
                            "rounded-2xl border px-5 py-2.5 text-lg font-semibold transition",
                            isActive
                              ? "border-[#2563EB] bg-[#2563EB] text-white"
                              : "border-[#D1D5DB] bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F3F4F6]",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addTypeOption}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-base font-semibold text-[#374151] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Tambah Tipe
                  </button>
                </div>

                <p className="mt-2 text-base text-[#9CA3AF]">
                  {selectedTypeMeta?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-base font-semibold text-[#374151]">
                    Judul Tes
                  </label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(event) => setTestTitle(event.target.value)}
                    placeholder="Judul tes diagnostik"
                    className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-semibold text-[#374151]">
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(event) => setDurationMinutes(event.target.value)}
                    className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-semibold text-[#374151]">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Deskripsi tes"
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-lg text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </div>

              <div className="space-y-3 border-t border-[#E5E7EB] pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#374151]">
                      Daftar Soal
                    </p>
                    <p className="text-base text-[#9CA3AF]">
                      {questionCountLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-2 text-lg font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Tambah Soal</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {questions.map((question, index) => {
                    const isOpen = openQuestionIds.includes(question.id);

                    return (
                      <div
                        key={question.id}
                        className="overflow-hidden rounded-2xl border border-[#E5E7EB]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleQuestion(question.id)}
                          className="flex w-full items-center gap-3 bg-[#F9FAFB] px-4 py-3 text-left"
                        >
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-xl font-semibold text-[#374151]">
                              Soal {index + 1}
                            </p>
                          </div>

                          <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1  font-semibold text-[#1D4ED8]">
                            Jawaban Benar: {question.correctAnswer}
                          </span>

                          <ChevronLeftIcon
                            className={cn(
                              "h-5 w-5 text-[#6B7280] transition-transform",
                              isOpen ? "-rotate-90" : "rotate-90",
                            )}
                          />
                        </button>

                        {isOpen && (
                          <div className="space-y-4 border-t border-[#E5E7EB] bg-white p-4">
                            <div className="space-y-2">
                              <label className="block text-lg font-semibold text-[#4B5563]">
                                Rumus Matematika (opsional)
                              </label>
                              <input
                                type="text"
                                value={question.formula}
                                onChange={(event) =>
                                  updateQuestion(
                                    question.id,
                                    (prevQuestion) => ({
                                      ...prevQuestion,
                                      formula: event.target.value,
                                    }),
                                  )
                                }
                                placeholder="Contoh: x^2 + 5x + 6 = 0 atau \\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
                                className="w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                              />

                              {question.formula && (
                                <div className="rounded-xl border border-dashed border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-sm text-[#1E3A8A]">
                                  Preview rumus: {question.formula}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-lg font-semibold text-[#4B5563]">
                                Pertanyaan
                              </label>
                              <textarea
                                value={question.prompt}
                                onChange={(event) =>
                                  updateQuestion(
                                    question.id,
                                    (prevQuestion) => ({
                                      ...prevQuestion,
                                      prompt: event.target.value,
                                    }),
                                  )
                                }
                                rows={3}
                                placeholder="Masukkan teks soal"
                                className="w-full resize-none rounded-2xl border border-[#D1D5DB] px-4 py-3 text-base text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-[#4B5563]">
                                Pilihan Jawaban (A - D)
                              </p>

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {CHOICE_KEYS.map((choiceKey) => {
                                  const isCorrect =
                                    question.correctAnswer === choiceKey;

                                  return (
                                    <div
                                      key={`${question.id}-${choiceKey}`}
                                      className={cn(
                                        "rounded-2xl border p-3",
                                        isCorrect
                                          ? "border-[#93C5FD] bg-[#EFF6FF]"
                                          : "border-[#E5E7EB] bg-white",
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-[#374151]">
                                          {choiceKey}
                                        </span>

                                        <input
                                          type="text"
                                          value={question.options[choiceKey]}
                                          onChange={(event) =>
                                            updateQuestion(
                                              question.id,
                                              (prevQuestion) => ({
                                                ...prevQuestion,
                                                options: {
                                                  ...prevQuestion.options,
                                                  [choiceKey]:
                                                    event.target.value,
                                                },
                                              }),
                                            )
                                          }
                                          placeholder={`Pilihan ${choiceKey}`}
                                          className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                                        />
                                      </div>

                                      <label className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#4B5563]">
                                        <input
                                          type="radio"
                                          name={`correct-answer-${question.id}`}
                                          checked={isCorrect}
                                          onChange={() =>
                                            updateQuestion(
                                              question.id,
                                              (prevQuestion) => ({
                                                ...prevQuestion,
                                                correctAnswer: choiceKey,
                                              }),
                                            )
                                          }
                                          className="h-4 w-4 accent-[#2563EB]"
                                        />
                                        Tandai sebagai jawaban benar
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

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
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-8 py-2.5 text-xl font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-[#2563EB] px-8 py-2.5 text-xl font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                {isEditing ? "Simpan Perubahan" : "Simpan Tes Diagnostik"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
