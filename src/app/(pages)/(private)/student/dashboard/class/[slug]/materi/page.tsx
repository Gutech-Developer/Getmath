"use client";

import { use } from "react";
import { useGsCourseBySlug } from "@/services";
import ClassMaterialContentPageTemplate from "@/components/templates/pages/classroom/ClassMaterialContentPageTemplate";

interface IClassMateriPageProps {
  params: Promise<{ slug: string }>;
}

export default function ClassMateriPage({
  params,
}: IClassMateriPageProps) {
  const { slug } = use(params);
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
      slug={slug}
    />
  );
}
