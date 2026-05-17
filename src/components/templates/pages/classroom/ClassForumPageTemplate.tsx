"use client";

import { useMemo, useState } from "react";
import PlusIcon from "@/components/atoms/icons/PlusIcon";
import FilterIcon from "@/components/atoms/icons/FilterIcon";
import {
  CLASS_FORUM_MATERIALS,
  FORUM_ACTIVITY_FILTER_OPTIONS,
  FORUM_OWNERSHIP_FILTER_OPTIONS,
  FORUM_SORT_OPTIONS,
} from "@/constant/classForum";
import {
  useGsCourseBySlug,
  useListDiscussionsByCourse,
  useCreateDiscussion,
  useLikeDiscussion,
  useDeleteDiscussion,
  useGsCurrentUser,
  useGsModulesByCourse,
} from "@/services";
import { showToast } from "@/libs/toast";
import { Modal } from "@/components/molecules/Modal";
import type {
  IClassForumPageTemplateProps,
  IForumFilterState,
  IForumMaterial,
  IForumOption,
} from "@/types";
import {
  countActiveForumDiscussions,
  filterForumDiscussions,
} from "@/utils/classForum";
import CreateDiscussionModal from "@/components/molecules/classroom/forum/CreateDiscussionModal";
import ForumDiscussionCard from "@/components/molecules/classroom/forum/ForumDiscussionCard";
import ForumEmptyState from "@/components/molecules/classroom/forum/ForumEmptyState";
import ForumFilterChip from "@/components/molecules/classroom/forum/ForumFilterChip";
import ForumSearchField from "@/components/molecules/classroom/forum/ForumSearchField";
import ForumSelectField from "@/components/molecules/classroom/forum/ForumSelectField";
import ClassPageShellTemplate, {
  formatClassTitleFromSlug,
} from "./ClassPageShellTemplate";

const DEFAULT_FORUM_FILTERS: IForumFilterState = {
  searchQuery: "",
  ownership: "all",
  activity: "all",
  teacherOnly: false,
  materialId: "all",
  sortBy: "latest",
};


