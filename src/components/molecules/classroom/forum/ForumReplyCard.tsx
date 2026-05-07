"use client";

import { useState, useMemo } from "react";
import HeartIcon from "@/components/atoms/icons/HeartIcon";
import TrashIcon from "@/components/atoms/icons/TrashIcon";
import type { IForumReply } from "@/types";
import { formatForumRelativeTime } from "@/utils/classForum";
import { useListRepliesByComment, useLikeComment, useDeleteComment, useCreateComment } from "@/services";
import ForumAvatar from "./ForumAvatar";
import ForumBadge from "./ForumBadge";

interface IForumReplyCardProps {
  discussionId: string;
  reply: IForumReply;
  onLike: (discussionId: string, replyId: string) => void;
  onDelete?: (replyId: string) => void;
}

export default function ForumReplyCard({
  discussionId,
  reply,
  onLike,
  onDelete,
}: IForumReplyCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [localLikes, setLocalLikes] = useState<Record<string, { isLiked: boolean; count: number }>>({});

  const { data: repliesData, isLoading: isRepliesLoading } = useListRepliesByComment(
    discussionId,
    reply.id,
    { page: 1, limit: 20, sortBy: "oldest" },
    { enabled: showReplies }
  );

  const likeCommentMutation = useLikeComment(discussionId);
  const deleteCommentMutation = useDeleteComment(discussionId);
  const createCommentMutation = useCreateComment(discussionId);

  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState("");

  const handleSubmitReply = async () => {
    if (!replyInput.trim()) return;
    try {
      await createCommentMutation.mutateAsync({
        content: replyInput.trim(),
        parentCommentId: reply.id,
      });
      setReplyInput("");
      setIsReplying(false);
      setShowReplies(true);
    } catch {
      // silent
    }
  };

  const nestedReplies = useMemo(() => {
    return (repliesData?.comments ?? []).map((c) => {
      const authorName = c.author?.teacher?.fullName ?? c.author?.student?.fullName ?? c.author?.fullName ?? "Pengguna";
      const authorRole = c.author?.teacher ? "teacher" : "student";
      
      return {
        id: c.id,
        content: c.content,
        author: {
          id: c.author?.id ?? "unknown",
          name: authorName,
          role: authorRole as any,
          tone: "slate" as const,
          isCurrentUser: false,
        },
        createdAt: new Date(c.createdAt).getTime(),
        likesCount: localLikes[c.id]?.count ?? c.totalLikes ?? 0,
        isLiked: localLikes[c.id]?.isLiked ?? c.isLiked ?? false,
        replyCount: c.totalReplies ?? 0,
      };
    });
  }, [repliesData, localLikes]);

  const handleToggleNestedLike = (targetReplyId: string) => {
    const targetReply = nestedReplies.find((r) => r.id === targetReplyId);
    if (!targetReply) return;

    const currentLocal = localLikes[targetReplyId] || {
      isLiked: targetReply.isLiked,
      count: targetReply.likesCount,
    };

    const nextIsLiked = !currentLocal.isLiked;
    const nextCount = nextIsLiked ? currentLocal.count + 1 : currentLocal.count - 1;

    setLocalLikes((prev) => ({
      ...prev,
      [targetReplyId]: { isLiked: nextIsLiked, count: nextCount },
    }));

    const timerId = (window as any)[`like_timer_nested_${targetReplyId}`];
    if (timerId) clearTimeout(timerId);
    (window as any)[`like_timer_nested_${targetReplyId}`] = setTimeout(() => {
      likeCommentMutation.mutate(targetReplyId);
    }, 500);
  };
  return (
    <div className="space-y-4">
      <article className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-[0px_16px_32px_rgba(148,163,184,0.08)] sm:p-5">
        <div className="flex items-start gap-4">
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
                onClick={() => setIsReplying(!isReplying)}
                className="font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
              >
                Balas
              </button>

              {(reply.replyCount ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
                >
                  {showReplies ? "Sembunyikan Balasan" : `Lihat ${reply.replyCount} Balasan`}
                </button>
              )}

              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(reply.id)}
                  className="inline-flex items-center gap-1.5 text-[#94A3B8] transition hover:text-[#EF4444]"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {isReplying && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={`Balas ${reply.author.name}...`}
                  className="w-full min-h-[100px] rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#334155] outline-none focus:border-[#1F2375] focus:ring-1 focus:ring-[#1F2375]/20 transition"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsReplying(false);
                      setReplyInput("");
                    }}
                    className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:text-[#0F172A]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyInput.trim() || createCommentMutation.isPending}
                    className="rounded-xl bg-[#1F2375] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1F2375]/90 disabled:opacity-50"
                  >
                    {createCommentMutation.isPending ? "Mengirim..." : "Balas"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {showReplies && (
        <div className="ml-8 space-y-4 border-l-2 border-[#E2E8F0] pl-6">
          {isRepliesLoading && (
            <div className="py-2 text-sm text-[#94A3B8] animate-pulse">Memuat balasan...</div>
          )}
          {nestedReplies.map((nested) => (
            <ForumReplyCard
              key={nested.id}
              discussionId={discussionId}
              reply={nested}
              onLike={(_, id) => handleToggleNestedLike(id)}
              onDelete={(id) => deleteCommentMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
