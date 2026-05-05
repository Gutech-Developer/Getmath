"use client";

import { useMemo, useState } from "react";
import type {
  ICreateForumDiscussionInput,
  ICreateForumReplyInput,
  IForumDiscussion,
} from "@/types";

/**
 * @deprecated useClassForum adalah fallback lokal yang sudah diganti dengan API-first approach.
 * Gunakan useListDiscussionsByCourse, useCreateDiscussion, useLikeDiscussion dari @/services/hooks/useGsDiscussions.ts
 */
export function useClassForum(slug: string) {
  const [discussions, setDiscussions] = useState<IForumDiscussion[]>([]);

  const toggleDiscussionLike = useMemo(
    () => (discussionId: string) => {
      // Deprecated: API-only now
    },
    [],
  );

  const createDiscussion = useMemo(
    () => (content: ICreateForumDiscussionInput) => {
      // Deprecated: Use useCreateDiscussion hook
    },
    [],
  );

  const addReply = useMemo(
    () => (input: ICreateForumReplyInput) => {
      // Deprecated: Use API for replies
    },
    [],
  );

  const toggleReplyLike = useMemo(
    () => (discussionId: string, replyId: string) => {
      // Deprecated: API-only now
    },
    [],
  );

  const resetDiscussions = useMemo(
    () => () => {
      setDiscussions([]);
    },
    [],
  );

  return {
    discussions,
    isHydrated: true,
    createDiscussion,
    toggleDiscussionLike,
    addReply,
    toggleReplyLike,
    resetDiscussions,
  };
}
