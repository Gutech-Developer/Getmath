"use client";

import TrashIcon from "@/components/atoms/icons/TrashIcon";
import {
  DiagnosticPreviewBody,
  ELKPDGradingPanel,
  MaterialPreviewPanel,
} from "@/components/organisms/learningAnalytics/ClassAnalyticsSequenceComponents";
import { RemedialPreviewBody } from "@/components/organisms/TeacherPreviewRemedialContent";
import { showToast } from "@/libs/toast";
import { cn } from "@/libs/utils";
import type { GsCourseModule } from "@/types/gs-course";
import type { GsDiagnosticTest as GsDiagnosticTestType } from "@/types/gs-diagnostic-test";
import type { ILearningAnalyticsStudentListItem } from "@/types/learningAnalytics";
import { useEffect, useRef, useState } from "react";

export interface IELKPDPreview {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
}

interface IMateriModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: GsCourseModule;
  diagnosticTest?: GsDiagnosticTestType;
  remedialTest?: any; // I'll use any or import GsRemedialTest later. Actually, wait! Let's import GsRemedialTest.
  elkpds?: IELKPDPreview[];
  students?: ILearningAnalyticsStudentListItem[];
  isLoading?: boolean;
  isDiagnosticLoading?: boolean;
  isRemedialLoading?: boolean;
  deadlineDraft: string;
  onDeadlineChange: (value: string) => void;
  onSaveDeadline: () => void;
  isSaving?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export const MateriModuleDetailModal: React.FC<
  IMateriModuleDetailModalProps
