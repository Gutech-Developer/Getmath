"use client";

import { useState } from "react";
import { cn } from "@/libs/utils";

export interface IELKPDShortAnswer {
  id: string;
  questionHtml: string;
}

export interface IELKPDStep {
  id: string;
  label: string;
}

export interface IELKPDFormProps {
  title?: string;
  topic?: string;
  shortAnswerQuestions?: IELKPDShortAnswer[];
  uraianInstruction?: string;
  uraianEquation?: string;
  uraianSteps?: IELKPDStep[];
  onSubmit?: (data: {
    shortAnswers: Record<string, string>;
    uraianAnswers: Record<string, string>;
  }) => void;
}

const DEFAULT_SHORT_ANSWERS: IELKPDShortAnswer[] = [
  {
    id: "sa-1",
    questionHtml:
      "Selesaikan persamaan <span class='text-[#2563EB] font-semibold'>x² + 5x + 6 = 0</span> dengan metode faktorisasi.",
  },
  {
    id: "sa-2",
    questionHtml:
      "Tentukan nilai diskriminan dari <span class='text-[#2563EB] font-semibold'>2x² – 4x + 2 = 0</span>.",
  },
  {
    id: "sa-3",
    questionHtml:
      "Titik potong grafik <span class='text-[#2563EB] font-semibold'>y = x² – 4</span> dengan sumbu-x adalah ...",
  },
];

const DEFAULT_URAIAN_STEPS: IELKPDStep[] = [
  { id: "step-1", label: "Langkah 1: Identifikasi koefisien a, b, dan c" },
  { id: "step-2", label: "Langkah 2: Hitung diskriminan D = b² – 4ac" },
  { id: "step-3", label: "Hasil Akhir" },
];

export default function ELKPDForm({
  title = "Elektronik Lembar Kerja Peserta Didik (E-LKPD)",
  topic = "Topik: Aljabar Dasar – Persamaan Linier",
  shortAnswerQuestions = DEFAULT_SHORT_ANSWERS,
  uraianInstruction = "Selesaikan persamaan kuadrat berikut menggunakan rumus ABC (rumus kuadratik). Tunjukkan setiap langkah penyelesaian dengan jelas.",
  uraianEquation = "3x² – 7x + 2 = 0",
  uraianSteps = DEFAULT_URAIAN_STEPS,
  onSubmit,
}: IELKPDFormProps) {
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(shortAnswerQuestions.map((q) => [q.id, ""])),
  );
  const [uraianAnswers, setUraianAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(uraianSteps.map((s) => [s.id, ""])),
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit?.({ shortAnswers, uraianAnswers });
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl bg-[#2563EB] px-5 py-4 text-white shadow-[0_10px_30px_rgba(37,99,235,0.22)]">
        <h2 className="text-lg font-bold leading-snug">{title}</h2>
        <p className="mt-1 text-sm text-white/80">{topic}</p>
      </div>

      {/* Section A — Isian Singkat */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
            A
          </span>
          <h3 className="font-semibold text-[#0F172A]">Isian Singkat</h3>
        </div>

        <div className="space-y-5">
          {shortAnswerQuestions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <p className="text-sm leading-6 text-[#334155]">
                <span className="mr-1.5 font-semibold text-[#0F172A]">
                  {index + 1}.
                </span>
                <span
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: question.questionHtml }}
                />
              </p>
              <input
                type="text"
                value={shortAnswers[question.id] ?? ""}
                onChange={(e) =>
                  setShortAnswers((prev) => ({
                    ...prev,
                    [question.id]: e.target.value,
                  }))
                }
                placeholder="Jawaban..."
                disabled={submitted}
                className={cn(
                  "w-full border-0 border-b-2 border-[#2563EB] bg-transparent pb-1 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-0",
                  submitted && "opacity-60 cursor-not-allowed",
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section B — Uraian Langkah */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0FDF4] text-sm font-bold text-[#16A34A]">
            B
          </span>
          <h3 className="font-semibold text-[#0F172A]">Uraian Langkah</h3>
        </div>

        <p className="text-sm leading-6 text-[#475569]">{uraianInstruction}</p>

        {/* Equation display */}
        <div className="my-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-center">
          <span className="font-mono text-base font-semibold text-[#1E293B]">
            {uraianEquation}
          </span>
        </div>

        {/* Step table */}
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Langkah
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Penyelesaian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {uraianSteps.map((step) => (
                <tr key={step.id} className="bg-white">
                  <td className="w-48 px-4 py-3 align-top text-xs font-medium text-[#334155]">
                    {step.label}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={uraianAnswers[step.id] ?? ""}
                      onChange={(e) =>
                        setUraianAnswers((prev) => ({
                          ...prev,
                          [step.id]: e.target.value,
                        }))
                      }
                      placeholder="Tulis jawabanmu..."
                      disabled={submitted}
                      className={cn(
                        "w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]/25",
                        submitted && "opacity-60 cursor-not-allowed",
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitted}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] transition",
          submitted
            ? "bg-[#16A34A] cursor-default"
            : "bg-[#2563EB] hover:bg-[#1D4ED8]",
        )}
      >
        {submitted ? (
          <>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
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
            E-LKPD Berhasil Dikumpulkan
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Kumpulkan E-LKPD
          </>
        )}
      </button>
    </div>
  );
}
