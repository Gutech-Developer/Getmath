"use client";

/**
 * Reusable Forum Section for Teacher/Admin dashboards.
 * Mirrors the Student ClassForumPageTemplate layout & styling
 * but intended to be embedded inside analytics/class-list views.
 */

import { useMemo, useState } from "react";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import {
  useListDiscussionsByCourse,
  useCreateDiscussion,
  useLikeDiscussion,
} from "@/services";
import type { GsForumDiscussion } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────

interface IForumSectionProps {
  courseId: string;
  slug: string;
  role: "teacher" | "admin";
}

interface ILocalDiscussion {
  id: string;
  authorName: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  createdAt: string;
}

// ─── Component ───────────────────────────────────────────────────────────

export default function ForumSection({
  courseId,
  slug,
  role,
}: IForumSectionProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // ── API hooks ──────────────────────────────────────────────────────────
  const {
    data: discussionsData,
    isLoading,
    error,
  } = useListDiscussionsByCourse(courseId, { page: 1, limit: 30 }, { enabled: !!courseId });

  const createDiscussion = useCreateDiscussion(courseId);
  const likeDiscussion = useLikeDiscussion(courseId);

  // ── Map discussions ────────────────────────────────────────────────────
  const discussions = useMemo<ILocalDiscussion[]>(() => {
    if (!discussionsData?.discussions) return [];
    return discussionsData.discussions.map((d: GsForumDiscussion) => ({
      id: d.id,
      authorName: d.author?.fullName ?? "Pengguna",
      content: d.content,
      likeCount: d.likeCount,
      isLiked: d.isLiked ?? false,
      commentCount: d.commentCount,
      createdAt: d.createdAt,
    }));
  }, [discussionsData]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      await createDiscussion.mutateAsync({ content: newPostContent });
      setNewPostContent("");
    } catch {
      // silent — toast/logger handles it
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (discussionId: string) => {
    likeDiscussion.mutate(discussionId);
  };

  // ── Format timestamp ──────────────────────────────────────────────────
  function formatRelativeTime(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam lalu`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} hari lalu`;
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-4 py-3 flex justify-between">
            <div className="h-4 bg-[#E2E8F0] rounded w-32"></div>
            <div className="h-3 bg-[#E2E8F0] rounded w-20"></div>
          </div>
          <div className="p-4">
            <div className="h-20 bg-[#E2E8F0] rounded-xl w-full"></div>
            <div className="mt-3 flex justify-end">
              <div className="h-9 bg-[#E2E8F0] rounded-xl w-32"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#E2E8F0]"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-[#E2E8F0] rounded w-24"></div>
                  <div className="h-2 bg-[#E2E8F0] rounded w-16"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-[#E2E8F0] rounded w-full"></div>
                <div className="h-3 bg-[#E2E8F0] rounded w-5/6"></div>
              </div>
              <div className="mt-4 flex gap-4 border-t border-[#F1F5F9] pt-3">
                <div className="h-4 bg-[#E2E8F0] rounded w-12"></div>
                <div className="h-4 bg-[#E2E8F0] rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
        Gagal memuat forum: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Create post ──────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#1F2937]">
            Forum Diskusi Kelas
          </h3>
          <p className="text-xs text-[#94A3B8]">
            {discussions.length} diskusi •{" "}
            {role === "teacher" ? "Guru" : "Admin"}
          </p>
        </div>

        <div className="p-4">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Tulis diskusi baru..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#94A3B8] outline-none focus:border-[#1F2375] focus:ring-1 focus:ring-[#1F2375]/20 transition"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={isPosting || !newPostContent.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F2375] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F2375]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              {isPosting ? "Mengirim..." : "Buat Diskusi"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Discussion list ──────────────────────────────────────────── */}
      {discussions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
          <p className="text-sm text-[#64748B]">
            Belum ada diskusi di kelas ini. Mulai diskusi pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F2375]/10 text-sm font-bold text-[#1F2375]">
                    {discussion.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1F2937]">
                      {discussion.authorName}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {formatRelativeTime(discussion.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#374151]">
                {discussion.content}
              </p>

              <div className="mt-3 flex items-center gap-4 border-t border-[#F1F5F9] pt-3">
                <button
                  type="button"
                  onClick={() => handleLike(discussion.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium transition ${
                    discussion.isLiked
                      ? "text-[#1F2375]"
                      : "text-[#94A3B8] hover:text-[#1F2375]"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill={discussion.isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {discussion.likeCount}
                </button>

                <span className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {discussion.commentCount} komentar
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
