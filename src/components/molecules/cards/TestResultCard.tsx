"use client";

import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/libs/utils";

type TestStatus = "Lulus" | "Remedial";
type TestType = "diagnostic" | "other";

interface TestResultCardProps {
  title: string;
  className?: string;
  date: string;
  score: number;
  maxScore?: number;
  status: TestStatus;
  type?: TestType;
  remedialNote?: string;
  subject?: string;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({
  title,
  date,
  score,
  maxScore = 100,
  status,
  type = "other",
  remedialNote,
  subject,
  className,
}) => {
  const isDiagnostic = type === "diagnostic";
  const isLulus = status === "Lulus";

  return (
    <div
      className={cn(
        "bg-white border rounded-2xl p-4 flex flex-col gap-3",
        isDiagnostic ? "border-amber-200 bg-amber-50/30" : "border-grey-stroke",
        className,
      )}
    >
      {/* Top row: type badge + date */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-grey">{date}</span>
      </div>

      {/* Title */}
      <div>
        <p className="text-sm font-semibold text-neutral-02 line-clamp-2">
          {title}
        </p>
        {subject && <p className="text-xs text-grey mt-0.5">{subject}</p>}
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-0.5">
          <span
            className={cn(
              "text-2xl font-bold",
              isLulus ? "text-neutral-02" : "text-amber-500",
            )}
          >
            {score}
          </span>
          <span className="text-xs text-grey">/{maxScore}</span>
        </div>
        <Badge variant={isLulus ? "success" : "warning"}>
          {isLulus ? "Lulus" : "Remedial"}
        </Badge>
      </div>

      {/* Remedial note */}
      {!isLulus && remedialNote && (
        <p className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
          ⚠ {remedialNote}
        </p>
      )}
    </div>
  );
};