> = ({
  isOpen,
  onClose,
  module,
  diagnosticTest,
  remedialTest,
  elkpds = [],
  students = [],
  isLoading,
  isDiagnosticLoading,
  isRemedialLoading,
  deadlineDraft,
  onDeadlineChange,
  onSaveDeadline,
  isSaving,
  onDelete,
  isDeleting,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeELKPDId, setActiveELKPDId] = useState<string>("");
    const [activeSubTab, setActiveSubTab] = useState<
      "materi" | "diagnostic" | "remedial"
    >("materi");
    const [activeDiagTab, setActiveDiagTab] = useState<"diagnostic" | "remedial">(
      "diagnostic",
    );

    useEffect(() => {
      if (isOpen) {
        setActiveSubTab("materi");
        setActiveDiagTab("diagnostic");
      }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        onClick={handleBackdropClick}
        ref={modalRef}
      >
        {/* Modal Container - Responsive */}
        <div className="h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[95vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="text-lg font-bold text-[#1F2937]">Detail Modul</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 transition hover:bg-[#F3F4F6]"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5 text-[#6B7280]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="space-y-4 overflow-y-auto px-5 py-4 sm:max-h-[calc(90vh-120px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-[#6B7280]">Memuat detail modul...</p>
              </div>
            ) : module?.type === "DIAGNOSTIC_TEST" ? (
              <div className="space-y-4">
                {/* Tab Navigation for DIAGNOSTIC_TEST Module */}
                {module.remedialTestId && (
                  <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveDiagTab("diagnostic")}
                      className={cn(
                        "rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer",
                        activeDiagTab === "diagnostic"
                          ? "bg-lottie-teal text-white shadow-sm"
                          : "bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10",
                      )}
                    >
                      Tes Diagnostik
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagTab("remedial")}
                      className={cn(
                        "rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer",
                        activeDiagTab === "remedial"
                          ? "bg-lottie-teal text-white shadow-sm"
                          : "bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10",
                      )}
                    >
                      Tes Remedial
                    </button>
                  </div>
                )}

                {/* Tab Content: Tes Diagnostik */}
                {activeDiagTab === "diagnostic" && (
                  <div className="space-y-4">
                    {isDiagnosticLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-[#6B7280]">
                          Memuat preview tes diagnostik...
                        </p>
                      </div>
                    ) : diagnosticTest ? (
                      <DiagnosticPreviewBody test={diagnosticTest} />
                    ) : (
                      <p className="text-sm text-[#6B7280]">
                        Tes diagnostik tidak ditemukan
                      </p>
                    )}
                  </div>
                )}

                {/* Tab Content: Tes Remedial */}
                {activeDiagTab === "remedial" && (
                  <div className="space-y-4">
                    {isRemedialLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-[#6B7280]">
                          Memuat preview tes remedial...
                        </p>
                      </div>
                    ) : remedialTest ? (
                      <RemedialPreviewBody test={remedialTest} />
                    ) : (
                      <p className="text-sm text-[#6B7280]">
                        Tes remedial tidak ditemukan
                      </p>
                    )}
                  </div>
                )}

                {/* Deadline Input */}
                <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <label className="block text-sm font-semibold text-[#374151]">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadlineDraft}
                    onChange={(event) => onDeadlineChange(event.target.value)}
                    className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3 text-sm text-[#1F2937] transition focus:border-lottie-teal focus:outline-none focus:ring-2 focus:ring-lottie-mint-glow/50"
                  />
                </div>
              </div>
            ) : module?.type === "REMEDIAL" ? (
              <div className="space-y-4">
                {isRemedialLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-[#6B7280]">
                      Memuat preview tes remedial...
                    </p>
                  </div>
                ) : remedialTest ? (
                  <>
                    <RemedialPreviewBody test={remedialTest} />

                    <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                      <label className="block text-sm font-semibold text-[#374151]">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={deadlineDraft}
                        onChange={(event) => onDeadlineChange(event.target.value)}
                        className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3 text-sm text-[#1F2937] transition focus:border-lottie-teal focus:outline-none focus:ring-2 focus:ring-lottie-mint-glow/50"
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ) : module?.type === "SUBJECT" ? (
              <div className="space-y-4">
                {/* Tabs for SUBJECT Module Sub-sections */}
                {(module.diagnosticTestId || module.remedialTestId) && (
                  <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab("materi")}
                      className={cn(
                        "rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer",
                        activeSubTab === "materi"
                          ? "bg-lottie-teal text-white shadow-sm"
                          : "bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10",
                      )}
                    >
                      Materi & Tugas
                    </button>
                    {module.diagnosticTestId && (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("diagnostic")}
                        className={cn(
                          "rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer",
                          activeSubTab === "diagnostic"
                            ? "bg-lottie-teal text-white shadow-sm"
                            : "bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10",
                        )}
                      >
                        Tes Diagnostik
                      </button>
                    )}
                    {module.remedialTestId && (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("remedial")}
                        className={cn(
                          "rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer",
                          activeSubTab === "remedial"
                            ? "bg-lottie-teal text-white shadow-sm"
                            : "bg-lottie-teal/5 text-lottie-teal hover:bg-lottie-teal/10",
                        )}
                      >
                        Tes Remedial
                      </button>
                    )}
                  </div>
                )}

                {/* Tab 1: Materi & Tugas */}
                {activeSubTab === "materi" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        Modul Materi
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#1F2937]">
                        {module.subject?.subjectName ?? "-"}
                      </p>
                      {module.subject?.description && (
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {module.subject.description}
                        </p>
                      )}
                    </div>

                    {module.subject ? (
                      <MaterialPreviewPanel
                        items={[
                          ...(module.subject.subjectFileUrl
                            ? [
                              {
                                title: module.subject.subjectName,
                                url: module.subject.subjectFileUrl,
                                type: "pdf" as const,
                              },
                            ]
                            : []),
                          ...(module.subject.videoUrl
                            ? [
                              {
                                title: `Video: ${module.subject.subjectName}`,
                                url: module.subject.videoUrl,
                                type: "video" as const,
                              },
                            ]
                            : []),
                          ...(module.subject.eLKPDTitle &&
                            module.subject.eLKPDFileUrl
                            ? [
                              {
                                title: `E-LKPD: ${module.subject.eLKPDTitle}`,
                                url: module.subject.eLKPDFileUrl,
                                type: "elkpd" as const,
                              },
                            ]
                            : []),
                        ]}
                      />
                    ) : null}

                    {/* E-LKPD Section */}
                    {elkpds.length > 0 && (
                      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                        <h3 className="mb-3 text-sm font-semibold text-[#1F2937]">
                          Nilai E-LKPD Siswa
                        </h3>
                        <ELKPDGradingPanel
                          elkpds={elkpds}
                          students={students}
                          activeELKPDId={activeELKPDId}
                          onELKPDChange={setActiveELKPDId}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Tes Diagnostik */}
                {activeSubTab === "diagnostic" && (
                  <div className="space-y-4">
                    {isDiagnosticLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-[#6B7280]">
                          Memuat preview tes diagnostik...
                        </p>
                      </div>
                    ) : diagnosticTest ? (
                      <DiagnosticPreviewBody test={diagnosticTest} />
                    ) : (
                      <p className="text-sm text-[#6B7280]">
                        Tes diagnostik tidak ditemukan
                      </p>
                    )}
                  </div>
                )}

                {/* Tab 3: Tes Remedial */}
                {activeSubTab === "remedial" && (
                  <div className="space-y-4">
                    {isRemedialLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-[#6B7280]">
                          Memuat preview tes remedial...
                        </p>
                      </div>
                    ) : remedialTest ? (
                      <RemedialPreviewBody test={remedialTest} />
                    ) : (
                      <p className="text-sm text-[#6B7280]">
                        Tes remedial tidak ditemukan
                      </p>
                    )}
                  </div>
                )}

                {/* Deadline Input - Always visible below whatever subtab is active */}
                <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <label className="block text-sm font-semibold text-[#374151]">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadlineDraft}
                    onChange={(event) => onDeadlineChange(event.target.value)}
                    className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3 text-sm text-[#1F2937] transition focus:border-lottie-teal focus:outline-none focus:ring-2 focus:ring-lottie-mint-glow/50"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-[#6B7280]">
                  Tipe modul tidak dikenali
                </p>
              </div>
            )}
          </div>

          {/* Footer - Sticky */}
          <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DC2626] bg-white px-4 py-2 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Hapus modul ini"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isDeleting ? "Menghapus..." : "Hapus"}
                  </span>
                </button>
              )}
            </div>

            <div className="flex gap-2 p-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#D1D5DB] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={onSaveDeadline}
                disabled={isSaving}
                className="rounded-xl bg-lottie-teal hover:bg-lottie-teal/90 duration-200 text-white font-semibold px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
