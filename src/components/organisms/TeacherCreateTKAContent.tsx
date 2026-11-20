"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import MathText from "@/components/atoms/MathText";
import { AlertBanner } from "@/components/molecules/AlertBanner";
import TkaSchoolPicker from "@/components/molecules/tka/TkaSchoolPicker";
import TkaTeacherPicker from "@/components/molecules/tka/TkaTeacherPicker";
import { TKA_STATUS_LABEL } from "@/constant/tka";
import { getGsFieldErrors, GsApiError } from "@/libs/api";
import { showToast } from "@/libs/toast";
import {
  cn,
  latexTextToTiptapHtml,
  tiptapHtmlToLatexHtml,
} from "@/libs/utils";
import {
  useCreateTka,
  useRichTextUpload,
  useTkaAnalytics,
  useTkaDetail,
  useUpdateTka,
} from "@/services";
import type {
  CreateTKATestInput,
  TKAQuestion,
  TKAQuestionInput,
  TKAQuestionType,
  TKAStatus,
  UpdateTKATestInput,
} from "@/types/tka";
import {
  formatTkaDateTime,
  toDateTimeLocalValue,
  toIsoOrUndefined,
  validateTkaPublishGate,
  validateTkaQuestionDraft,
} from "@/utils/tka";

const MathEditor = dynamic(() => import("@/components/atoms/MathEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[80px] rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB]" />
  ),
});

type Role = "admin" | "teacher";

interface IOptionDraft {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

interface IStatementDraft {
  id?: string;
  statementText: string;
  isTrue: boolean | null;
}

interface IQuestionDraft {
  id: string;
  questionType: TKAQuestionType;
  questionText: string;
  options: IOptionDraft[];
  statements: IStatementDraft[];
}

const inputClass =
  "w-full rounded-2xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-lottie-teal focus:ring-2 focus:ring-lottie-mint-glow/50 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]";

function createOption(): IOptionDraft {
  return { optionText: "", isCorrect: false };
}

function createStatement(): IStatementDraft {
  return { statementText: "", isTrue: null };
}

function createQuestion(type: TKAQuestionType = "MULTIPLE_CHOICE"): IQuestionDraft {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    questionType: type,
    questionText: "",
    options:
      type === "COMPLEX_TRUE_FALSE"
        ? []
        : [createOption(), createOption()],
    statements:
      type === "COMPLEX_TRUE_FALSE" ? [createStatement()] : [],
  };
}

function hydrateQuestion(question: TKAQuestion): IQuestionDraft {
  return {
    id: question.id,
    questionType: question.questionType,
    questionText: latexTextToTiptapHtml(question.questionText ?? ""),
    options: (question.options ?? []).map((option) => ({
      id: option.id,
      optionText: latexTextToTiptapHtml(option.optionText ?? ""),
      isCorrect: option.isCorrect,
    })),
    statements: (question.statements ?? []).map((statement) => ({
      id: statement.id,
      statementText: latexTextToTiptapHtml(statement.statementText ?? ""),
      isTrue: statement.isTrue,
    })),
  };
}

function toQuestionInputs(questions: IQuestionDraft[]): TKAQuestionInput[] {
  return questions.map((question, index) => ({
    questionNumber: index + 1,
    questionType: question.questionType,
    questionText: tiptapHtmlToLatexHtml(question.questionText) || "",
    options:
      question.questionType === "COMPLEX_TRUE_FALSE"
        ? undefined
        : question.options.map((option) => ({
            id: option.id,
            optionText: tiptapHtmlToLatexHtml(option.optionText) || "",
            isCorrect: option.isCorrect,
          })),
    statements:
      question.questionType === "COMPLEX_TRUE_FALSE"
        ? question.statements.map((statement) => ({
            id: statement.id,
            statementText:
              tiptapHtmlToLatexHtml(statement.statementText) || "",
            isTrue: statement.isTrue === true,
          }))
        : undefined,
  }));
}

