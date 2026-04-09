import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import type {
  IPersamaanKuadratCardProps,
  ModuleStepState,
} from "@/types/classMaterial";
import { cn } from "@/libs/utils";

function getStepTitleClass(state: ModuleStepState): string {
  if (state === "active") {
    return "font-semibold text-[#1D4ED8]";
  }

  if (state === "completed") {
    return "text-[#0F172A]";
  }

  return "text-[#64748B]";
}

export default function PersamaanKuadratCard({
  module,
  openModuleId,
  selectedStepId,
  toggleModule,
  setSelectedStepId,
}: IPersamaanKuadratCardProps) {
  return (
    <article className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
      <div
        className={cn(
          "flex items-start justify-between gap-2",
          module.id === "module-2" && "cursor-pointer",
        )}
        onClick={() => module.id === "module-2" && toggleModule(module.id)}
        onKeyDown={(event) => {
          if (
            module.id === "module-2" &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            toggleModule(module.id);
          }
        }}
        role={module.id === "module-2" ? "button" : undefined}
        tabIndex={module.id === "module-2" ? 0 : undefined}
      >
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">
            {module.title}
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B]">{module.readLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#0F172A]">
            {module.progressPercent}%
          </span>
          {module.id === "module-2" ? (
            <ChevronLeftIcon
              className={cn(
                "h-4 w-4 text-[#475569] transition-transform duration-200",
                openModuleId === module.id ? "-rotate-90" : "rotate-90",
              )}
            />
          ) : null}
        </div>
      </div>

      {module.progressEntries ? (
        <div className="mt-3 space-y-3">
          {module.progressEntries.map((entry) => (
            <div key={entry.label}>
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span>{entry.label}</span>
                <span>{entry.value}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#DDE6F6]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    entry.accent ?? "bg-[#1F2E46]",
                  )}
                  style={{ width: `${entry.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {module.id === "module-2" && openModuleId === module.id ? (
        <ul className="mt-3 space-y-1">
          {(module.steps ?? []).map((step) => {
            const isSelected = selectedStepId === step.id;

            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setSelectedStepId(step.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                    isSelected
                      ? "bg-[#EAF1FF] border-[#DCEEFB] shadow-sm"
                      : "border-transparent hover:bg-[#F8FAFC]",
                    !isSelected && step.state === "completed" ? "bg-white" : "",
                    !isSelected && step.state === "upcoming"
                      ? "bg-[#F8FAFC]"
                      : "",
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl">
                    {step.typeLabel === "Video" ? (
                      <VideoIcon className="h-4 w-4 text-[#2563EB]" />
                    ) : step.typeLabel === "E-LKPD" ? (
                      <DocumentIcon className="h-4 w-4 text-[#16A34A]" />
                    ) : step.typeLabel === "Tes" ||
                      step.typeLabel === "Test Diagnosis" ? (
                      <CheckCircleIcon className="h-4 w-4 text-[#2563EB]" />
                    ) : (
                      <NotebookIcon className="h-4 w-4 text-[#334155]" />
                    )}
                  </span>
                  <div className="min-w-0 pr-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#94A3B8]">
                      {step.typeLabel}
                    </p>
                    <p
                      className={cn(
                        "text-sm leading-5",
                        getStepTitleClass(step.state),
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "ml-auto shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full border transition",
                      isSelected
                        ? "border-[#2461E7] bg-[#2461E7]"
                        : step.state === "completed"
                          ? "border-[#16A34A] bg-[#16A34A]"
                          : "border-[#CBD5E1] bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "block h-2.5 w-2.5 rounded-full transition",
                        isSelected || step.state === "completed"
                          ? "bg-white"
                          : "bg-[#CBD5E1]",
                      )}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}
