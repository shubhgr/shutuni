import "server-only";

import {
  findCollegeByNameMatch,
  getAllColleges,
  getCollegeById,
  getStateNames,
  resolveStateNameFromSlug,
  slugify,
  type CollegeRecord,
} from "@/lib/colleges-store";
import {
  ALL_STATES_NAME,
  DEFAULT_STATE,
  DEFAULT_STATE_SLUG,
  type InstitutionDetail,
  type InstitutionListItem,
  type StateOption,
} from "@/lib/institutions-types";

export {
  ALL_STATES_NAME,
  ALL_STATES_SLUG,
  DEFAULT_STATE,
  DEFAULT_STATE_SLUG,
  computeListingFacets,
  filterInstitutionsByQuery,
  filterInstitutionsByTypeAndDistrict,
} from "@/lib/institutions-types";

export type {
  InstitutionDetail,
  InstitutionListItem,
  ListingFacets,
  Programme,
  StateOption,
} from "@/lib/institutions-types";

function mapCollegeToListItem(college: CollegeRecord): InstitutionListItem {
  const institutionType = college.universityType ?? college.category ?? undefined;

  return {
    id: college.id,
    name: college.name,
    university: college.universityName ?? undefined,
    state: college.state,
    city: college.city,
    district: college.city,
    institution_type: institutionType,
    address: [college.city, college.state].filter(Boolean).join(", "),
    college_score: college.collegeScore,
    score: college.score,
    university_tier: college.universityTier,
    category: college.category,
    abbreviations: college.abbreviations,
  };
}

function mapCollegeToDetail(college: CollegeRecord): InstitutionDetail {
  const listItem = mapCollegeToListItem(college);

  return {
    ...listItem,
    address: listItem.address ?? [college.city, college.state].filter(Boolean).join(", "),
    university: college.universityName ?? "",
    programmes: [],
    aishe_id: college.aisheId,
    university_type: college.universityType,
    abbreviations: college.abbreviations,
  };
}

function matchesQuery(college: CollegeRecord, query: string): boolean {
  const q = query.toLowerCase();

  return (
    college.name.toLowerCase().includes(q) ||
    college.city.toLowerCase().includes(q) ||
    college.state.toLowerCase().includes(q) ||
    (college.universityName?.toLowerCase().includes(q) ?? false) ||
    (college.category?.toLowerCase().includes(q) ?? false) ||
    (college.universityType?.toLowerCase().includes(q) ?? false) ||
    (college.universityTier?.toLowerCase().includes(q) ?? false) ||
    college.abbreviations.some((abbr) => abbr.toLowerCase().includes(q))
  );
}

function filterActiveColleges(colleges: CollegeRecord[]): CollegeRecord[] {
  return colleges.filter((college) => college.active);
}

const LEGACY_AICTE_ID = /^1-\d+$/;
const OLD_INSTITUTIONS_API_BASE =
  "https://indian-colleges-list.vercel.app/api/institutions";

async function resolveLegacyCollege(
  id: string,
  state: string
): Promise<CollegeRecord | undefined> {
  if (!LEGACY_AICTE_ID.test(id)) return undefined;

  const res = await fetch(
    `${OLD_INSTITUTIONS_API_BASE}/states/${encodeURIComponent(state)}/${encodeURIComponent(id)}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) return undefined;

  const data = (await res.json()) as { name: string };
  return findCollegeByNameMatch(data.name, state);
}

export async function fetchStates(): Promise<StateOption[]> {
  return getStateNames().map((name) => ({
    name,
    slug: slugify(name),
  }));
}

export async function fetchAllInstitutions(): Promise<InstitutionListItem[]> {
  return filterActiveColleges(getAllColleges()).map(mapCollegeToListItem);
}

export async function resolveInstitutionState(id: string): Promise<string | null> {
  return getCollegeById(id)?.state ?? null;
}

export async function fetchInstitutionsByState(
  stateSlug: string = DEFAULT_STATE_SLUG,
  stateName?: string
): Promise<InstitutionListItem[]> {
  const resolvedName = stateName ?? resolveStateNameFromSlug(stateSlug) ?? stateSlug;

  return filterActiveColleges(getAllColleges())
    .filter((college) => college.state === resolvedName)
    .map(mapCollegeToListItem);
}

export async function searchInstitutions(
  query: string,
  state: string = DEFAULT_STATE,
  page = 1,
  limit = 25
): Promise<{ total: number; page: number; limit: number; results: InstitutionListItem[] }> {
  const q = query.trim();
  const start = Math.max(0, (page - 1) * limit);

  const matches = filterActiveColleges(getAllColleges())
    .filter((college) => {
      if (state && state !== ALL_STATES_NAME && college.state !== state) {
        return false;
      }
      return matchesQuery(college, q);
    })
    .map(mapCollegeToListItem);

  return {
    total: matches.length,
    page,
    limit,
    results: matches.slice(start, start + limit),
  };
}

export async function fetchInstitutionDetail(
  id: string,
  state?: string
): Promise<InstitutionDetail> {
  let college = getCollegeById(id);

  if (!college && state) {
    college = await resolveLegacyCollege(id, state);
  }

  if (!college || !college.active) {
    throw new Error("Institution not found");
  }

  return mapCollegeToDetail(college);
}
