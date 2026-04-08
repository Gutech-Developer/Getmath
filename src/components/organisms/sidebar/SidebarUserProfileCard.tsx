import Image from "next/image";
import Link from "next/link";
import { cn } from "@/libs/utils";

interface ISidebarUserProfileCardProps {
  userName: string;
  roleLabel: string;
  avatarSrc?: string;
  href?: string;
  onNavigate?: () => void;
  className?: string;
}

function getInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function SidebarUserProfileCard({
  userName,
  roleLabel,
  avatarSrc,
  href,
  onNavigate,
  className,
}: ISidebarUserProfileCardProps) {
  const content = (
    <div
      className={cn(
        "flex w-full items-center gap-3 px-3 py-3",
        href && "cursor-pointer transition hover:bg-grey-lightest",
        className,
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2563EB] text-sm font-semibold text-white">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={`${userName} avatar`}
            width={44}
            height={44}
            className="h-11 w-11 object-cover"
          />
        ) : (
          <span>{getInitials(userName)}</span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-6 text-[#1E293B]">
          {userName}
        </p>
        <p className="truncate text-sm text-[#64748B]">{roleLabel}</p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} onClick={onNavigate} className="block w-full">
      {content}
    </Link>
  );
}
