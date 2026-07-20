import { Suspense } from "react";
import BlogScreen from "@/components/studio/blog/blog-screen";

// Suspense boundary required because the screen reads useSearchParams (?new=1).
const StudioBlog = () => (
  <Suspense>
    <BlogScreen />
  </Suspense>
);

export default StudioBlog;
