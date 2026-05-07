"use client";

/**
 * Reusable Forum Section for Teacher/Admin dashboards.
 * Mirrors the Student ClassForumPageTemplate layout & styling
 * but intended to be embedded inside analytics/class-list views.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import {
  useListDiscussionsByCourse,
  useCreateDiscussion,
  useLikeDiscussion,
  useDeleteDiscussion,
  useGsCurrentUser,
  useGsModulesByCourse,
} from "@/services";
import { Modal } from "@/components/molecules/Modal";
import type { GsForumDiscussion, IForumDiscussion, IForumReply } from "@/types";
import ForumDiscussionCard from "../molecules/classroom/forum/ForumDiscussionCard";
import ForumFilterChip from "../molecules/classroom/forum/ForumFilterChip";
import ForumSelectField from "../molecules/classroom/forum/ForumSelectField";

// ─── Types ────────────────────────────────────────────────────────────────

interface IForumSectionProps {
  courseId: string;
  slug: string;
  role: "teacher" | "admin";
  materials?: Array<{ id: string; subject?: { testName?: string; [key: string]: any }; diagnosticTest?: { testName?: string; [key: string]: any }; [key: string]: any }>;
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
  materials = [],
}: IForumSectionProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "top">("latest");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("all");
  const [selectedCreateModuleId, setSelectedCreateModuleId] = useState<string>("umum");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: currentUser } = useGsCurrentUser();
  const isElevated = currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN";
  const router = useRouter();

  const { data: modulesData } = useGsModulesByCourse(courseId);

  // ── API hooks ──────────────────────────────────────────────────────────
  const {
    data: discussionsData,
    isLoading,
    error,
  } = useListDiscussionsByCourse(
    courseId,
    {
      page: 1,
      limit: 30,
      sortBy,
      courseModuleId: selectedMaterialId !== "all" ? selectedMaterialId : undefined,
    },
    { enabled: !!courseId }
  );

  const createDiscussion = useCreateDiscussion(courseId);
  const likeDiscussion = useLikeDiscussion(courseId);
  const deleteDiscussion = useDeleteDiscussion(courseId);

  // ── Map discussions ────────────────────────────────────────────────────
  const [localLikes, setLocalLikes] = useState<Record<string, { isLiked: boolean; count: number }>>({});

  const discussions = useMemo<IForumDiscussion[]>(() => {
    if (!discussionsData?.discussions) return [];
    return discussionsData.discussions.map((d: GsForumDiscussion) => {
      const matchedModule = (modulesData || []).find((m) => m.id === d.courseModuleId);
      const materialName = matchedModule 
        ? (matchedModule.subject?.subjectName ?? matchedModule.diagnosticTest?.testName) 
        : undefined;

      return {
        id: d.id,
        content: d.content,
        materialId: d.courseModuleId ?? "umum",
        materialName,
        status: "active" as const,
        isPinned: false,
        createdAt: new Date(d.createdAt).getTime(),
        likesCount: localLikes[d.id]?.count ?? d.totalLikes ?? d.likeCount ?? 0,
        isLiked: localLikes[d.id]?.isLiked ?? d.isLiked ?? false,
        author: {
          id: d.author?.id ?? "unknown",
          name: d.author?.teacher?.fullName ?? d.author?.student?.fullName ?? d.author?.fullName ?? "Pengguna",
          role: (d.author?.teacher ? "teacher" : "student") as any,
          tone: "slate" as const,
          isCurrentUser: d.authorUserId === currentUser?.id,
        },
        replies: [],
        commentCount: d.totalComments ?? d.commentCount ?? 0,
      };
    });
  }, [discussionsData, localLikes, currentUser, modulesData]);



  const materialOptions = useMemo(() => {
    const list = modulesData || [];
    return [
      { value: "all", label: "Semua Materi" },
      ...list.map((m) => ({
        value: m.id,
        label: m.subject?.subjectName ?? m.diagnosticTest?.testName ?? "Materi",
      })),
    ];
  }, [modulesData]);

  const createModuleOptions = useMemo(() => {
    const list = modulesData || [];
    return [
      { value: "umum", label: "Umum (Tanpa Materi)" },
      ...list.map((m) => ({
        value: m.id,
        label: m.subject?.subjectName ?? m.diagnosticTest?.testName ?? "Materi",
      })),
    ];
  }, [modulesData]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      await createDiscussion.mutateAsync({ 
        content: newPostContent,
        courseModuleId: selectedCreateModuleId !== "umum" ? selectedCreateModuleId : undefined
      });
      setNewPostContent("");
      setSelectedCreateModuleId("umum");
    } catch {
      // silent — toast/logger handles it
    } finally {
      setIsPosting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDiscussion.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // silent
    }
  };

  const handleLike = (discussionId: string) => {
    const item = discussions.find((d) => d.id === discussionId);
    if (!item) return;

    const currentLocal = localLikes[discussionId] || {
      isLiked: item.isLiked,
      count: item.likesCount,
    };

    const nextIsLiked = !currentLocal.isLiked;
    const nextCount = nextIsLiked ? currentLocal.count + 1 : currentLocal.count - 1;

    setLocalLikes((prev) => ({
      ...prev,
      [discussionId]: { isLiked: nextIsLiked, count: nextCount },
    }));

    const timerId = (window as any)[`like_timer_section_${discussionId}`];
    if (timerId) clearTimeout(timerId);
    (window as any)[`like_timer_section_${discussionId}`] = setTimeout(() => {
      likeDiscussion.mutate(discussionId);
      delete (window as any)[`like_timer_section_${discussionId}`];
    }, 500);
  };

  const handleDiscussionClick = (discussionId: string) => {
    const baseRoute = role === "teacher" 
      ? `/teacher/dashboard/class-list/${slug}/discussion`
      : `/admin/dashboard/learning-analytics/${slug}/discussion`;
    
    router.push(`${baseRoute}/${discussionId}`);
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

  // ── Main Render Logic ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-[#E2E8F0] rounded-2xl"></div>
        <div className="h-40 bg-[#E2E8F0] rounded-2xl"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-[#E2E8F0] rounded-2xl"></div>
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

  // ── List View ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
         <div className="flex flex-wrap items-center gap-2">
            <ForumFilterChip 
              label="Terbaru" 
              isActive={sortBy === "latest"} 
              onClick={() => setSortBy("latest")} 
            />
            <ForumFilterChip 
              label="Terpopuler" 
              isActive={sortBy === "top"} 
              onClick={() => setSortBy("top")} 
            />
         </div>
         
         <div className="w-full xl:w-64">
            <ForumSelectField
              value={selectedMaterialId}
              onChange={setSelectedMaterialId}
              options={materialOptions}
              className="bg-[#F8FAFC]"
            />
         </div>
      </div>

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
          
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-64">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Pilih Materi (Opsional)
              </p>
              <ForumSelectField
                value={selectedCreateModuleId}
                onChange={setSelectedCreateModuleId}
                options={createModuleOptions}
                className="h-10 bg-[#F8FAFC]"
              />
            </div>
            
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={isPosting || !newPostContent.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F2375] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F2375]/90 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-5"
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
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id} onClick={() => handleDiscussionClick(discussion.id)} className="cursor-pointer">
               <ForumDiscussionCard
                discussion={discussion}
                slug={slug}
                onLike={(id) => handleLike(id)}
                onDelete={
                  discussion.author.isCurrentUser || isElevated
                    ? (id) => setDeleteTargetId(id)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#475569]">
            Apakah Anda yakin ingin menghapus diskusi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteDiscussion.isPending}
              className="rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626] disabled:opacity-50"
            >
              {deleteDiscussion.isPending ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
