"use client";

import { Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_STATES_NAME,
  ALL_STATES_SLUG,
} from "@/lib/institutions-types";
import { useInstitutionsFilter } from "@/contexts/institutions-filter-context";

import "@/styles/app-shell.css";

export function HeaderSearchBar() {
  const {
    states,
    selectedState,
    search,
    setSearch,
    handleStateChange,
    handleTypeFilter,
    handleDistrictFilter,
    typeFilter,
    districtFilter,
    institutionTypes,
    districts,
    stateFilterLabel,
    typeFilterLabel,
    districtFilterLabel,
    isLoading,
  } = useInstitutionsFilter();

  return (
    <div className="app-shell__search-pill">
      <label className="app-shell__search-field">
        <Search className="app-shell__search-icon" aria-hidden />
        <input
          type="search"
          className="app-shell__search-input"
          placeholder="Search institutions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search institutions"
        />
      </label>

      <span className="app-shell__search-divider" aria-hidden />

      <div className="app-shell__search-filters">
        <div className="app-shell__search-filter">
          <Select
            value={selectedState.slug}
            onValueChange={handleStateChange}
          >
            <SelectTrigger className="app-shell__filter-trigger" size="sm">
              <SelectValue>{stateFilterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent
              className="app-shell__filter-content"
              alignItemWithTrigger={false}
            >
              <SelectItem value={ALL_STATES_SLUG}>{ALL_STATES_NAME}</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.slug} value={state.slug}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="app-shell__search-divider" aria-hidden />

        <div className="app-shell__search-filter">
          <Select
            value={typeFilter}
            onValueChange={handleTypeFilter}
            disabled={isLoading || institutionTypes.length === 0}
          >
            <SelectTrigger className="app-shell__filter-trigger" size="sm">
              <SelectValue>{typeFilterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent
              className="app-shell__filter-content"
              alignItemWithTrigger={false}
            >
              <SelectItem value="all">All types</SelectItem>
              {institutionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="app-shell__search-divider" aria-hidden />

        <div className="app-shell__search-filter">
          <Select
            value={districtFilter}
            onValueChange={handleDistrictFilter}
            disabled={isLoading || districts.length === 0}
          >
            <SelectTrigger className="app-shell__filter-trigger" size="sm">
              <SelectValue>{districtFilterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent
              className="app-shell__filter-content"
              alignItemWithTrigger={false}
            >
              <SelectItem value="all">All districts</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
