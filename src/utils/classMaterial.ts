export function getActiveContentMode(typeLabel: string) {
  if (typeLabel === "Video") {
    return "Video";
  }

  if (typeLabel === "E-LKPD") {
    return "E-LKPD";
  }

  if (typeLabel === "Tes" || typeLabel === "Test Diagnosis") {
    return "Tes Diagnostik";
  }

  return "Baca PDF";
}

export function formatContentTitle(contentId: string): string {
  return decodeURIComponent(contentId)
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatBreadcrumbLabel(
  segment: string,
  slug: string,
  contentTitle: string,
) {
  if (!segment) {
    return "";
  }

  if (segment === "student" || segment === "dashboard" || segment === "class") {
    return "";
  }

  if (segment === slug) {
    return formatContentTitle(segment);
  }

  if (segment === "materi") {
    return "Materi";
  }

  if (segment === "content") {
    return "";
  }

  if (segment === contentTitle.toLowerCase().replace(/\s+/g, "-")) {
    return contentTitle;
  }

  return formatContentTitle(segment);
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
