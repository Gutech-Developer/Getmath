import type {
  ForumActivityFilter,
  ForumOwnershipFilter,
  ForumSortOption,
  IForumMaterial,
  IForumOption,
} from "@/types";

export const CLASS_FORUM_MATERIALS: IForumMaterial[] = [
  { id: "umum", label: "Umum", isGeneral: true },
];

export const FORUM_OWNERSHIP_FILTER_OPTIONS: IForumOption<ForumOwnershipFilter>[] =
  [
    { value: "all", label: "Semua Diskusi" },
    { value: "mine", label: "Diskusiku Sendiri" },
    { value: "others", label: "Diskusi Orang Lain" },
  ];

export const FORUM_ACTIVITY_FILTER_OPTIONS: IForumOption<ForumActivityFilter>[] =
  [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Hanya Aktif" },
    { value: "inactive", label: "Hanya Nonaktif" },
  ];

export const FORUM_SORT_OPTIONS: IForumOption<ForumSortOption>[] = [
  { value: "latest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "most-replied", label: "Paling Banyak Dibalas" },
];
