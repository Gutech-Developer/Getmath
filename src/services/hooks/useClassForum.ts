"use client";

import { useEffect, useMemo, useState } from "react";
import { CLASS_FORUM_DISCUSSIONS } from "@/constant/classForum";
import type {
  ICreateForumDiscussionInput,
  ICreateForumReplyInput,
  IForumDiscussion,
} from "@/types";
import {
  cloneForumDiscussions,
  createForumDiscussion,
  createForumReply,
  getClassForumStorageKey,
} from "@/utils/classForum";

const DEFAULT_FORUM_DISCUSSIONS = cloneForumDiscussions(CLASS_FORUM_DISCUSSIONS);

export function useClassForum(slug: string) {
  const storageKey = useMemo(() => getClassForumStorageKey(slug), [slug]);
  const [discussions, setDiscussions] = useState<IForumDiscussion[]>(
    DEFAULT_FORUM_DISCUSSIONS,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedValue = window.localStorage.getItem(storageKey);

    if (!savedValue) {
      setDiscussions(cloneForumDiscussions(CLASS_FORUM_DISCUSSIONS));
      setIsHydrated(true);
      return;
    }

    try {
      const parsedValue = JSON.parse(savedValue) as IForumDiscussion[];
      setDiscussions(parsedValue);
    } catch {
      window.localStorage.removeItem(storageKey);
      setDiscussions(cloneForumDiscussions(CLASS_FORUM_DISCUSSIONS));
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(discussions));
  }, [discussions, isHydrated, storageKey]);

  const createDiscussion = (input: ICreateForumDiscussionInput) => {
    const newDiscussion = createForumDiscussion(input);

    setDiscussions((currentDiscussions) => [
      newDiscussion,
      ...currentDiscussions,
    ]);

    return newDiscussion;
  };

  const toggleDiscussionLike = (discussionId: string) => {
    setDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) => {
        if (discussion.id !== discussionId) {
          return discussion;
        }

        const isLiked = !discussion.isLiked;

        return {
          ...discussion,
          isLiked,
          likesCount: Math.max(
            0,
            discussion.likesCount + (isLiked ? 1 : -1),
          ),
        };
      }),
    );
  };

  const addReply = (input: ICreateForumReplyInput) => {
    const newReply = createForumReply(input.content);

    setDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === input.discussionId
          ? {
              ...discussion,
              status: "active",
              replies: [...discussion.replies, newReply],
            }
          : discussion,
      ),
    );

    return newReply;
  };

  const toggleReplyLike = (discussionId: string, replyId: string) => {
    setDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) => {
        if (discussion.id !== discussionId) {
          return discussion;
        }

        return {
          ...discussion,
          replies: discussion.replies.map((reply) => {
            if (reply.id !== replyId) {
              return reply;
            }

            const isLiked = !reply.isLiked;

            return {
              ...reply,
              isLiked,
              likesCount: Math.max(0, reply.likesCount + (isLiked ? 1 : -1)),
            };
          }),
        };
      }),
    );
  };

  const resetDiscussions = () => {
    setDiscussions(cloneForumDiscussions(CLASS_FORUM_DISCUSSIONS));
  };

  return {
    discussions,
    isHydrated,
    createDiscussion,
    toggleDiscussionLike,
    addReply,
    toggleReplyLike,
    resetDiscussions,
  };
}
