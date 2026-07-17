"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ALL_STATES_NAME,
  ALL_STATES_SLUG,
  type InstitutionListItem,
  type ListingFacets,
  type StateOption,
} from "@/lib/institutions-types";
import {
  ALL_STATES,
  getSelectedState,
  resolveInitialState,
  setSelectedState as persistSelectedState,
  type SelectedState,
} from "@/lib/state-preference";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

interface ListingResponse {
  institutions: InstitutionListItem[];
  total: number;
  page: number;
  facets: ListingFacets;
}

async function fetchListing(
  stateSlug: string,
  page: number,
  query: string,
  type: string,
  district: string
): Promise<ListingResponse> {
  const params = new URLSearchParams({
    state: stateSlug,
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (query) {
    params.set("q", query);
  }

  if (type !== "all") {
    params.set("type", type);
  }

  if (district !== "all") {
    params.set("district", district);
  }

  const res = await fetch(`/api/institutions?${params}`);
  if (!res.ok) throw new Error("Failed to load");

  return res.json() as Promise<ListingResponse>;
}

interface InstitutionsFilterContextValue {
  states: StateOption[];
  selectedState: SelectedState;
  institutions: InstitutionListItem[];
  total: number;
  search: string;
  typeFilter: string;
  districtFilter: string;
  page: number;
  totalPages: number;
  isLoadingStates: boolean;
  isLoading: boolean;
  error: string;
  institutionTypes: string[];
  districts: string[];
  filtered: InstitutionListItem[];
  stateFilterLabel: string;
  typeFilterLabel: string;
  districtFilterLabel: string;
  setSearch: (value: string) => void;
  setPage: (value: number | ((prev: number) => number)) => void;
  handleStateChange: (slug: string | null) => void;
  handleTypeFilter: (value: string | null) => void;
  handleDistrictFilter: (value: string | null) => void;
}

const InstitutionsFilterContext =
  createContext<InstitutionsFilterContextValue | null>(null);

export function InstitutionsFilterProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<SelectedState>(ALL_STATES);
  const [institutions, setInstitutions] = useState<InstitutionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStates() {
      setIsLoadingStates(true);
      setError("");

      try {
        const res = await fetch("/api/institutions/states");
        if (!res.ok) throw new Error("Failed to load states");

        const data = (await res.json()) as { states: StateOption[] };
        const initial = resolveInitialState(data.states, getSelectedState());
        setStates(data.states);
        setSelectedState(initial);
      } catch {
        setError("Could not load states. Please try again.");
      } finally {
        setIsLoadingStates(false);
      }
    }

    loadStates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isLoadingStates) return;

    async function loadInstitutions() {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchListing(
          selectedState.slug,
          page,
          debouncedSearch,
          typeFilter,
          districtFilter
        );
        setInstitutions(data.institutions);
        setTotal(data.total);
        setInstitutionTypes(data.facets.institutionTypes);
        setDistricts(data.facets.districts);
      } catch {
        setError("Could not load institutions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadInstitutions();
  }, [
    selectedState.slug,
    page,
    debouncedSearch,
    typeFilter,
    districtFilter,
    isLoadingStates,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStateChange = useCallback(
    (slug: string | null) => {
      if (!slug) return;

      const match =
        slug === ALL_STATES_SLUG
          ? ALL_STATES
          : states.find((s) => s.slug === slug);

      if (!match) return;

      const selected =
        slug === ALL_STATES_SLUG
          ? ALL_STATES
          : { name: match.name, slug: match.slug };

      setSelectedState(selected);
      persistSelectedState(selected);
      setPage(1);
      setTypeFilter("all");
      setDistrictFilter("all");
    },
    [states]
  );

  const handleTypeFilter = useCallback((value: string | null) => {
    setTypeFilter(value ?? "all");
    setPage(1);
  }, []);

  const handleDistrictFilter = useCallback((value: string | null) => {
    setDistrictFilter(value ?? "all");
    setPage(1);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const value: InstitutionsFilterContextValue = {
    states,
    selectedState,
    institutions,
    total,
    search,
    typeFilter,
    districtFilter,
    page,
    totalPages,
    isLoadingStates,
    isLoading,
    error,
    institutionTypes,
    districts,
    filtered: institutions,
    stateFilterLabel:
      selectedState.slug === ALL_STATES_SLUG
        ? ALL_STATES_NAME
        : selectedState.name,
    typeFilterLabel: typeFilter === "all" ? "All types" : typeFilter,
    districtFilterLabel:
      districtFilter === "all" ? "All districts" : districtFilter,
    setSearch,
    setPage,
    handleStateChange,
    handleTypeFilter,
    handleDistrictFilter,
  };

  return (
    <InstitutionsFilterContext.Provider value={value}>
      {children}
    </InstitutionsFilterContext.Provider>
  );
}

export function useInstitutionsFilter() {
  const context = useContext(InstitutionsFilterContext);
  if (!context) {
    throw new Error(
      "useInstitutionsFilter must be used within InstitutionsFilterProvider"
    );
  }
  return context;
}

export function useInstitutionsFilterOptional() {
  return useContext(InstitutionsFilterContext);
}
