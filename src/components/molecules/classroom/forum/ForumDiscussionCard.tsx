"use client";

import Link from "next/link";
import ChatIcon from "@/components/atoms/icons/ChatIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import HeartIcon from "@/components/atoms/icons/HeartIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import type { IForumDiscussion } from "@/types";
import {
  buildClassForumDiscussionRoute,
  formatForumRelativeTime,
  getForumMaterialLabel,
} from "@/utils/classForum";
import ForumAvatar from "./ForumAvatar";
import ForumBadge, { ForumPinnedBadge } from "./ForumBadge";

type ForumDiscussionCardVariant = "list" | "detail";

interface IForumDiscussionCardProps {
  discussion: IForumDiscussion;
  slug?: string;
  variant?: ForumDiscussionCardVariant;
  onLike: (discussionId: string) => void;
  onDelete?: (discussionId: string) => void;
}

function getRoleLabel(role: IForumDiscussion["author"]["role"]): string {
  return role === "teacher" ? "Guru" : "Siswa";
}

function getCurrentUserLabel(variant: ForumDiscussionCardVariant): string {
  return variant === "detail" ? "Kamu" : "Diskusiku";
}

export default function ForumDiscussionCard({
  discussion,
  slug,
  variant = "list",
  onLike,
  onDelete,
}: IForumDiscussionCardProps) {
  const isDetail = variant === "detail";
  const detailHref = slug
    ? buildClassForumDiscussionRoute(slug, discussion.id)
    : undefined;

  return (
    <article className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] sm:p-6">
      <div className="flex items-start gap-4">
        {/* <ForumAvatar
          name={discussion.author.name}
          tone={discussion.author.tone}
          size={isDetail ? "lg" : "md"}
        /> */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {/* {discussion.isPinned ? <ForumPinnedBadge /> : null} */}
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {discussion.author.name}
                </h2>
                <ForumBadge
                  tone={
                    discussion.author.role === "teacher" ? "teacher" : "student"
                  }
                >
                  {getRoleLabel(discussion.author.role)}
                </ForumBadge>
                <ForumBadge tone="material">
                  {discussion.materialName ?? getForumMaterialLabel(discussion.materialId)}
                </ForumBadge>
                {discussion.status === "inactive" ? (
                  <ForumBadge tone="inactive">Nonaktif</ForumBadge>
                ) : null}
                {discussion.author.isCurrentUser ? (
                  <ForumBadge tone="mine">
                    {getCurrentUserLabel(variant)}
                  </ForumBadge>
                ) : null}
              </div>

              {isDetail ? (
                <p className="mt-2 text-sm font-medium text-[#94A3B8]">
                  {formatForumRelativeTime(discussion.createdAt)}
                </p>
              ) : null}
            </div>

            {!isDetail && detailHref ? (
              <Link
                href={detailHref}
                className="text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
              >
                Lihat detail
              </Link>
            ) : null}
          </div>

          <p className="mt-4 text-sm leading-8 text-[#334155] sm:text-sm">
            {discussion.content}
          </p>

          {isDetail ? (
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onLike(discussion.id)}
                className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-5 py-3 text-base font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
              >
                <HeartIcon
                  className={
                    discussion.isLiked ? "text-[#DC2626]" : "text-[#F87171]"
                  }
                />
                {discussion.likesCount} Suka
              </button>
              {onDelete ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(discussion.id);
                  }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#94A3B8] transition hover:border-[#EF4444] hover:text-[#EF4444]"
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                {/* <ClockIcon className="text-[#94A3B8]" /> */}
                {formatForumRelativeTime(discussion.createdAt)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(discussion.id);
                }}
                className="inline-flex items-center gap-1.5 text-[#EF4444] transition hover:text-[#DC2626]"
              >
                <HeartIcon
                  className={
                    discussion.isLiked ? "text-[#DC2626]" : "text-[#F87171]"
                  }
                />
                {discussion.likesCount}
              </button>
              <span className="inline-flex items-center gap-1.5">
                <ChatIcon className="text-[#94A3B8]" />
                {discussion.commentCount ?? discussion.replies.length} balasan
              </span>
              {onDelete ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(discussion.id);
                  }}
                  className="inline-flex items-center gap-1.5 text-[#94A3B8] transition hover:text-[#EF4444]"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
