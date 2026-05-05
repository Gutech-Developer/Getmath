/**
 * GetSmart API — Forum Discussion Types
 */

export interface GsForumUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface GsForumDiscussion {
  id: string;
  courseId: string;
  courseModuleId?: string;
  authorUserId: string;
  author?: GsForumUser;
  content: string;
  imageUrl?: string;
  likeCount: number;
  isLiked?: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GsForumComment {
  id: string;
  discussionId: string;
  authorUserId: string;
  author?: GsForumUser;
  content: string;
  imageUrl?: string;
  likeCount: number;
  isLiked?: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GsForumReply {
  id: string;
  commentId: string;
  authorUserId: string;
  author?: GsForumUser;
  content: string;
  imageUrl?: string;
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}
