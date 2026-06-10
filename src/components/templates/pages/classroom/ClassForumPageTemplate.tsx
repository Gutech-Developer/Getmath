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
  // ── Resolve courseId from slug ──────────────────────────────────────────
  const { data: course } = useGsCourseBySlug(slug);
  const courseId = course?.id ?? "";
  const classTitle = course?.courseName ?? formatClassTitleFromSlug(slug);
  const [localLikes, setLocalLikes] = useState<Record<string, { isLiked: boolean; count: number }>>({});

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

      const isCurrentUser = d.authorUserId === currentUser?.id || d.author?.id === currentUser?.id;
      const authorRole = (isCurrentUser && currentUser?.role === "ADMIN")
        ? "admin"
        : (d.author?.role ? d.author.role.toLowerCase() : (d.author?.teacher ? "teacher" : "student"));
      const authorName = (isCurrentUser && currentUser?.fullName)
        ? currentUser.fullName
        : d.author?.teacher?.fullName ?? d.author?.student?.fullName ?? d.author?.fullName ?? (authorRole === "admin" ? "Admin" : "Pengguna");

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
          name: authorName,
          role: authorRole as any,
          tone: "slate" as const,
          isCurrentUser,
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
        <header className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-lottie-teal/20 bg-lottie-teal/5 text-lottie-teal px-3 py-1 text-xs font-semibold ">
                Forum Kelas
              </p>
              <h1 className="mt-3 font-semibold text-2xl  mantap font-normal text-lottie-midnight">
                Forum Diskusi
              </h1>
              {isApiLoading ? (
                <p className="mt-2 text-sm text-lottie-zinc-400 font-medium">Memuat diskusi...</p>
              ) : isApiError ? (
                <p className="mt-2 text-sm text-rose-600 font-medium">
                  Gagal memuat diskusi. {apiErrorObj?.message}
                </p>
              ) : (
                <p className="mt-2 text-sm text-lottie-zinc-500 font-medium">
                  {activeDiscussions} diskusi aktif . {totalDiscussions} total
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isApiLoading}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-lottie-teal px-6 text-base font-semibold text-white shadow-[0_8px_24px_rgba(31,35,117,0.12)] transition duration-300 hover:bg-lottie-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-lottie-teal/20 bg-lottie-teal/5 text-lottie-teal px-5 text-sm font-semibold transition hover:bg-lottie-teal/10"
              >
                <FilterIcon />
                Filter & Urutkan
              </button>

              {isFilterDirty ? (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FORUM_FILTERS)}
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-lottie-mist bg-white px-5 text-sm font-semibold text-lottie-zinc-600 transition hover:bg-lottie-pearl"
                >
                  Reset Filter
                </button>
              ) : null}
            </div>
          </div>

          {showAdvancedFilters ? (
            <div className="mt-4 rounded-2xl border border-lottie-mist bg-lottie-pearl/50 p-5">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.6fr)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lottie-zinc-400">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lottie-zinc-400">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lottie-zinc-400">
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
            <p className="text-sm text-lottie-zinc-500">
              Menampilkan{" "}
              <span className="font-semibold text-lottie-midnight">
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
                    className="rounded-xl bg-lottie-teal px-5 py-3 text-sm font-semibold text-white transition hover:bg-lottie-teal/90"
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
          <p className="text-sm text-lottie-zinc-600">
            Apakah Anda yakin ingin menghapus diskusi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="rounded-xl border border-lottie-mist bg-white px-4 py-2 text-sm font-semibold text-lottie-zinc-600 hover:bg-lottie-pearl"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteDiscussionMutation.isPending}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteDiscussionMutation.isPending ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </ClassPageShellTemplate>
  );
}
