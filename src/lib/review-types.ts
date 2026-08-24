export type ReviewCategoryId =
  | "academics"
  | "faculty"
  | "infrastructure"
  | "placements"
  | "campusLife"
  | "administration"
  | "hostelFees";

export type ReviewCategoryDraft = {
  sentiment: string;
  pros: string;
  cons: string;
};

export type ReviewVerificationMethod =
  | "email"
  | "google"
  | "document"
  | "skipped"
  | "linkedin";

export type ReviewSubmitPayload = {
  institutionId: string;
  institutionName: string;
  fullyAnonymous: boolean;
  degreeLevel: string;
  branch: string;
  branchOther?: string;
  batchYear: string;
  status: string;
  reviewerRelation?: string;
  reviewerRelationOther?: string;
  overallSentiment: string;
  expectationGap?: string;
  oneLiner: string;
  recommend: string;
  recommendReason?: string;
  categories: Partial<Record<ReviewCategoryId, ReviewCategoryDraft>>;
  verification: {
    method: ReviewVerificationMethod;
    displayName: string;
    collegeEmail?: string;
    documentType?: string;
    documentFilename?: string;
    documentSize?: number;
    documentUrl?: string;
  };
};

export function isReviewSubmitPayload(value: unknown): value is ReviewSubmitPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const verification = v.verification as Record<string, unknown> | undefined;
  return (
    typeof v.institutionId === "string" &&
    typeof v.institutionName === "string" &&
    typeof v.fullyAnonymous === "boolean" &&
    typeof v.degreeLevel === "string" &&
    typeof v.branch === "string" &&
    typeof v.batchYear === "string" &&
    typeof v.status === "string" &&
    typeof v.overallSentiment === "string" &&
    typeof v.oneLiner === "string" &&
    typeof v.recommend === "string" &&
    typeof v.categories === "object" &&
    v.categories !== null &&
    !!verification &&
    typeof verification.method === "string" &&
    typeof verification.displayName === "string"
  );
}
