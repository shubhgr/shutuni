import "server-only";

import { cookies } from "next/headers";

import { ensureReviewSchema, getSql, newId } from "@/lib/db";
import {
  decodeSession,
  LINKEDIN_SESSION_COOKIE,
} from "@/lib/linkedin-oauth";
import type { ReviewSubmitPayload } from "@/lib/review-types";

export type SavedReview = {
  id: string;
  reviewerId: string | null;
};

export async function saveReview(
  payload: ReviewSubmitPayload
): Promise<SavedReview> {
  await ensureReviewSchema();
  const sql = getSql();

  const jar = await cookies();
  const linkedin = decodeSession(jar.get(LINKEDIN_SESSION_COOKIE)?.value);

  let reviewerId: string | null = null;

  if (linkedin?.sub) {
    const existing = await sql`
      SELECT id FROM reviewers WHERE linkedin_sub = ${linkedin.sub} LIMIT 1
    `;
    if (existing[0]?.id) {
      reviewerId = String(existing[0].id);
      await sql`
        UPDATE reviewers
        SET
          display_name = ${payload.verification.displayName.trim()},
          email = ${linkedin.email ?? null},
          updated_at = NOW()
        WHERE id = ${reviewerId}
      `;
    } else {
      reviewerId = newId();
      await sql`
        INSERT INTO reviewers (id, linkedin_sub, display_name, email)
        VALUES (
          ${reviewerId},
          ${linkedin.sub},
          ${payload.verification.displayName.trim()},
          ${linkedin.email ?? null}
        )
      `;
    }
  }

  const reviewId = newId();
  await sql`
    INSERT INTO reviews (
      id,
      institution_id,
      institution_name,
      reviewer_id,
      fully_anonymous,
      degree_level,
      branch,
      branch_other,
      batch_year,
      status,
      reviewer_relation,
      reviewer_relation_other,
      overall_sentiment,
      expectation_gap,
      one_liner,
      recommend,
      recommend_reason,
      categories,
      verification_method,
      college_email,
      document_type,
      document_filename,
      document_size,
      display_name,
      linkedin_sub,
      linkedin_email,
      moderation_status
    ) VALUES (
      ${reviewId},
      ${payload.institutionId},
      ${payload.institutionName},
      ${reviewerId},
      ${payload.fullyAnonymous},
      ${payload.degreeLevel},
      ${payload.branch},
      ${payload.branchOther?.trim() || null},
      ${payload.batchYear},
      ${payload.status},
      ${payload.reviewerRelation?.trim() || null},
      ${payload.reviewerRelationOther?.trim() || null},
      ${payload.overallSentiment},
      ${payload.expectationGap?.trim() || null},
      ${payload.oneLiner.trim()},
      ${payload.recommend},
      ${payload.recommendReason?.trim() || null},
      CAST(${JSON.stringify(payload.categories)} AS jsonb),
      ${payload.verification.method},
      ${payload.verification.collegeEmail?.trim() || null},
      ${payload.verification.documentType || null},
      ${payload.verification.documentFilename || null},
      ${payload.verification.documentSize ?? null},
      ${payload.verification.displayName.trim()},
      ${linkedin?.sub ?? null},
      ${linkedin?.email ?? null},
      ${"pending"}
    )
  `;

  return { id: reviewId, reviewerId };
}
