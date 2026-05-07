import {
  CLASS_FORUM_MATERIALS,
} from "@/constant/classForum";
import { buildClassRoute } from "@/constant/classSidebarRoutes";
import type {
  ForumSortOption,
  IForumDiscussion,
  IForumFilterState,
  IForumMaterial,
} from "@/types";

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

function countDiscussionReplies(discussion: IForumDiscussion): number {
  return discussion.replies.length;
}

function compareBySortOption(
  left: IForumDiscussion,
  right: IForumDiscussion,
  sortBy: ForumSortOption,
): number {
  if (sortBy === "oldest") {
    return left.createdAt - right.createdAt;
  }

  if (sortBy === "most-liked") {
    return right.likesCount - left.likesCount;
  }

  if (sortBy === "most-replied") {
    return countDiscussionReplies(right) - countDiscussionReplies(left);
  }

  return right.createdAt - left.createdAt;
}

export function buildClassForumDiscussionRoute(
  slug: string,
  discussionId: string,
): string {
  return `${buildClassRoute(slug, "forum")}/${encodeURIComponent(
    discussionId,
  )}`;
}

export function getForumMaterialById(materialId: string): IForumMaterial | undefined {
  return CLASS_FORUM_MATERIALS.find((material) => material.id === materialId);
}

export function getForumMaterialLabel(materialId: string): string {
  return getForumMaterialById(materialId)?.label ?? "Umum";
}

export function formatForumRelativeTime(createdAt: number): string {
  const elapsedMinutes = Math.max(
    0,
    Math.round((Date.now() - createdAt) / (60 * 1000)),
  );

  if (elapsedMinutes < 1) {
    return "Baru saja";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} menit lalu`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} jam lalu`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} hari lalu`;
}

export function countActiveForumDiscussions(
  discussions: IForumDiscussion[],
): number {
  return discussions.filter((discussion) => discussion.status === "active")
    .length;
}

export function sortForumDiscussions(
  discussions: IForumDiscussion[],
  sortBy: ForumSortOption,
): IForumDiscussion[] {
  return [...discussions].sort((left, right) => {
    if (left.isPinned !== right.isPinned) {
      return left.isPinned ? -1 : 1;
    }

    return compareBySortOption(left, right, sortBy);
  });
}

export function filterForumDiscussions(
  discussions: IForumDiscussion[],
  filters: IForumFilterState,
): IForumDiscussion[] {
  const normalizedSearchQuery = normalizeSearchValue(filters.searchQuery);

  const filteredDiscussions = discussions.filter((discussion) => {
    if (
      filters.ownership === "mine" &&
      !discussion.author.isCurrentUser
    ) {
      return false;
    }

    if (
      filters.ownership === "others" &&
      discussion.author.isCurrentUser
    ) {
      return false;
    }

    if (
      filters.activity !== "all" &&
      discussion.status !== filters.activity
    ) {
      return false;
    }

    if (filters.teacherOnly && discussion.author.role !== "teacher") {
      return false;
    }

    if (
      filters.materialId !== "all" &&
      discussion.materialId !== filters.materialId
    ) {
      return false;
    }

    if (!normalizedSearchQuery) {
      return true;
    }

    const searchableText = [
      discussion.content,
      discussion.author.name,
      getForumMaterialLabel(discussion.materialId),
      ...discussion.replies.map((reply) => reply.content),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchQuery);
  });

  return sortForumDiscussions(filteredDiscussions, filters.sortBy);
}

export function getForumDiscussionById(
  discussions: IForumDiscussion[],
  discussionId: string,
): IForumDiscussion | undefined {
  return discussions.find((discussion) => discussion.id === discussionId);
}
