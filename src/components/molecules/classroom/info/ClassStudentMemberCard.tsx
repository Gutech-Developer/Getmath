import { cn } from "@/libs/utils";

interface IClassStudentMemberCardProps {
  name: string;
  toneClassName: string;
  isCurrentUser?: boolean;
}

function getStudentInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function ClassStudentMemberCard({
  name,
  toneClassName,
  isCurrentUser = false,
}: IClassStudentMemberCardProps) {
  return (
    <article className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0px_14px_30px_rgba(148,163,184,0.10)]">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
            toneClassName,
          )}
        >
          {getStudentInitial(name)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-[#334155]">
              {name}
            </h3>
            {isCurrentUser ? (
              <span className="rounded-full border border-[#FBCFE8] bg-[#FFF1F2] px-3 py-1 text-xs font-semibold text-[#E11D48]">
                Kamu
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[#94A3B8]">Siswa aktif kelas</p>
        </div>
      </div>
    </article>
  );
}
