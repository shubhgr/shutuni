import "server-only";

import { ensureReviewSchema, getSql } from "@/lib/db";
import type { AdminReview } from "@/lib/admin-review-types";

export type { AdminReview } from "@/lib/admin-review-types";

type ReviewRow = {
  id: string;
  institution_id: string;
  institution_name: string;
  display_name: string;
  college_email: string | null;
  linkedin_email: string | null;
  fully_anonymous: boolean;
  degree_level: string;
  branch: string;
  branch_other: string | null;
  batch_year: string;
  status: string;
  overall_sentiment: string;
  expectation_gap: string | null;
  one_liner: string;
  recommend: string;
  recommend_reason: string | null;
  categories: unknown;
  verification_method: string;
  moderation_status: string;
  document_type: string | null;
  document_filename: string | null;
  document_url: string | null;
  created_at: string | Date;
};

function mapRow(row: ReviewRow): AdminReview {
  const categories =
    row.categories && typeof row.categories === "object"
      ? (row.categories as AdminReview["categories"])
      : {};

  return {
    id: String(row.id),
    institutionId: row.institution_id,
    institutionName: row.institution_name,
    displayName: row.display_name,
    email: row.college_email || row.linkedin_email || null,
    fullyAnonymous: Boolean(row.fully_anonymous),
    degreeLevel: row.degree_level,
    branch: row.branch,
    branchOther: row.branch_other,
    batchYear: row.batch_year,
    status: row.status,
    overallSentiment: row.overall_sentiment,
    expectationGap: row.expectation_gap,
    oneLiner: row.one_liner,
    recommend: row.recommend,
    recommendReason: row.recommend_reason,
    categories,
    verificationMethod: row.verification_method,
    moderationStatus: row.moderation_status,
    documentType: row.document_type,
    documentFilename: row.document_filename,
    documentUrl: row.document_url,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function listReviews(options?: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ reviews: AdminReview[]; total: number }> {
  await ensureReviewSchema();
  const sql = getSql();
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const offset = Math.max(options?.offset ?? 0, 0);
  const q = options?.q?.trim();

  if (q) {
    const pattern = `%${q}%`;
    const countRows = await sql`
      SELECT COUNT(*)::int AS total
      FROM reviews
      WHERE
        institution_name ILIKE ${pattern}
        OR display_name ILIKE ${pattern}
        OR COALESCE(college_email, '') ILIKE ${pattern}
        OR COALESCE(linkedin_email, '') ILIKE ${pattern}
        OR institution_id ILIKE ${pattern}
    `;
    const rows = (await sql`
      SELECT
        id,
        institution_id,
        institution_name,
        display_name,
        college_email,
        linkedin_email,
        fully_anonymous,
        degree_level,
        branch,
        branch_other,
        batch_year,
        status,
        overall_sentiment,
        expectation_gap,
        one_liner,
        recommend,
        recommend_reason,
        categories,
        verification_method,
        moderation_status,
        document_type,
        document_filename,
        document_url,
        created_at
      FROM reviews
      WHERE
        institution_name ILIKE ${pattern}
        OR display_name ILIKE ${pattern}
        OR COALESCE(college_email, '') ILIKE ${pattern}
        OR COALESCE(linkedin_email, '') ILIKE ${pattern}
        OR institution_id ILIKE ${pattern}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `) as ReviewRow[];

    return {
      reviews: rows.map(mapRow),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  const countRows = await sql`SELECT COUNT(*)::int AS total FROM reviews`;
  const rows = (await sql`
    SELECT
      id,
      institution_id,
      institution_name,
      display_name,
      college_email,
      linkedin_email,
      fully_anonymous,
      degree_level,
      branch,
      branch_other,
      batch_year,
      status,
      overall_sentiment,
      expectation_gap,
      one_liner,
      recommend,
      recommend_reason,
      categories,
      verification_method,
      moderation_status,
      document_type,
      document_filename,
      document_url,
      created_at
    FROM reviews
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `) as ReviewRow[];

  return {
    reviews: rows.map(mapRow),
    total: Number(countRows[0]?.total ?? 0),
  };
}
