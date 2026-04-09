import type { IModulMateriCardProps } from "@/types/classMaterial";
import { cn } from "@/libs/utils";

export default function ModulMateriCard({ module }: IModulMateriCardProps) {
  return (
    <article className="rounded-lg border border-transparent bg-[#111827] p-3 text-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{module.title}</h3>
          <p className="mt-0.5 text-xs text-[#CBD5E8]">{module.readLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">
            {module.progressPercent}%
          </span>
        </div>
      </div>

      {module.progressEntries ? (
        <div className="mt-3 space-y-3">
          {module.progressEntries.map((entry) => (
            <div key={entry.label}>
              <div className="flex items-center justify-between text-xs text-[#CBD5E8]">
                <span>{entry.label}</span>
                <span className="text-white">{entry.value}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#334155]">
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
    </article>
  );
}
