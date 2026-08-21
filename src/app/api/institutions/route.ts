import { NextResponse } from "next/server";

import {
  ALL_STATES_SLUG,
  computeListingFacets,
  fetchAllInstitutions,
  fetchInstitutionsByState,
  fetchStates,
  filterInstitutionsByQuery,
  filterInstitutionsByTypeAndDistrict,
} from "@/lib/institutions-api";
import { withReviewAverages } from "@/lib/review-averages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateSlug = searchParams.get("state") ?? ALL_STATES_SLUG;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "24")));
  const query = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type");
  const district = searchParams.get("district");

  try {
    if (stateSlug === ALL_STATES_SLUG) {
      let institutions = await fetchAllInstitutions();
      institutions = filterInstitutionsByQuery(institutions, query);

      const facets = computeListingFacets(institutions);
      const filtered = filterInstitutionsByTypeAndDistrict(
        institutions,
        type,
        district
      );

      const total = filtered.length;
      const start = (page - 1) * limit;
      const slice = await withReviewAverages(
        filtered.slice(start, start + limit)
      );

      return NextResponse.json({
        institutions: slice,
        total,
        page,
        limit,
        state: "All states",
        stateSlug: ALL_STATES_SLUG,
        facets,
      });
    }

    const states = await fetchStates();
    const match = states.find((s) => s.slug === stateSlug);
    const resolvedName = match?.name ?? stateSlug;

    let institutions = await fetchInstitutionsByState(stateSlug, resolvedName);
    institutions = filterInstitutionsByQuery(institutions, query);

    const facets = computeListingFacets(institutions);
    const filtered = filterInstitutionsByTypeAndDistrict(
      institutions,
      type,
      district
    );

    const total = filtered.length;
    const start = (page - 1) * limit;
    const slice = await withReviewAverages(
      filtered.slice(start, start + limit)
    );

    return NextResponse.json({
      institutions: slice,
      total,
      page,
      limit,
      state: resolvedName,
      stateSlug,
      facets,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}
