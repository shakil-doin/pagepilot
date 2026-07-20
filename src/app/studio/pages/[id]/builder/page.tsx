import BuilderScreen from "@/components/studio/builder/builder-screen";

type Params = Promise<{ id: string }>;

const BuilderPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  // key forces a fresh builder instance per page so navigating page-to-page
  // (e.g. via the command palette) never carries one page's draft state, or a
  // pending autosave, into another page.
  return <BuilderScreen key={id} pageId={id} />;
};

export default BuilderPage;