export default function TeacherCreateTKAContent({
  editId,
  role = "teacher",
}: {
  editId?: string;
  role?: Role;
}) {
  const router = useRouter();
  const listPath =
    role === "admin"
      ? "/admin/dashboard/manage-tka"
      : "/teacher/dashboard/manage-tka";

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useTkaDetail(editId ?? "", Boolean(editId));
  const { data: analytics, isLoading: isAnalyticsLoading } = useTkaAnalytics(
    editId ?? "",
    { limit: 1 },
    Boolean(editId),
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [status, setStatus] = useState<TKAStatus>("DRAFT");
  const [accessCode, setAccessCode] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolLabel, setSchoolLabel] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacherLabel, setTeacherLabel] = useState("");
  const [questions, setQuestions] = useState<IQuestionDraft[]>([
    createQuestion(),
  ]);
  const [questionsDirty, setQuestionsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(!editId);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const accessCodeRef = useRef<HTMLInputElement | null>(null);

  const createMutation = useCreateTka();
  const updateMutation = useUpdateTka(editId ?? "");
  const {
    onImageUpload: handleImageUpload,
    onImageDelete: handleImageDelete,
    isUploadingImage,
  } = useRichTextUpload();

  const joinedCount = analytics?.overview.joinedCount ?? 0;
  const isCompleted = detail?.status === "COMPLETED";
  const isLocked =
    isCompleted || (Boolean(editId) && isAnalyticsLoading) || joinedCount > 0;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!editId || !detail || hydrated) return;
    setTitle(detail.title);
    setDescription(detail.description ?? "");
    setSchoolYear(detail.schoolYear ?? "");
    setDurationMinutes(String(detail.durationMinutes));
    setStatus(detail.status);
    setAccessCode("");
    setStartAt(toDateTimeLocalValue(detail.startAt));
    setEndAt(toDateTimeLocalValue(detail.endAt));
    setSchoolId(detail.schoolId);
    setSchoolLabel(detail.schoolName);
    setTeacherId(detail.teacherId ?? "");
    setTeacherLabel(detail.teacherName ?? "");
    setQuestions(
      detail.questions.length > 0
        ? detail.questions.map(hydrateQuestion)
        : [createQuestion()],
    );
    setQuestionsDirty(false);
    setHydrated(true);
  }, [detail, editId, hydrated]);

  const statusOptions = useMemo(() => {
    if (!editId) return ["DRAFT", "AVAILABLE"] as TKAStatus[];
    if (detail?.status === "DRAFT") return ["DRAFT", "AVAILABLE"] as TKAStatus[];
    if (detail?.status === "COMPLETED") return ["COMPLETED"] as TKAStatus[];
    return (
      isLocked ? ["AVAILABLE", "COMPLETED"] : ["DRAFT", "AVAILABLE", "COMPLETED"]
    ) as TKAStatus[];
  }, [detail?.status, editId, isLocked]);

  const updateQuestion = (
    questionId: string,
    updater: (question: IQuestionDraft) => IQuestionDraft,
  ) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? updater(question) : question,
      ),
    );
    setQuestionsDirty(true);
  };

  const updateQuestionType = (
    questionId: string,
    questionType: TKAQuestionType,
  ) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      questionType,
      options:
        questionType === "COMPLEX_TRUE_FALSE"
          ? []
          : question.options.length >= 2
            ? question.options
            : [createOption(), createOption()],
      statements:
        questionType === "COMPLEX_TRUE_FALSE"
          ? question.statements.length > 0
            ? question.statements
            : [createStatement()]
          : [],
    }));
  };

  const updateOption = (
    questionId: string,
    index: number,
    patch: Partial<IOptionDraft>,
  ) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: question.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    }));
  };

  const updateStatement = (
    questionId: string,
    index: number,
    patch: Partial<IStatementDraft>,
  ) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      statements: question.statements.map((statement, statementIndex) =>
        statementIndex === index ? { ...statement, ...patch } : statement,
      ),
    }));
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: [...question.options, createOption()],
    }));
  };

  const removeOption = (questionId: string, index: number) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options:
        question.options.length <= 2
          ? question.options
          : question.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const addStatement = (questionId: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      statements: [...question.statements, createStatement()],
    }));
  };

  const removeStatement = (questionId: string, index: number) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      statements:
        question.statements.length <= 1
          ? question.statements
          : question.statements.filter(
              (_, statementIndex) => statementIndex !== index,
            ),
    }));
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, createQuestion()]);
    setQuestionsDirty(true);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) =>
      current.length <= 1
        ? current
        : current.filter((question) => question.id !== questionId),
    );
    setQuestionsDirty(true);
  };

  const validateForm = (questionInputs: TKAQuestionInput[]) => {
    const errors: Record<string, string> = {};

    if (title.trim().length < 3) {
      errors.title = "Judul minimal 3 karakter";
    }

    const duration = Number(durationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
      errors.durationMinutes = "Durasi harus 1 sampai 600 menit";
    }

    if (role === "admin" && !editId && !schoolId) {
      errors.schoolId = "Pilih sekolah terlebih dahulu";
    }

    if (accessCode.trim() && accessCode.trim().length < 4) {
      errors.accessCode = "Kode akses minimal 4 karakter";
    }
    if (accessCode.trim().length > 50) {
      errors.accessCode = "Kode akses maksimal 50 karakter";
    }

    if ((startAt && !endAt) || (!startAt && endAt)) {
      errors.endAt = "Jadwal harus diisi berpasangan";
    }

    if (editId && detail?.startAt && (!startAt || !endAt)) {
      errors.endAt = "Jadwal yang sudah ada tidak dapat dikosongkan";
    }

    const startIso = toIsoOrUndefined(startAt);
    const endIso = toIsoOrUndefined(endAt);
    if (startIso && endIso && new Date(startIso) >= new Date(endIso)) {
      errors.endAt = "Waktu mulai harus lebih awal dari waktu selesai";
    }

    for (let index = 0; index < questions.length; index++) {
      const draft = questions[index];
      if (
        draft.questionType === "COMPLEX_TRUE_FALSE" &&
        draft.statements.some((statement) => statement.isTrue === null)
      ) {
        errors.questions = `Soal ${index + 1}: pilih Benar/Salah untuk semua pernyataan`;
        break;
      }
      const questionError = validateTkaQuestionDraft(questionInputs[index]);
      if (questionError) {
        errors.questions = `Soal ${index + 1}: ${questionError}`;
        break;
      }
    }

    const publishError = validateTkaPublishGate({
      status,
      questions: questionInputs,
      startAt: startIso,
      endAt: endIso,
    });
    if (publishError) {
      errors.publish = publishError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (isCompleted) return;

    const questionInputs = toQuestionInputs(questions);
    if (!validateForm(questionInputs)) {
      showToast.error("Periksa kembali isian TKA");
      return;
    }

    if (isLocked && questionsDirty) {
      showToast.error(
        "Bank soal tidak dapat diubah karena sudah ada siswa yang mengerjakan",
      );
      return;
    }

    const startIso = toIsoOrUndefined(startAt);
    const endIso = toIsoOrUndefined(endAt);

    if (!editId) {
      const payload: CreateTKATestInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        schoolYear: schoolYear.trim() || undefined,
        durationMinutes: Number(durationMinutes),
        status: status === "AVAILABLE" ? "AVAILABLE" : "DRAFT",
        accessCode: accessCode.trim() || undefined,
        startAt: startIso,
        endAt: endIso,
        questions: questionInputs.length > 0 ? questionInputs : undefined,
        ...(role === "admin"
          ? {
              schoolId,
              teacherId: teacherId || undefined,
            }
          : {}),
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast.success("TKA berhasil dibuat");
          router.push(listPath);
        },
        onError: (error) => handleMutationError(error),
      });
      return;
    }

    const payload: UpdateTKATestInput = {
      title: title.trim(),
      description: description.trim() || null,
      schoolYear: schoolYear.trim() || null,
      status,
      accessCode: accessCode.trim() || undefined,
      startAt: startIso,
      endAt: endIso,
    };

    if (!isLocked) {
      payload.durationMinutes = Number(durationMinutes);
      if (questionsDirty) {
        payload.questions = questionInputs;
      }
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        showToast.success("TKA berhasil diperbarui");
        router.push(listPath);
      },
      onError: (error) => handleMutationError(error),
    });
  };

  const handleMutationError = (error: Error) => {
    if (error instanceof GsApiError) {
      const nextErrors: Record<string, string> = {};
      for (const fieldError of getGsFieldErrors(error.errors)) {
        nextErrors[fieldError.field] = fieldError.message;
      }
      if (
        error.status === 409 &&
        error.message.toLowerCase().includes("kode akses")
      ) {
        nextErrors.accessCode = error.message;
        accessCodeRef.current?.focus();
        accessCodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      setFieldErrors(nextErrors);
    }
    showToast.error(error.message);
  };

  if (editId && isDetailLoading) {
    return (
      <div className="getmath-card p-8 text-center text-sm text-[#9CA3AF]">
        Memuat TKA...
      </div>
    );
  }

  if (editId && isDetailError) {
    return (
      <div className="getmath-card space-y-3 p-8 text-center text-sm text-rose-600">
        <p>{detailError.message}</p>
        <button
          type="button"
          onClick={() => router.push(listPath)}
          className="rounded-xl bg-lottie-teal px-4 py-2 text-sm font-semibold text-white"
        >
          Kembali ke daftar TKA
        </button>
      </div>
    );
  }

  return (
    <section className="w-full space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(listPath)}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-lottie-teal"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Kembali
          </button>
          <h1 className="text-xl font-semibold leading-tight text-[#111827]">
            {editId ? "Edit TKA" : "Buat TKA"}
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {role === "admin"
              ? "Atur TKA untuk sekolah dan guru target"
              : "TKA akan otomatis terhubung ke profil gurumu"}
          </p>
        </div>

        {!isCompleted && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl bg-lottie-teal px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan TKA"}
          </button>
        )}
      </header>

      {isLocked && (
        <AlertBanner variant="warning">
          {isCompleted
            ? "TKA sudah selesai dan tidak dapat diubah."
            : "Sudah ada siswa yang mengerjakan TKA ini. Bank soal, durasi, dan pengembalian ke Draft dikunci."}
        </AlertBanner>
      )}

      <section className="getmath-card space-y-4 p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#4B5563]">
            Judul TKA <span className="text-[#EF4444]">*</span>
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={255}
            disabled={isCompleted}
            className={cn(inputClass, fieldErrors.title && "border-rose-400")}
            placeholder="Contoh: Try Out TKA Matematika Semester Ganjil"
          />
          {fieldErrors.title && (
            <p className="text-xs text-rose-600">{fieldErrors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#4B5563]">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={3}
            disabled={isCompleted}
            className={cn(inputClass, "resize-none")}
            placeholder="Deskripsi singkat TKA..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#4B5563]">
              Tahun Ajaran
            </label>
            <input
              value={schoolYear}
              onChange={(event) => setSchoolYear(event.target.value)}
              maxLength={50}
              disabled={isCompleted}
              className={inputClass}
              placeholder="2026/2027"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#4B5563]">
              Durasi (menit) <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={600}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              disabled={isCompleted || (isLocked && Boolean(editId))}
              className={cn(
                inputClass,
                fieldErrors.durationMinutes && "border-rose-400",
              )}
            />
            {fieldErrors.durationMinutes && (
              <p className="text-xs text-rose-600">
                {fieldErrors.durationMinutes}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#4B5563]">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TKAStatus)}
              disabled={isCompleted}
              className={inputClass}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {TKA_STATUS_LABEL[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#4B5563]">
              Kode Akses
            </label>
            <input
              ref={accessCodeRef}
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              disabled={isCompleted}
              maxLength={50}
              className={cn(
                inputClass,
                fieldErrors.accessCode && "border-rose-400",
              )}
              placeholder={
                editId && detail?.accessCode
                  ? `Kode saat ini: ${detail.accessCode}`
                  : "Kosongkan untuk dibuat otomatis"
              }
            />
            {fieldErrors.accessCode && (
              <p className="text-xs text-rose-600">{fieldErrors.accessCode}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#4B5563]">
              Mulai
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              disabled={isCompleted}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#4B5563]">
              Selesai
            </label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              disabled={isCompleted}
              className={cn(inputClass, fieldErrors.endAt && "border-rose-400")}
            />
            {fieldErrors.endAt && (
              <p className="text-xs text-rose-600">{fieldErrors.endAt}</p>
            )}
          </div>

          {role === "admin" && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#4B5563]">
                Sekolah <span className="text-[#EF4444]">*</span>
              </label>
              {editId ? (
                <input
                  value={detail?.schoolName ?? ""}
                  disabled
                  className={inputClass}
                />
              ) : (
                <TkaSchoolPicker
                  valueLabel={schoolLabel}
                  onChange={(nextSchoolId, nextSchoolLabel) => {
                    setSchoolId(nextSchoolId);
                    setSchoolLabel(nextSchoolLabel);
                    setTeacherId("");
                    setTeacherLabel("");
                  }}
                  required
                  disabled={isCompleted}
                />
              )}
              {fieldErrors.schoolId && (
                <p className="text-xs text-rose-600">{fieldErrors.schoolId}</p>
              )}
            </div>
          )}

          {role === "admin" && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#4B5563]">
                Guru
              </label>
              {editId ? (
                <input
                  value={detail?.teacherName ?? "Tanpa Guru / Milik Sekolah"}
                  disabled
                  className={inputClass}
                />
              ) : (
                <TkaTeacherPicker
                  schoolId={schoolId}
                  valueLabel={teacherLabel}
                  onChange={(nextTeacherId, nextTeacherLabel) => {
                    setTeacherId(nextTeacherId);
                    setTeacherLabel(nextTeacherLabel);
                  }}
                />
              )}
            </div>
          )}

          {editId && detail && (
            <div className="space-y-1.5 md:col-span-2">
              <p className="text-xs text-[#9CA3AF]">
                Dibuat {formatTkaDateTime(detail.createdAt)} · Diperbarui{" "}
                {formatTkaDateTime(detail.updatedAt)}
              </p>
            </div>
          )}
        </div>

        {fieldErrors.publish && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {fieldErrors.publish}
          </p>
        )}
        {fieldErrors.questions && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {fieldErrors.questions}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">
              Bank Soal
            </h2>
            <p className="text-sm text-[#9CA3AF]">
              {questions.length} soal · bobot{" "}
              {questions.length > 0
                ? Math.round((100 / questions.length) * 100) / 100
                : 0}{" "}
              per soal
            </p>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            disabled={isCompleted || isLocked}
            className="inline-flex items-center gap-2 rounded-xl bg-lottie-teal/10 px-4 py-2 text-sm font-semibold text-lottie-teal disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" /> Tambah Soal
          </button>
        </div>

        {questions.map((question, questionIndex) => (
          <article key={question.id} className="getmath-card space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lottie-teal text-sm font-semibold text-white">
                  {questionIndex + 1}
                </span>
                <select
                  value={question.questionType}
                  onChange={(event) =>
                    updateQuestionType(
                      question.id,
                      event.target.value as TKAQuestionType,
                    )
                  }
                  disabled={isCompleted || isLocked}
                  className="rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm"
                >
                  <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                  <option value="MCMA">Pilihan Ganda Kompleks (MCMA)</option>
                  <option value="COMPLEX_TRUE_FALSE">Benar/Salah Kompleks</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(question.id)}
                disabled={isCompleted || isLocked || questions.length <= 1}
                className="inline-flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-[#DC2626] disabled:opacity-40"
              >
                <TrashIcon className="h-4 w-4" /> Hapus
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#4B5563]">
                Pertanyaan <span className="text-[#EF4444]">*</span>
              </label>
              <MathEditor
                key={`${question.id}-prompt`}
                value={question.questionText}
                onChange={(value) =>
                  updateQuestion(question.id, (current) => ({
                    ...current,
                    questionText: value,
                  }))
                }
                placeholder="Masukkan teks soal..."
                disabled={isCompleted || isLocked}
                isUploadingImage={isUploadingImage}
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
              />
            </div>

            {question.questionType !== "COMPLEX_TRUE_FALSE" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#4B5563]">
                    Opsi Jawaban
                  </p>
                  <button
                    type="button"
                    onClick={() => addOption(question.id)}
                    disabled={isCompleted || isLocked}
                    className="text-sm font-semibold text-lottie-teal disabled:opacity-40"
                  >
                    + Tambah opsi
                  </button>
                </div>
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`${question.id}-option-${optionIndex}`}
                    className="flex items-start gap-2"
                  >
                    <input
                      type={
                        question.questionType === "MCMA"
                          ? "checkbox"
                          : "radio"
                      }
                      name={`correct-${question.id}`}
                      checked={option.isCorrect}
                      onChange={(event) =>
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          options: current.options.map((item, index) => ({
                            ...item,
                            isCorrect:
                              index === optionIndex
                                ? event.target.checked
                                : question.questionType === "MCMA"
                                  ? item.isCorrect
                                  : false,
                          })),
                        }))
                      }
                      disabled={isCompleted || isLocked}
                      className="mt-3 h-4 w-4 accent-lottie-teal"
                    />
                    <div className="flex-1">
                      <MathEditor
                        key={`${question.id}-option-${optionIndex}-editor`}
                        value={option.optionText}
                        onChange={(value) =>
                          updateOption(question.id, optionIndex, {
                            optionText: value,
                          })
                        }
                        placeholder={`Opsi ${String.fromCharCode(65 + optionIndex)}`}
                        disabled={isCompleted || isLocked}
                        isUploadingImage={isUploadingImage}
                        onImageUpload={handleImageUpload}
                        onImageDelete={handleImageDelete}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(question.id, optionIndex)}
                      disabled={
                        isCompleted ||
                        isLocked ||
                        question.options.length <= 2
                      }
                      className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 disabled:opacity-40"
                      aria-label={`Hapus opsi ${optionIndex + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#4B5563]">
                    Pernyataan Benar/Salah
                  </p>
                  <button
                    type="button"
                    onClick={() => addStatement(question.id)}
                    disabled={isCompleted || isLocked}
                    className="text-sm font-semibold text-lottie-teal disabled:opacity-40"
                  >
                    + Tambah pernyataan
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-[#F8FAFC] text-left text-xs uppercase tracking-wide text-[#64748B]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Pernyataan</th>
                        <th className="w-20 px-3 py-2 text-center font-semibold">
                          Benar
                        </th>
                        <th className="w-20 px-3 py-2 text-center font-semibold">
                          Salah
                        </th>
                        <th className="w-14 px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {question.statements.map((statement, statementIndex) => (
                        <tr
                          key={`${question.id}-statement-${statementIndex}`}
                          className="border-t border-[#E5E7EB] align-top"
                        >
                          <td className="min-w-[360px] p-3">
                            <MathEditor
                              key={`${question.id}-statement-${statementIndex}-editor`}
                              value={statement.statementText}
                              onChange={(value) =>
                                updateStatement(question.id, statementIndex, {
                                  statementText: value,
                                })
                              }
                              placeholder={`Pernyataan ${statementIndex + 1}`}
                              disabled={isCompleted || isLocked}
                              isUploadingImage={isUploadingImage}
                              onImageUpload={handleImageUpload}
                              onImageDelete={handleImageDelete}
                            />
                          </td>
                          {[true, false].map((value) => (
                            <td
                              key={String(value)}
                              className="px-3 py-3 text-center"
                            >
                              <input
                                type="radio"
                                name={`statement-${question.id}-${statementIndex}`}
                                checked={statement.isTrue === value}
                                onChange={() =>
                                  updateStatement(question.id, statementIndex, {
                                    isTrue: value,
                                  })
                                }
                                disabled={isCompleted || isLocked}
                                className="h-4 w-4 accent-lottie-teal"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                removeStatement(question.id, statementIndex)
                              }
                              disabled={
                                isCompleted ||
                                isLocked ||
                                question.statements.length <= 1
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 disabled:opacity-40"
                              aria-label={`Hapus pernyataan ${statementIndex + 1}`}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#F8FAFC] p-3 text-sm text-[#64748B]">
              Pratinjau:{" "}
              <MathText
                text={tiptapHtmlToLatexHtml(question.questionText) || "Soal"}
              />
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          disabled={isCompleted || isLocked}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-lottie-teal/40 px-4 py-4 text-sm font-semibold text-lottie-teal disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" /> Tambah Soal
        </button>
      </section>

      {!isCompleted && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(listPath)}
            className="rounded-2xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl bg-lottie-teal px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan TKA"}
          </button>
        </div>
      )}
    </section>
  );
}
