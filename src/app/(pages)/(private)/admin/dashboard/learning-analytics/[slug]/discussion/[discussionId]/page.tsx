import ClassForumDetailPageTemplate from "@/components/templates/pages/classroom/ClassForumDetailPageTemplate";

interface IAdminDiscussionDetailPageProps {
  params: Promise<{ slug: string; discussionId: string }>;
}

export default async function AdminDiscussionDetailPage({
  params,
}: IAdminDiscussionDetailPageProps) {
  const { slug, discussionId } = await params;

  return (
    <ClassForumDetailPageTemplate
      slug={slug}
      discussionId={discussionId}
      backHref={`/admin/dashboard/learning-analytics/${slug}?view=Forum`}
    />
  );
}
