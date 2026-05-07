import ClassForumDetailPageTemplate from "@/components/templates/pages/classroom/ClassForumDetailPageTemplate";

interface ITeacherDiscussionDetailPageProps {
  params: Promise<{ slug: string; discussionId: string }>;
}

export default async function TeacherDiscussionDetailPage({
  params,
}: ITeacherDiscussionDetailPageProps) {
  const { slug, discussionId } = await params;

  return (
    <ClassForumDetailPageTemplate
      slug={slug}
      discussionId={discussionId}
      backHref={`/teacher/dashboard/class-list/${slug}?view=Forum`}
    />
  );
}
