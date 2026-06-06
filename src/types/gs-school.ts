export interface GsSchool {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GsSchoolWithCounts extends GsSchool {
  teacherCount: number;
  studentCount: number;
  courseCount: number;
}

export interface GsPaginatedSchools {
  schools: GsSchoolWithCounts[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateSchoolInput {
  name: string;
}

export interface UpdateSchoolInput {
  name?: string;
}
