export const ALL_STATES_SLUG = "all";
export const ALL_STATES_NAME = "All states";

export const DEFAULT_STATE = "Tamil Nadu";
export const DEFAULT_STATE_SLUG = "tamil-nadu";

export interface Programme {
  programme: string;
  level: string;
  course: string;
  course_type: string;
  shift: string;
  availability: string;
  intake: string;
  enrollment: string;
  placement: string;
}

export interface InstitutionListItem {
  id: string;
  name: string;
  university?: string;
  state: string;
  district: string;
  institution_type?: string;
  programmes_count?: number;
  address?: string;
  college_score?: number | null;
  score?: number | null;
  review_count?: number;
  university_tier?: string | null;
  category?: string | null;
  city?: string;
  abbreviations?: string[];
}

export interface InstitutionDetail extends InstitutionListItem {
  address: string;
  university: string;
  programmes: Programme[];
  aishe_id?: string | null;
  university_type?: string | null;
  abbreviations?: string[];
}

export interface StateOption {
  name: string;
  slug: string;
}

export interface ListingFacets {
  districts: string[];
  institutionTypes: string[];
}

export function filterInstitutionsByQuery(
  institutions: InstitutionListItem[],
  query: string
): InstitutionListItem[] {
  if (!query) return institutions;

  const q = query.toLowerCase();
  return institutions.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      item.institution_type?.toLowerCase().includes(q) ||
      item.university?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.abbreviations?.some((abbr) => abbr.toLowerCase().includes(q))
  );
}

export function filterInstitutionsByTypeAndDistrict(
  institutions: InstitutionListItem[],
  type?: string | null,
  district?: string | null
): InstitutionListItem[] {
  return institutions.filter((item) => {
    const matchesType =
      !type || type === "all" || item.institution_type === type;
    const matchesDistrict =
      !district || district === "all" || item.district === district;
    return matchesType && matchesDistrict;
  });
}

export function computeListingFacets(
  institutions: InstitutionListItem[]
): ListingFacets {
  const types = new Set(
    institutions
      .map((item) => item.institution_type)
      .filter((type): type is string => Boolean(type))
  );
  const districts = new Set(
    institutions.map((item) => item.district).filter((district) => Boolean(district))
  );

  return {
    institutionTypes: Array.from(types).sort(),
    districts: Array.from(districts).sort((a, b) => a.localeCompare(b)),
  };
}
