import { Suspense } from "react";
import PagesScreen from "@/components/studio/pages/pages-screen";

// useSearchParams inside the screen requires a Suspense boundary
const StudioPages = () => (
  <Suspense>
    <PagesScreen />
  </Suspense>
);

export default StudioPages;