export default function ClassForumPageTemplate({
  slug,
}: IClassForumPageTemplateProps) {
  const classTitle = formatClassTitleFromSlug(slug);
  const [localLikes, setLocalLikes] = useState<Record<string, { isLiked: boolean; count: number }>>({});

  // ── Resolve courseId from slug ──────────────────────────────────────────
  const { data: course } = useGsCourseBySlug(slug);
  const courseId = course?.id ?? "";

  const [filters, setFilters] = useState<IForumFilterState>(
    DEFAULT_FORUM_FILTERS,
  );

  // ── API hooks ──────────────────────────────────────────────────────────
  const {
    data: apiDiscussionsData,
    isLoading: isApiLoading,
    isError: isApiError,
    error: apiErrorObj,
  } = useListDiscussionsByCourse(
    courseId,
    {
      page: 1,
      limit: 50,
      sortBy: filters.sortBy,
      courseModuleId: filters.materialId !== "all" ? filters.materialId : undefined,
      search: filters.searchQuery || undefined,
    },
    { enabled: !!courseId }
  );

  const createDiscussionMutation = useCreateDiscussion(courseId);
  const likeDiscussionMutation = useLikeDiscussion(courseId);
  const deleteDiscussionMutation = useDeleteDiscussion(courseId);

  const { data: currentUser } = useGsCurrentUser();
  const isElevated = currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN";

  const { data: modulesData } = useGsModulesByCourse(courseId);

  const dynamicMaterials = useMemo<IForumMaterial[]>(() => {
    const mats: IForumMaterial[] = [
      { id: "umum", label: "Umum", isGeneral: true },
    ];

    if (modulesData) {
      modulesData
        .filter((mod) => mod.type === "SUBJECT")
        .forEach((mod, index) => {
          const flat = mod as any;
          mats.push({
            id: mod.id || flat.courseModuleId,
            label: flat.subjectName ?? mod.subject?.subjectName ?? `Materi ${mod.order ?? index + 1}`,
          });
        });
    }

    return mats;
  }, [modulesData]);

  const forumMaterialFilterOptions = useMemo<IForumOption<string>[]>(() => {
    return [
      { value: "all", label: "Semua Materi" },
      ...dynamicMaterials.map((m) => ({
        value: m.id,
        label: m.label,
      })),
    ];
  }, [dynamicMaterials]);

  // ── Transform API data to UI format ─────────────────────────────────────
  const discussions = useMemo(() => {
    if (!apiDiscussionsData?.discussions?.length) return [];
    return apiDiscussionsData.discussions.map((d) => {
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
        isLiked: localLikes[d.id]?.isLiked ?? d.isLiked ?? false,
        likesCount: localLikes[d.id]?.count ?? d.totalLikes ?? d.likeCount ?? 0,
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
  }, [apiDiscussionsData, localLikes, currentUser, modulesData]);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredDiscussions = useMemo(
    () => filterForumDiscussions(discussions, filters),
    [discussions, filters],
  );

  const totalDiscussions = discussions.length;
  const activeDiscussions = countActiveForumDiscussions(discussions);
  const isFilterDirty =
    filters.searchQuery !== DEFAULT_FORUM_FILTERS.searchQuery ||
    filters.ownership !== DEFAULT_FORUM_FILTERS.ownership ||
    filters.activity !== DEFAULT_FORUM_FILTERS.activity ||
    filters.teacherOnly !== DEFAULT_FORUM_FILTERS.teacherOnly ||
    filters.materialId !== DEFAULT_FORUM_FILTERS.materialId ||
    filters.sortBy !== DEFAULT_FORUM_FILTERS.sortBy;

  const handleCreateDiscussion = async (content: {
    content: string;
    materialId: string;
  }) => {
    setCreateError(null);
    if (!courseId) {
      setCreateError("Kelas tidak ditemukan. Silakan refresh halaman.");
      return;
    }
    try {
      await createDiscussionMutation.mutateAsync({
        content: content.content,
        courseModuleId: content.materialId !== "umum" ? content.materialId : undefined,
      });
      setIsCreateModalOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || "Gagal membuat diskusi. Silakan coba lagi.";
      setCreateError(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDiscussionMutation.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch (error) {
      // Handled by mutation
    }
  };


  const handleToggleLike = (discussionId: string) => {
    const d = discussions.find((item) => item.id === discussionId);
    if (!d) return;

    const currentLocal = localLikes[discussionId] || {
      isLiked: d.isLiked,
      count: d.likesCount,
    };

    const nextIsLiked = !currentLocal.isLiked;
    const nextCount = nextIsLiked ? currentLocal.count + 1 : currentLocal.count - 1;

    // Update UI immediately
    setLocalLikes((prev) => ({
      ...prev,
      [discussionId]: { isLiked: nextIsLiked, count: nextCount },
    }));

    // Debounce the API call
    // Note: In a real app, you'd use lodash.debounce or similar. 
    // Here we use a simple timeout approach.
    const timerId = (window as any)[`like_timer_${discussionId}`];
    if (timerId) clearTimeout(timerId);

    (window as any)[`like_timer_${discussionId}`] = setTimeout(() => {
      likeDiscussionMutation.mutate(discussionId);
      delete (window as any)[`like_timer_${discussionId}`];
    }, 500);
  };

  return (
    <ClassPageShellTemplate
      slug={slug}
      activeKey="forum"
      classTitle={classTitle}
    >
      <section className="space-y-5">
        <header className="rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_16px_32px_rgba(148,163,184,0.12)] sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-[#1F2375]/40 bg-[#1F2375]/10 text-[#1F2375] px-3 py-1 text-xs font-semibold ">
                Forum Kelas
              </p>
              <h1 className="mt-3 text-xl font-bold text-[#0F172A]">
                Forum Diskusi
              </h1>
              {isApiLoading ? (
                <p className="mt-2 text-sm text-[#94A3B8]">Memuat diskusi...</p>
              ) : isApiError ? (
                <p className="mt-2 text-sm text-[#DC2626]">
                  Gagal memuat diskusi. {apiErrorObj?.message}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[#64748B]">
                  {activeDiscussions} diskusi aktif . {totalDiscussions} total
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isApiLoading}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1F2375] px-6 text-base font-semibold text-white duration-300 hover:shadow-[0px_18px_30px_rgba(31, 35, 117,0.5)] transition hover:bg-[#1F2375]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5" />
              Buat Diskusi
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 xl:flex-row">
            <ForumSearchField
              value={filters.searchQuery}
              onChange={(searchQuery) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  searchQuery,
                }))
              }
              className="flex-1"
            />

            <div className="flex flex-col gap-3 sm:flex-row xl:w-auto">
              <button
                type="button"
                onClick={() =>
                  setShowAdvancedFilters((currentValue) => !currentValue)
                }
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#1F2375]/40 bg-[#1F2375]/10 text-[#1F2375] px-5 text-sm font-semibold transition hover:bg-[#1F2375]/20"
              >
                <FilterIcon />
                Filter & Urutkan
              </button>

              {isFilterDirty ? (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FORUM_FILTERS)}
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]"
                >
                  Reset Filter
                </button>
              ) : null}
            </div>
          </div>

          {showAdvancedFilters ? (
            <div className="mt-4 rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.6fr)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Filter Diskusi
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {FORUM_OWNERSHIP_FILTER_OPTIONS.map((option) => (
                      <ForumFilterChip
                        key={option.value}
                        label={option.label}
                        isActive={filters.ownership === option.value}
                        onClick={() =>
                          setFilters((currentFilters) => ({
                            ...currentFilters,
                            ownership: option.value,
                          }))
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {FORUM_ACTIVITY_FILTER_OPTIONS.map((option) => (
                      <ForumFilterChip
                        key={option.value}
                        label={option.label}
                        isActive={filters.activity === option.value}
                        onClick={() =>
                          setFilters((currentFilters) => ({
                            ...currentFilters,
                            activity: option.value,
                          }))
                        }
                      />
                    ))}

                    <ForumFilterChip
                      label="Dari Guru"
                      isActive={filters.teacherOnly}
                      onClick={() =>
                        setFilters((currentFilters) => ({
                          ...currentFilters,
                          teacherOnly: !currentFilters.teacherOnly,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Materi Terkait
                  </p>

                  <ForumSelectField
                    value={filters.materialId}
                    onChange={(materialId) =>
                      setFilters((currentFilters) => ({
                        ...currentFilters,
                        materialId,
                      }))
                    }
                    options={forumMaterialFilterOptions}
                    className="mt-4 bg-white"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Urutkan
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {FORUM_SORT_OPTIONS.map((option) => (
                      <ForumFilterChip
                        key={option.value}
                        label={option.label}
                        isActive={filters.sortBy === option.value}
                        onClick={() =>
                          setFilters((currentFilters) => ({
                            ...currentFilters,
                            sortBy: option.value,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </header>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#64748B]">
              Menampilkan{" "}
              <span className="font-semibold text-[#0F172A]">
                {filteredDiscussions.length}
              </span>{" "}
              diskusi
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion) => (
                <ForumDiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  slug={slug}
                  onLike={handleToggleLike}
                  onDelete={
                    discussion.author.isCurrentUser || isElevated
                      ? (id) => setDeleteTargetId(id)
                      : undefined
                  }
                />
              ))
            ) : (
              <ForumEmptyState
                title="Tidak ada diskusi yang cocok"
                description="Coba ubah kata kunci pencarian atau longgarkan filter agar diskusi kelas yang relevan bisa tampil lagi."
                action={
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FORUM_FILTERS)}
                    className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    Tampilkan Semua Diskusi
                  </button>
                }
              />
            )}
          </div>
        </section>
      </section>

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        materials={dynamicMaterials}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateDiscussion}
        isLoading={createDiscussionMutation.isPending}
        error={createError}
      />

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
              disabled={deleteDiscussionMutation.isPending}
              className="rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626] disabled:opacity-50"
            >
              {deleteDiscussionMutation.isPending ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </ClassPageShellTemplate>
  );
}
