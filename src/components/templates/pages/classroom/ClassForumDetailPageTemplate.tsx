"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import { buildClassRoute } from "@/constant/classSidebarRoutes";
import ForumDiscussionCard from "@/components/molecules/classroom/forum/ForumDiscussionCard";
import ForumEmptyState from "@/components/molecules/classroom/forum/ForumEmptyState";
import ForumReplyCard from "@/components/molecules/classroom/forum/ForumReplyCard";
import { useClassForum } from "@/services";
import type { IClassForumDetailPageTemplateProps } from "@/types";
import { getForumDiscussionById } from "@/utils/classForum";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";

function ForumDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-56 animate-pulse rounded-[28px] bg-[#E2E8F0]" />
      <div className="h-32 animate-pulse rounded-[28px] bg-[#E2E8F0]" />
      <div className="h-32 animate-pulse rounded-[28px] bg-[#E2E8F0]" />
    </div>
  );
}

export default function ClassForumDetailPageTemplate({
  slug,
  discussionId,
}: IClassForumDetailPageTemplateProps) {
  const classTitle = formatClassTitleFromSlug(slug);
  const {
    discussions,
    isHydrated,
    addReply,
    toggleDiscussionLike,
    toggleReplyLike,
  } = useClassForum(slug);
  const [replyContent, setReplyContent] = useState("");

  const discussion = useMemo(
    () => getForumDiscussionById(discussions, decodeURIComponent(discussionId)),
    [discussionId, discussions],
  );

  const backHref = buildClassRoute(slug, "forum");

  const handleSubmitReply = () => {
    if (!discussion || !replyContent.trim()) {
      return;
    }

    addReply({
      discussionId: discussion.id,
      content: replyContent.trim(),
    });
    setReplyContent("");
  };

  const handleReplyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmitReply();
    }
  };

  return (
    <ClassPageShellTemplate
      slug={slug}
      activeKey="forum"
      classTitle={classTitle}
    >
      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Kembali
          </Link>
          <p className="text-[#94A3B8]">
            Detail Diskusi . {discussion?.replies.length ?? 0} balasan
          </p>
        </div>

        {!discussion && !isHydrated ? <ForumDetailSkeleton /> : null}

        {discussion ? (
          <>
            <ForumDiscussionCard
              discussion={discussion}
              variant="detail"
              onLike={toggleDiscussionLike}
            />

            <section className="space-y-4">
              {discussion.replies.map((reply) => (
                <ForumReplyCard
                  key={reply.id}
                  discussionId={discussion.id}
                  reply={reply}
                  onLike={toggleReplyLike}
                />
              ))}
            </section>

            <section className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] sm:p-6">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                Balas Diskusi
              </label>

              <textarea
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                onKeyDown={handleReplyKeyDown}
                placeholder="Tulis balasanmu di sini. Tekan Enter untuk kirim, atau Shift + Enter untuk baris baru."
                rows={4}
                className="mt-4 min-h-[140px] w-full resize-none rounded-[24px] border border-[#E2E8F0] px-5 py-4 text-sm leading-7 text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#1F2375] focus:ring-1 focus:ring-[#1F2375]"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#94A3B8]">
                  Balasan akan langsung ditambahkan ke thread kelas ini.
                </p>

                <button
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1F2375] px-5 text-sm font-semibold text-white transition hover:bg-[#1F2375]/90 disabled:cursor-not-allowed disabled:bg-[#1F2375]/70"
                >
                  Kirim Balasan
                </button>
              </div>
            </section>
          </>
        ) : null}

        {!discussion && isHydrated ? (
          <ForumEmptyState
            title="Diskusi tidak ditemukan"
            description="Thread yang kamu buka belum tersedia di forum kelas ini atau sudah tidak aktif. Kembali ke daftar forum untuk memilih diskusi lain."
            action={
              <Link
                href={backHref}
                className="rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Kembali ke Forum
              </Link>
            }
          />
        ) : null}
      </section>
    </ClassPageShellTemplate>
  );
}
