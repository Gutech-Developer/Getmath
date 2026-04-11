"use client";

import HeartIcon from "@/components/atoms/icons/HeartIcon";
import type { IForumReply } from "@/types";
import { formatForumRelativeTime } from "@/utils/classForum";
import ForumAvatar from "./ForumAvatar";
import ForumBadge from "./ForumBadge";

interface IForumReplyCardProps {
  discussionId: string;
  reply: IForumReply;
  onLike: (discussionId: string, replyId: string) => void;
}

export default function ForumReplyCard({
  discussionId,
  reply,
  onLike,
}: IForumReplyCardProps) {
  return (
    <article className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-[0px_16px_32px_rgba(148,163,184,0.08)] sm:p-5">
      <div className="flex items-start gap-4">
        {/* <ForumAvatar name={reply.author.name} tone={reply.author.tone} /> */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {reply.author.name}
              </h3>
              <ForumBadge
                tone={reply.author.role === "teacher" ? "teacher" : "student"}
              >
                {reply.author.role === "teacher" ? "Guru" : "Siswa"}
              </ForumBadge>
              {reply.author.isCurrentUser ? (
                <ForumBadge tone="mine">Kamu</ForumBadge>
              ) : null}
            </div>

            <p className="text-sm font-medium text-[#94A3B8]">
              {formatForumRelativeTime(reply.createdAt)}
            </p>
          </div>

          <p className="mt-3 text-sm leading-7 text-[#334155]">
            {reply.content}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => onLike(discussionId, reply.id)}
              className="inline-flex items-center gap-1.5 text-[#94A3B8] transition hover:text-[#DC2626]"
            >
              <HeartIcon
                className={reply.isLiked ? "text-[#DC2626]" : "text-[#94A3B8]"}
              />
              {reply.likesCount}
            </button>

            <button
              type="button"
              className="font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
            >
              Balas
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
