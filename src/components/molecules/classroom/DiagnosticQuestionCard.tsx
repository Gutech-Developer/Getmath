import { cn } from "@/libs/utils";
import type { IDiagnosticQuestion } from "@/types/classDiagnosis";

interface DiagnosticQuestionCardProps {
  question: IDiagnosticQuestion;
  questionNumber: number;
  selectedOptionId: string | null;
  onSelectOption: (questionId: string, optionId: string) => void;
}

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Mudah: { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
  Sedang: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  Sulit: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

export default function DiagnosticQuestionCard({
  question,
  questionNumber,
  selectedOptionId,
  onSelectOption,
}: DiagnosticQuestionCardProps) {
  const difficultyStyle =
    question.difficulty ? DIFFICULTY_STYLES[question.difficulty] : null;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#1D4ED8]">
          {question.topic}
        </span>
        {difficultyStyle && (
          <span
            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{
              background: difficultyStyle.bg,
              color: difficultyStyle.text,
              borderColor: difficultyStyle.border,
            }}
          >
            {question.difficulty}
          </span>
        )}
        <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-semibold text-[#64748B]">
          {question.typeLabel}
        </span>
      </div>

      {/* Question header */}
      <div className="mt-4 flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-bold text-white">
          {questionNumber}
        </span>
        <h2 className="text-[15px] font-semibold leading-6 text-[#0F172A]">
          {question.prompt}
        </h2>
      </div>

      {/* Options */}
      <ul className="mt-4 space-y-2.5">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelectOption(question.id, option.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                  isSelected
                    ? "border-[#93C5FD] bg-[#EFF6FF]"
                    : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    isSelected
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-[#CBD5E1] bg-white text-[#64748B]",
                  )}
                >
                  {option.label}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    isSelected ? "font-medium text-[#1D4ED8]" : "text-[#334155]",
                  )}
                >
                  {option.text}
                </span>
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-[#2563EB]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
