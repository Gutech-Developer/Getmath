/**
 * GetSmart API — Forum Discussion Types
 */

export interface GsForumUser {
  id: string;
  fullName?: string;
  email: string;
  avatarUrl?: string;
  teacher?: {
    id: string;
    fullName: string;
  };
  student?: {
    id: string;
    fullName: string;
  };
}

export interface GsForumDiscussion {
  id: string;
  courseId: string;
  courseModuleId?: string;
  authorUserId: string;
  author?: GsForumUser;
  content: string;
  imageUrl?: string;
  likeCount?: number;
  totalLikes?: number;
  isLiked?: boolean;
  commentCount?: number;
  totalComments?: number;
  courseModule?: {
    id: string;
    order?: number;
    type?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GsForumComment {
  id: string;
  discussionId: string;
  parentCommentId?: string;
  authorUserId: string;
  author?: GsForumUser;
  content: string;
  imageUrl?: string;
  isEdited?: boolean;
  totalLikes: number;
  totalReplies?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GsForumReply {
  id: string;
  commentId?: string; // Legacy
  discussionId: string;
  parentCommentId: string;
  authorUserId: string;
  author?: GsForumUser;
  content: string;
  imageUrl?: string;
  isEdited?: boolean;
  totalLikes: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}
