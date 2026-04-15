import ClassForumPageTemplate from "@/components/templates/pages/classroom/ClassForumPageTemplate";

interface IClassForumPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassForumPage({ params }: IClassForumPageProps) {
  const { slug } = await params;

  return <ClassForumPageTemplate slug={slug} />;
}
