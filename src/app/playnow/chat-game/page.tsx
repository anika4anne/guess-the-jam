import { Suspense } from "react";
import { ChatGamePage } from "./ChatGamePage";

export default function ChatGamePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatGamePage />
    </Suspense>
  );
}
