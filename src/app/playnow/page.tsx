import { Suspense } from "react";
import PlayNowClientPage from "./clientPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <PlayNowClientPage />
    </Suspense>
  );
}
