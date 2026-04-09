import { cn } from "@/libs/utils";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import type { IModuleItem, ModuleStepState } from "@/types/classMaterial";

interface MaterialSidebarPanelProps {
  modules: IModuleItem[];
  openModuleId: string | null;
  selectedStepId: string | null;
  onToggleModule: (moduleId: string) => void;
  onSelectStep: (stepId: string) => void;
}

function StepIcon({ typeLabel }: { typeLabel: string }) {
  if (typeLabel === "Video")
    return <VideoIcon className="h-4 w-4 text-[#2563EB]" />;
  if (typeLabel === "E-LKPD")
    return <DocumentIcon className="h-4 w-4 text-[#16A34A]" />;
  if (typeLabel === "Tes" || typeLabel === "Test Diagnosis")
    return <ClockIcon className="h-4 w-4 text-[#94A3B8]" />;
  return <NotebookIcon className="h-4 w-4 text-[#2563EB]" />;
}

function StepStateIcon({ state }: { state: ModuleStepState }) {
  if (state === "completed")
    return <CheckCircleIcon className="h-4 w-4 text-[#16A34A]" />;
  return null;
}

export default function MaterialSidebarPanel({
  modules,
  openModuleId,
  selectedStepId,
  onToggleModule,
  onSelectStep,
}: MaterialSidebarPanelProps) {
  return (
    <aside className="sticky top-4 flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
        Daftar Modul
      </p>

      {modules.map((module) => {
        const isExpanded = openModuleId === module.id;
        const hasSteps = Boolean(module.steps?.length);

        return (
          <article
            key={module.id}
            className={cn(
              "rounded-xl border p-3",
              module.progressEntries
                ? "border-transparent bg-[#111827] text-white"
                : "border-[#E2E8F0] bg-[#F8FAFC]",
            )}
          >
            {/* Module header */}
            <div
              className={cn(
                "flex items-start justify-between gap-2",
                hasSteps && "cursor-pointer",
              )}
              onClick={() => hasSteps && onToggleModule(module.id)}
              role={hasSteps ? "button" : undefined}
              tabIndex={hasSteps ? 0 : undefined}
              onKeyDown={(e) => {
                if (hasSteps && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onToggleModule(module.id);
                }
              }}
            >
              <div>
                <h3
                  className={cn(
                    "text-sm font-semibold",
                    module.progressEntries
                      ? "text-white"
                      : "text-[#0F172A]",
                  )}
                >
                  {module.title}
                </h3>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    module.progressEntries
                      ? "text-[#CBD5E8]"
                      : "text-[#64748B]",
                  )}
                >
                  {module.readLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-base font-bold",
                    module.progressEntries ? "text-white" : "text-[#0F172A]",
                  )}
                >
                  {module.progressPercent}%
                </span>
                {hasSteps && (
                  <ChevronLeftIcon
                    className={cn(
                      "h-4 w-4 text-[#475569] transition-transform duration-200",
                      isExpanded ? "-rotate-90" : "rotate-90",
                    )}
                  />
                )}
              </div>
            </div>

            {/* Progress bars */}
            {module.progressEntries && (
              <div className="mt-3 space-y-2.5">
                {module.progressEntries.map((entry) => (
                  <div key={entry.label}>
                    <div
                      className={cn(
                        "flex items-center justify-between text-xs",
                        module.progressEntries
                          ? "text-[#CBD5E8]"
                          : "text-[#64748B]",
                      )}
                    >
                      <span>{entry.label}</span>
                      <span
                        className={
                          module.progressEntries ? "text-white" : undefined
                        }
                      >
                        {entry.value}%
                      </span>
                    </div>
                    <div
                      className={cn(
                        "mt-1 h-1.5 overflow-hidden rounded-full",
                        module.progressEntries
                          ? "bg-[#334155]"
                          : "bg-[#DDE6F6]",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full",
                          entry.accent ?? "bg-[#3F76EC]",
                        )}
                        style={{ width: `${entry.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Steps list */}
            {hasSteps && isExpanded && (
              <ul className="mt-3 space-y-1">
                {(module.steps ?? []).map((step) => {
                  const isSelected = selectedStepId === step.id;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => onSelectStep(step.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                          isSelected
                            ? "border-[#DCEEFB] bg-[#EAF1FF] shadow-sm"
                            : step.state === "completed"
                              ? "border-transparent bg-white hover:bg-[#F8FAFC]"
                              : "border-transparent bg-[#F8FAFC] hover:bg-white",
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                          <StepIcon typeLabel={step.typeLabel} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate text-xs",
                              isSelected
                                ? "font-semibold text-[#1D4ED8]"
                                : step.state === "completed"
                                  ? "text-[#0F172A]"
                                  : "text-[#64748B]",
                            )}
                          >
                            {step.typeLabel}: {step.title}
                          </p>
                        </div>
                        <StepStateIcon state={step.state} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        );
      })}
    </aside>
  );
}
