import "server-only";

import { ensureReviewSchema, getSql } from "@/lib/db";
import type { InstitutionListItem } from "@/lib/institutions-types";

/** Map overall-experience sentiment to a 0–10 score for averaging. */
export const OVERALL_SENTIMENT_SCORE: Record<string, number> = {
  disappointing: 2,
  fellShort: 4,
  okay: 6,
  prettyGood: 8,
  impressed: 10,
};

export type InstitutionReviewStats = {
  average: number;
  count: number;
};

export async function getOverallReviewStatsByInstitutionIds(
  institutionIds: string[]
): Promise<Map<string, InstitutionReviewStats>> {
  const uniqueIds = [...new Set(institutionIds.filter(Boolean))];
  const result = new Map<string, InstitutionReviewStats>();
  if (uniqueIds.length === 0) return result;

  try {
    await ensureReviewSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT
        institution_id,
        AVG(
          CASE overall_sentiment
            WHEN 'disappointing' THEN 2.0
            WHEN 'fellShort' THEN 4.0
            WHEN 'okay' THEN 6.0
            WHEN 'prettyGood' THEN 8.0
            WHEN 'impressed' THEN 10.0
            ELSE NULL
          END
        ) AS average_score,
        COUNT(*)::int AS review_count
      FROM reviews
      WHERE institution_id = ANY(${uniqueIds})
      GROUP BY institution_id
    `;

    for (const row of rows) {
      const id = String(row.institution_id);
      const average = Number(row.average_score);
      const count = Number(row.review_count);
      if (!id || Number.isNaN(average) || count <= 0) continue;
      result.set(id, {
        average: Math.round(average * 10) / 10,
        count,
      });
    }
  } catch (error) {
    console.error("Failed to load review averages", error);
  }

  return result;
}

/**
 * Prefer VerdictED review averages for display scores.
 * Colleges with no reviews show null (UI dash), not the imported dataset score.
 */
export async function withReviewAverages(
  institutions: InstitutionListItem[]
): Promise<InstitutionListItem[]> {
  if (institutions.length === 0) return institutions;

  const stats = await getOverallReviewStatsByInstitutionIds(
    institutions.map((item) => item.id)
  );

  return institutions.map((item) => {
    const review = stats.get(item.id);
    if (!review) {
      return {
        ...item,
        college_score: null,
        score: null,
        review_count: 0,
      };
    }
    return {
      ...item,
      college_score: review.average,
      score: review.average,
      review_count: review.count,
    };
  });
}
