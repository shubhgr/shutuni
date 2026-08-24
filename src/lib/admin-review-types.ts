import type { ReviewCategoryId } from "@/lib/review-types";

export type AdminReviewCategory = {
  sentiment: string;
  pros: string;
  cons: string;
};

export type AdminReview = {
  id: string;
  institutionId: string;
  institutionName: string;
  displayName: string;
  email: string | null;
  fullyAnonymous: boolean;
  degreeLevel: string;
  branch: string;
  branchOther: string | null;
  batchYear: string;
  status: string;
  overallSentiment: string;
  expectationGap: string | null;
  oneLiner: string;
  recommend: string;
  recommendReason: string | null;
  categories: Partial<Record<ReviewCategoryId, AdminReviewCategory>>;
  verificationMethod: string;
  moderationStatus: string;
  createdAt: string;
};
