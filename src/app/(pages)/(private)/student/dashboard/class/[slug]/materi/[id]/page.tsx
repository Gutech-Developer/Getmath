"use client";

import { use } from "react";
import { useGsCourseBySlug } from "@/services";
import ClassMaterialContentPageTemplate from "@/components/templates/pages/classroom/ClassMaterialContentPageTemplate";

interface IClassMateriContentPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default function ContentMateri({ params }: IClassMateriContentPageProps) {
  const { slug, id } = use(params);
  const { data: course, isLoading } = useGsCourseBySlug(slug);

  if (isLoading || !course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#9CA3AF]">
        Memuat materi...
      </div>
    );
  }

  return (
    <ClassMaterialContentPageTemplate
      courseId={course.id}
      contentId={id}
      slug={slug}
    />
  );
}
