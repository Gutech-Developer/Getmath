"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/components/atoms/icons/ChevronLeftIcon";
import { buildClassRoute } from "@/constant/classSidebarRoutes";
import ForumDiscussionCard from "@/components/molecules/classroom/forum/ForumDiscussionCard";
import ForumEmptyState from "@/components/molecules/classroom/forum/ForumEmptyState";
import ForumReplyCard from "@/components/molecules/classroom/forum/ForumReplyCard";
import {
  useGsCourseBySlug,
  useGetDiscussion,
  useCreateComment,
  useLikeDiscussion,
  useLikeComment,
  useDeleteComment,
  useDeleteDiscussion,
  useGsCurrentUser,
  useListCommentsByDiscussion,
} from "@/services";
import { showToast } from "@/libs/toast";
import { Modal } from "@/components/molecules/Modal";
import type { IClassForumDetailPageTemplateProps, IForumDiscussion } from "@/types";
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
  backHref: customBackHref,
}: IClassForumDetailPageTemplateProps & { backHref?: string }) {
  const classTitle = formatClassTitleFromSlug(slug);
  const [localLikes, setLocalLikes] = useState<Record<string, { isLiked: boolean; count: number }>>({});
  const router = useRouter();

  const { data: course } = useGsCourseBySlug(slug);
  const courseId = course?.id ?? "";
  const { data: currentUser } = useGsCurrentUser();
  const isElevated = currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN";

  const [commentPage, setCommentPage] = useState(1);
  const [allComments, setAllComments] = useState<any[]>([]);

  const { data: apiDiscussion, isLoading: isDiscussionLoading } = useGetDiscussion(
    discussionId,
    { enabled: !!discussionId }
  );
  
  const { data: commentsData, isLoading: isCommentsLoading } = useListCommentsByDiscussion(
    discussionId,
    { page: commentPage, limit: 50, sortBy: "top" },
    { enabled: !!discussionId }
  );

  const createCommentMutation = useCreateComment(discussionId);
  const likeDiscussionMutation = useLikeDiscussion(courseId);
  // Like comment mutation needs commentId, we'll use it inside the handler
  const likeCommentMutation = useLikeComment(discussionId);

  const [replyContent, setReplyContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "discussion" | "comment" } | null>(null);

  const deleteCommentMutation = useDeleteComment(discussionId);
  const deleteDiscussionMutation = useDeleteDiscussion(courseId);


  const discussion = useMemo<IForumDiscussion | null>(() => {
    if (!apiDiscussion) return null;

    const matchedModule = (course?.modules || []).find((m) => m.id === apiDiscussion.courseModuleId);
    const materialName = matchedModule 
      ? (matchedModule.subject?.subjectName ?? matchedModule.diagnosticTest?.testName) 
      : undefined;

    const replies = (commentsData?.comments ?? []).map((c) => {
      const authorName = c.author?.teacher?.fullName ?? c.author?.student?.fullName ?? c.author?.fullName ?? "Pengguna";
      const authorRole = c.author?.teacher ? "teacher" : "student";
      const isCurrentUser = c.authorUserId === currentUser?.id;
      
      return {
        id: c.id,
        content: c.content,
        author: {
          id: c.author?.id ?? "unknown",
          name: authorName,
          role: authorRole as any,
          tone: "slate" as const,
          isCurrentUser: isCurrentUser,
        },
        createdAt: new Date(c.createdAt).getTime(),
        likesCount: localLikes[c.id]?.count ?? c.totalLikes ?? 0,
        isLiked: localLikes[c.id]?.isLiked ?? c.isLiked ?? false,
        replyCount: c.totalReplies ?? 0,
      };
    });

    return {
      id: apiDiscussion.id,
      content: apiDiscussion.content,
      materialId: apiDiscussion.courseModuleId ?? "umum",
      materialName,
      status: "active" as const,
      isPinned: false,
      createdAt: new Date(apiDiscussion.createdAt).getTime(),
      likesCount: localLikes[apiDiscussion.id]?.count ?? apiDiscussion.totalLikes ?? 0,
      isLiked: localLikes[apiDiscussion.id]?.isLiked ?? apiDiscussion.isLiked ?? false,
      author: {
        id: apiDiscussion.author?.id ?? "unknown",
        name: apiDiscussion.author?.teacher?.fullName ?? apiDiscussion.author?.student?.fullName ?? apiDiscussion.author?.fullName ?? "Pengguna",
        role: (apiDiscussion.author?.teacher ? "teacher" : "student") as any,
        tone: "slate" as const,
        isCurrentUser: apiDiscussion.authorUserId === currentUser?.id,
      },
      replies: replies,
    };
  }, [apiDiscussion, commentsData, localLikes, currentUser, course?.modules]);

  const backHref = customBackHref ?? buildClassRoute(slug, "forum");

  const handleSubmitReply = async () => {
    if (!discussion || !replyContent.trim()) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        content: replyContent.trim(),
      });
      setReplyContent("");
    } catch (error) {
      // Handled by logger/mutation
    }
  };

  const handleReplyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmitReply();
    }
  };


  const handleToggleDiscussionLike = () => {
    if (!discussion) return;
    
    const currentLocal = localLikes[discussion.id] || {
      isLiked: discussion.isLiked,
      count: discussion.likesCount,
    };

    const nextIsLiked = !currentLocal.isLiked;
    const nextCount = nextIsLiked ? currentLocal.count + 1 : currentLocal.count - 1;

    setLocalLikes((prev) => ({
      ...prev,
      [discussion.id]: { isLiked: nextIsLiked, count: nextCount },
    }));

    const timerId = (window as any)[`like_timer_${discussion.id}`];
    if (timerId) clearTimeout(timerId);
    (window as any)[`like_timer_${discussion.id}`] = setTimeout(() => {
      likeDiscussionMutation.mutate(discussion.id);
      delete (window as any)[`like_timer_${discussion.id}`];
    }, 500);
  };

  const handleToggleReplyLike = (discussionId: string, replyId: string) => {
    if (!discussion) return;
    const reply = discussion.replies.find((r) => r.id === replyId);
    if (!reply) return;

    const currentLocal = localLikes[replyId] || {
      isLiked: reply.isLiked,
      count: reply.likesCount,
    };

    const nextIsLiked = !currentLocal.isLiked;
    const nextCount = nextIsLiked ? currentLocal.count + 1 : currentLocal.count - 1;

    setLocalLikes((prev) => ({
      ...prev,
      [replyId]: { isLiked: nextIsLiked, count: nextCount },
    }));

    const timerId = (window as any)[`like_timer_${replyId}`];
    if (timerId) clearTimeout(timerId);
    (window as any)[`like_timer_${replyId}`] = setTimeout(() => {
      likeCommentMutation.mutate(replyId);
    }, 500);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "discussion") {
        await deleteDiscussionMutation.mutateAsync(deleteTarget.id);
        router.back();
      } else {
        await deleteCommentMutation.mutateAsync(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch (error) {
      // Handled by mutation
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

        {!discussion && isDiscussionLoading ? <ForumDetailSkeleton /> : null}

        {discussion ? (
          <>
            <ForumDiscussionCard
              discussion={discussion}
              variant="detail"
              onLike={handleToggleDiscussionLike}
              onDelete={
                discussion.author.isCurrentUser || isElevated
                  ? (id) => setDeleteTarget({ id, type: "discussion" })
                  : undefined
              }
            />

            <section className="space-y-4">
              {discussion.replies.map((reply) => (
                <ForumReplyCard
                  key={reply.id}
                  discussionId={discussion.id}
                  reply={reply}
                  onLike={(discId, replyId) => handleToggleReplyLike(discId, replyId)}
                  onDelete={
                    reply.author.isCurrentUser || isElevated
                      ? (id) => setDeleteTarget({ id, type: "comment" })
                      : undefined
                  }
                />
              ))}

              {commentsData?.pagination.hasNextPage && (
                <button
                  onClick={() => setCommentPage(prev => prev + 1)}
                  className="w-full rounded-2xl border border-[#E2E8F0] py-3 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition"
                >
                  {isCommentsLoading ? "Memuat..." : "Muat Lebih Banyak Komentar"}
                </button>
              )}
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

        {!discussion && !isDiscussionLoading ? (
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
        {/* ── Delete Confirmation Modal ────────────────────────────── */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Konfirmasi Hapus"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#475569]">
              Apakah Anda yakin ingin menghapus {deleteTarget?.type === "discussion" ? "diskusi" : "komentar"} ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteDiscussionMutation.isPending || deleteCommentMutation.isPending}
                className="rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626] disabled:opacity-50"
              >
                {deleteDiscussionMutation.isPending || deleteCommentMutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </Modal>
      </section>
    </ClassPageShellTemplate>
  );
}
