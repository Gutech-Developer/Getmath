import type { ReactNode } from "react";

interface IForumEmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function ForumEmptyState({
  title,
  description,
  action,
}: IForumEmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center shadow-[0px_16px_32px_rgba(148,163,184,0.12)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-2xl font-bold text-[#2563EB]">
        ?
      </div>
      <h2 className="mt-4 text-xl font-bold text-[#0F172A]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748B]">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
