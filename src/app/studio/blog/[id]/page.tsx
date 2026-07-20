import PostEditor from "@/components/studio/blog/post-editor/post-editor";

type Params = Promise<{ id: string }>;

const BlogPostPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  return <PostEditor postId={id} />;
};

export default BlogPostPage;
