import type { Metadata } from "next";

import { ReviewFlow } from "@/components/review/ReviewFlow";

import "@/styles/review.css";

export const metadata: Metadata = {
  title: "Give your college review",
  description:
    "Search your college and leave an honest review — without judgment.",
};

export default function ReviewPage() {
  return (
    <div className="review-page">
      <main className="review-page__main">
        <ReviewFlow />
      </main>
    </div>
  );
}
