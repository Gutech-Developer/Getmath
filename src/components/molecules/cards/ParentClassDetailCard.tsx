import { ReactNode } from "react";
import { SectionHeader } from "../SectionHeader";
import { cn } from "@/libs/utils";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import AlertIcon from "@/components/atoms/icons/AlertIcon";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";

export interface TestResult {
  id: string;
  title: string;
  date: string;
  score: number;
  maxScore?: number;
  status: "Lulus" | "Remedial";
  type?: "diagnostic" | "other";
  remedialNote?: string;
  subject?: string;
}
type ActivityType = "materi" | "video" | "diagnostic" | "forum";

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: ActivityType;
}
interface ClassModuleItem {
  id: string;
  type: "Materi" | "Video" | "E-LKPD" | "Tes Diagnostik";
  title: string;
  status: "completed" | "active" | "locked";
}

interface ParentClassDetailCardProps {
  selectedClassModules: ClassModuleItem[];
  classDiagnosticResults: TestResult[];
  classActivities: ActivityItem[];
}
const ParentClassDetailCard: React.FC<ParentClassDetailCardProps> = ({
  selectedClassModules,
  classDiagnosticResults,
  classActivities,
}) => {
  function getActivityIcon(type: ActivityType): ReactNode {
    if (type === "video") {
      return <VideoIcon className="h-3.5 w-3.5 text-[#6B7280]" />;
    }

    if (type === "diagnostic") {
      return <ClipboardIcon className="h-3.5 w-3.5 text-[#D97706]" />;
    }

    if (type === "forum") {
      return <AlertIcon className="h-3.5 w-3.5 text-[#4B5563]" />;
    }

    return <BookIcon className="h-3.5 w-3.5 text-[#4B5563]" />;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-grey-stroke bg-white p-5 md:p-6 shadow-sm">
      <div className="rounded-2xl border border-grey-stroke bg-white p-5 md:p-6 flex flex-col gap-3">
        <SectionHeader title="Progress Modul Belajar" />

        <div className="space-y-2">
          {selectedClassModules.map((module) => (
            <div
              key={module.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                module.status === "completed" &&
                  "border-emerald-100 bg-emerald-50/40",
                module.status === "active" && "border-blue-100 bg-blue-50/40",
                module.status === "locked" && "border-gray-200 bg-gray-50/80",
              )}
            >
              <div className="min-w-0 flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-grey-stroke">
                  {module.type === "Video" ? (
                    <VideoIcon className="h-3.5 w-3.5 text-[#7C3AED]" />
                  ) : module.type === "Tes Diagnostik" ||
                    module.type === "E-LKPD" ? (
                    <ClipboardIcon className="h-3.5 w-3.5 text-[#2563EB]" />
                  ) : (
                    <BookIcon className="h-3.5 w-3.5 text-[#2563EB]" />
                  )}
                </span>

                <p className="truncate text-sm text-neutral-02">
                  <span className="text-xs text-grey">{module.type}: </span>
                  {module.title}
                </p>
              </div>

              {module.status === "completed" ? (
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
              ) : module.status === "active" ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Aktif
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                  Terkunci
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-grey-stroke bg-white p-5 md:p-6 flex flex-col gap-3">
          <SectionHeader title="Hasil Tes Diagnostik" />

          {classDiagnosticResults.length > 0 ? (
            <div className="space-y-2">
              {classDiagnosticResults.map((result: TestResult) => {
                const isPassed = result.status === "Lulus";

                return (
                  <div
                    key={result.id}
                    className={cn(
                      "rounded-xl border px-3 py-3",
                      isPassed
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-red-200 bg-red-50/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-02">
                          {result.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-grey">
                          {result.date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={cn(
                            "text-xl font-bold leading-none",
                            isPassed ? "text-emerald-600" : "text-red-600",
                          )}
                        >
                          {result.score}
                        </p>
                        <p
                          className={cn(
                            "text-[11px] font-semibold",
                            isPassed ? "text-emerald-600" : "text-red-600",
                          )}
                        >
                          {result.status}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-grey-stroke bg-gray-50 px-3 py-4 text-sm text-grey">
              Belum ada hasil tes diagnostik untuk kelas ini.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-grey-stroke bg-white p-5 md:p-6 flex flex-col gap-3">
          <SectionHeader title="Aktivitas Terkini di Kelas Ini" />

          <div className="space-y-2">
            {classActivities.map((activity: ActivityItem) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-grey-stroke">
                  {getActivityIcon(activity.type)}
                </span>

                <div className="min-w-0">
                  <p className="text-sm text-neutral-02">{activity.title}</p>
                  <p className="text-[11px] text-grey">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentClassDetailCard;
