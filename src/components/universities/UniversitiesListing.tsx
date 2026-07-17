"use client";

import { Button } from "@/components/ui/button";
import { InstitutionCard } from "@/components/universities/InstitutionCard";
import { InstitutionsListingSkeleton } from "@/components/universities/InstitutionsListingSkeleton";
import { useInstitutionsFilter } from "@/contexts/institutions-filter-context";
import { ALL_STATES_SLUG } from "@/lib/institutions-types";

import "@/styles/universities.css";

export function UniversitiesListing() {
  const {
    selectedState,
    total,
    search,
    filtered,
    page,
    totalPages,
    isLoadingStates,
    isLoading,
    error,
    setPage,
  } = useInstitutionsFilter();

  const searchQuery = search.trim();

  if (isLoadingStates) {
    return <InstitutionsListingSkeleton />;
  }

  return (
    <div className="universities-content">
      {isLoading && (
        <p className="universities-page__count">Loading institutions…</p>
      )}

      {error && (
        <div className="universities-empty">
          <p className="universities-empty__title">{error}</p>
        </div>
      )}

      {!error && !isLoading && filtered.length > 0 ? (
        <>
          <p className="universities-page__count">
            Showing {filtered.length} of {total.toLocaleString()} institutions
            {selectedState.slug !== ALL_STATES_SLUG && ` in ${selectedState.name}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <div className="universities-list">
            {filtered.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="universities-pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="universities-pagination__label">
                Page {page} of {totalPages.toLocaleString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        !error &&
        !isLoading && (
          <div className="universities-empty">
            <p className="universities-empty__title">No institutions found</p>
            <p className="universities-empty__text">
              Try a different search term or filter.
            </p>
          </div>
        )
      )}
    </div>
  );
}
