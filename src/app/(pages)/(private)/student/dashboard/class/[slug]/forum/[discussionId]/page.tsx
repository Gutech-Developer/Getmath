import ClassForumDetailPageTemplate from "@/components/templates/pages/classroom/ClassForumDetailPageTemplate";

interface IClassForumDetailPageProps {
  params: Promise<{ slug: string; discussionId: string }>;
}

export default async function ClassForumDetailPage({
  params,
}: IClassForumDetailPageProps) {
  const { slug, discussionId } = await params;

  return (
    <ClassForumDetailPageTemplate slug={slug} discussionId={discussionId} />
  );
}
