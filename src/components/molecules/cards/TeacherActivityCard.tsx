import { cn } from "@/libs/utils";

interface TeacherActivityCardProps {
  name: string;
  initials: string;
  avatarColor?: string;
  subject: string;
  lastActivity: string;
  totalStudents: number;
  totalClasses: number;
  className?: string;
}

export const TeacherActivityCard: React.FC<TeacherActivityCardProps> = ({
  name,
  initials,
  avatarColor = "bg-indigo-600",
  subject,
  lastActivity,
  totalStudents,
  totalClasses,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3.5 border-b border-grey-stroke last:border-b-0",
        className,
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
          avatarColor,
        )}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-02 truncate">{name}</p>
        <p className="text-xs text-grey truncate">{subject}</p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-grey">
        <span>{totalStudents} siswa</span>
        <span>{totalClasses} kelas</span>
      </div>

      {/* Last activity */}
      <span className="text-[11px] text-grey whitespace-nowrap">{lastActivity}</span>
    </div>
  );
};
