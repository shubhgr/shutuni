"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Search, Star, X } from "lucide-react";

import { CollegeReviewForm } from "@/components/universities/CollegeReviewForm";
import {
  ALL_STATES_NAME,
  ALL_STATES_SLUG,
  type InstitutionListItem,
} from "@/lib/institutions-types";

import "@/styles/review.css";

const PAGE_SIZE = 12;

function formatLocation(item: InstitutionListItem): string {
  const city = item.city || item.district;
  if (city && item.state) return `${city}, ${item.state}`;
  return item.address || item.state || "India";
}

function formatRating(item: InstitutionListItem): string | null {
  const score = item.college_score;
  if (score == null || Number.isNaN(score)) return null;
  return score.toFixed(1);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Smoothly interpolates toward a target number for status text. */
function useAnimatedNumber(target: number, durationMs = 420): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    if (from === target) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const start = performance.now();
    cancelAnimationFrame(frameRef.current);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const next = Math.round(from + (target - from) * easeOutCubic(progress));
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = target;
        setDisplay(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return display;
}

export function ReviewFlow() {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InstitutionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isBrowseMode, setIsBrowseMode] = useState(true);
  const [selected, setSelected] = useState<InstitutionListItem | null>(null);
  const [introDismissed, setIntroDismissed] = useState(false);
  const formRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  const isSearchQuery = query.trim().length >= 1;
  const showIntro = !selected && !isSearchQuery && !introDismissed;

  useEffect(() => {
    if (!showIntro) return;
    const node = introRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => !entry.isIntersecting && entry.boundingClientRect.top < 0)) {
          setIntroDismissed(true);
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showIntro]);

  useEffect(() => {
    if (selected) return;

    const q = query.trim();
    const currentRequest = ++requestId.current;
    const browsing = q.length === 0;

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setIsBrowseMode(browsing);
      setPage(1);

      try {
        if (browsing) {
          const params = new URLSearchParams({
            state: ALL_STATES_SLUG,
            page: "1",
            limit: String(PAGE_SIZE),
          });
          const res = await fetch(`/api/institutions?${params}`);
          if (!res.ok) throw new Error("Browse failed");
          const data = (await res.json()) as {
            total: number;
            institutions: InstitutionListItem[];
          };

          if (currentRequest !== requestId.current) return;
          setResults(data.institutions);
          setTotal(data.total);
        } else {
          setIntroDismissed(true);
          const params = new URLSearchParams({
            q,
            state: ALL_STATES_NAME,
            page: "1",
            limit: String(PAGE_SIZE),
          });
          const res = await fetch(`/api/institutions/search?${params}`);
          if (!res.ok) throw new Error("Search failed");
          const data = (await res.json()) as {
            total: number;
            results: InstitutionListItem[];
          };

          if (currentRequest !== requestId.current) return;
          setResults(data.results);
          setTotal(data.total);
        }
      } catch {
        if (currentRequest !== requestId.current) return;
        setResults([]);
        setTotal(0);
      } finally {
        if (currentRequest === requestId.current) {
          setIsSearching(false);
        }
      }
    }, browsing ? 0 : 300);

    return () => window.clearTimeout(timer);
  }, [query, selected]);

  const loadMore = useCallback(async () => {
    if (selected || loadingMoreRef.current || isSearching) return;
    if (results.length >= total) return;

    const nextPage = page + 1;
    const currentRequest = requestId.current;
    const q = query.trim();
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    const startedAt = Date.now();

    try {
      let nextResults: InstitutionListItem[] = [];
      let nextTotal = total;

      if (isBrowseMode || q.length === 0) {
        const params = new URLSearchParams({
          state: ALL_STATES_SLUG,
          page: String(nextPage),
          limit: String(PAGE_SIZE),
        });
        const res = await fetch(`/api/institutions?${params}`);
        if (!res.ok) throw new Error("Browse failed");
        const data = (await res.json()) as {
          total: number;
          institutions: InstitutionListItem[];
        };
        nextResults = data.institutions;
        nextTotal = data.total;
      } else {
        const params = new URLSearchParams({
          q,
          state: ALL_STATES_NAME,
          page: String(nextPage),
          limit: String(PAGE_SIZE),
        });
        const res = await fetch(`/api/institutions/search?${params}`);
        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as {
          total: number;
          results: InstitutionListItem[];
        };
        nextResults = data.results;
        nextTotal = data.total;
      }

      const waitMs = Math.max(0, 500 - (Date.now() - startedAt));
      if (waitMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, waitMs));
      }

      if (currentRequest !== requestId.current) return;
      setResults((prev) => [...prev, ...nextResults]);
      setTotal(nextTotal);
      setPage(nextPage);
    } catch {
      // Keep existing results.
    } finally {
      if (currentRequest === requestId.current) {
        // Brief cooldown so scroll doesn't chain-fire the next page.
        window.setTimeout(() => {
          loadingMoreRef.current = false;
          setIsLoadingMore(false);
        }, 200);
      }
    }
  }, [
    selected,
    isSearching,
    results.length,
    total,
    page,
    query,
    isBrowseMode,
  ]);

  const hasMore = !selected && !isLoadingMore && results.length > 0 && results.length < total;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "120px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, isLoadingMore, results.length]);

  function handleSelect(item: InstitutionListItem) {
    setSelected(item);
    setQuery(item.name);
    setResults([]);
    setTotal(0);
    setIntroDismissed(true);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handleQueryChange(value: string) {
    if (selected) {
      setSelected(null);
    }
    setQuery(value);
  }

  function clearSearch() {
    setSelected(null);
    setQuery("");
    setIntroDismissed(false);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
    });
  }

  const showEmptyState =
    !selected && !isSearching && !isBrowseMode && total === 0 && results.length === 0;
  const showCountMeta = !selected && !isSearching && total > 0;

  const animatedShown = useAnimatedNumber(showCountMeta ? results.length : 0);
  const animatedTotal = useAnimatedNumber(showCountMeta ? total : 0);

  let searchMeta = "Browse colleges below, or type to search";
  if (selected) {
    searchMeta = "\u00A0";
  } else if (isSearching) {
    searchMeta = isBrowseMode ? "Loading colleges…" : "Searching…";
  } else if (showCountMeta) {
    const noun = animatedTotal === 1 ? "college" : "colleges";
    searchMeta = `Showing ${animatedShown.toLocaleString()} of ${animatedTotal.toLocaleString()} ${noun}`;
  } else if (showEmptyState) {
    searchMeta = "\u00A0";
  }

  return (
    <div className="review-flow">
      <div className="review-flow__top">
        <Link href="/" className="review-page__back">
          <ArrowLeft aria-hidden />
          Back
        </Link>

        {showIntro && (
          <header ref={introRef} className="review-flow__intro">
            <h1 className="review-flow__title">
              Find your college.
              <br />
              Tell the truth.
            </h1>
            <p className="review-flow__lede">
              Search your college. Say what actually happened.
            </p>
          </header>
        )}
      </div>

      <div className="review-flow__search">
        <div className="review-flow__search-bar">
          <Search className="review-flow__search-icon" aria-hidden />
          <input
            id={searchId}
            className="review-flow__search-input"
            type="search"
            placeholder="College name, city, or abbreviation…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoComplete="off"
            autoFocus
            aria-label="Search college"
          />
          {query && (
            <button
              type="button"
              className="review-flow__search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X aria-hidden />
            </button>
          )}
        </div>
        <p
          className={`review-flow__search-meta${showCountMeta ? " review-flow__search-meta--live" : ""}`}
          aria-live="polite"
        >
          {searchMeta}
        </p>
      </div>

      {selected && (
        <section
          ref={formRef}
          className="review-flow__form-panel"
          aria-label={`Review ${selected.name}`}
        >
          <div className="review-flow__form-header">
            <h2 className="review-flow__form-title">{selected.name}</h2>
            <p className="review-flow__form-location">
              <MapPin aria-hidden />
              {formatLocation(selected)}
            </p>
          </div>
          <CollegeReviewForm
            institutionName={selected.name}
            onChangeCollege={() => setSelected(null)}
          />
        </section>
      )}

      {!selected && (
        <section className="review-flow__results" aria-label="Colleges">
          {showEmptyState ? (
            <div className="review-flow__empty" role="status">
              <p className="review-flow__empty-title">
                No college matched that search
              </p>
              <p className="review-flow__empty-hint">
                Try another name, city, or abbreviation.
              </p>
            </div>
          ) : (
            results.map((item) => {
              const rating = formatRating(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  className="review-result"
                  onClick={() => handleSelect(item)}
                >
                  <div className="review-result__main">
                    <span className="review-result__name">{item.name}</span>
                    <span className="review-result__location">
                      <MapPin aria-hidden />
                      {formatLocation(item)}
                    </span>
                  </div>
                  <div
                    className={`review-result__rating${rating ? "" : " review-result__rating--empty"}`}
                  >
                    {rating ? (
                      <>
                        <Star aria-hidden />
                        <span>{rating}</span>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </button>
              );
            })
          )}

          {(hasMore || isLoadingMore) && (
            <div
              ref={sentinelRef}
              className={`review-flow__sentinel${isLoadingMore ? " review-flow__sentinel--loading" : ""}`}
            >
              {isLoadingMore && (
                <div
                  className="review-flow__spinner"
                  role="status"
                  aria-label="Loading more colleges"
                />
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
