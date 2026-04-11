export type ForumParticipantRole = "teacher" | "student";

export type ForumDiscussionStatus = "active" | "inactive";

export type ForumTone = "amber" | "emerald" | "rose" | "sky" | "slate" | "violet";

export type ForumSortOption =
  | "latest"
  | "oldest"
  | "most-replied"
  | "most-liked";

export type ForumOwnershipFilter = "all" | "mine" | "others";

export type ForumActivityFilter = "all" | "active" | "inactive";

export interface IForumOption<T extends string> {
  value: T;
  label: string;
}

export interface IForumMaterial {
  id: string;
  label: string;
  isGeneral?: boolean;
}

export interface IForumAuthor {
  id: string;
  name: string;
  role: ForumParticipantRole;
  tone: ForumTone;
  isCurrentUser?: boolean;
}

export interface IForumReply {
  id: string;
  content: string;
  author: IForumAuthor;
  createdAt: number;
  likesCount: number;
  isLiked: boolean;
}

export interface IForumDiscussion {
  id: string;
  content: string;
  materialId: string;
  status: ForumDiscussionStatus;
  isPinned: boolean;
  createdAt: number;
  likesCount: number;
  isLiked: boolean;
  author: IForumAuthor;
  replies: IForumReply[];
}

export interface IForumFilterState {
  searchQuery: string;
  ownership: ForumOwnershipFilter;
  activity: ForumActivityFilter;
  teacherOnly: boolean;
  materialId: string;
  sortBy: ForumSortOption;
}

export interface ICreateForumDiscussionInput {
  content: string;
  materialId: string;
}

export interface ICreateForumReplyInput {
  discussionId: string;
  content: string;
}

export interface IClassForumPageTemplateProps {
  slug: string;
}

export interface IClassForumDetailPageTemplateProps {
  slug: string;
  discussionId: string;
}
