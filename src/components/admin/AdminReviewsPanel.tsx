"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  FileText,
  LayoutGrid,
  List,
  LogOut,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminReview } from "@/lib/admin-review-types";

import "@/styles/admin.css";

type ViewMode = "list" | "cards";

const CATEGORY_LABELS: Record<string, string> = {
  academics: "Academics",
  faculty: "Faculty",
  infrastructure: "Infrastructure",
  placements: "Placements",
  campusLife: "Campus life",
  administration: "Administration",
  hostelFees: "Hostel & fees",
};

const SENTIMENT_LABELS: Record<string, string> = {
  disappointing: "Deeply disappointing",
  fellShort: "Fell short",
  okay: "It was okay",
  prettyGood: "Pretty good",
  impressed: "Genuinely impressed",
  mixed: "Mixed",
  solid: "Solid",
};

const STATUS_LABELS: Record<string, string> = {
  studying: "Currently studying",
  graduated: "Graduated",
  other: "Other",
};

const RECOMMEND_LABELS: Record<string, string> = {
  yes: "Yes",
  no: "No",
  depends: "Depends",
};

const DEGREE_LABELS: Record<string, string> = {
  undergrad: "Undergraduate",
  masters: "Masters",
  phd: "PhD",
  diploma: "Diploma",
  other: "Other",
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function sentimentLabel(value: string) {
  return SENTIMENT_LABELS[value] ?? value;
}

function verificationLabel(value: string) {
  switch (value) {
    case "linkedin":
      return "LinkedIn";
    case "email":
      return "College email";
    case "google":
      return "Google";
    case "document":
      return "Document";
    case "skipped":
      return "Unverified";
    default:
      return value;
  }
}

function statusLabel(value: string) {
  return STATUS_LABELS[value] ?? value;
}

function recommendLabel(value: string) {
  return RECOMMEND_LABELS[value] ?? value;
}

function degreeLabel(value: string) {
  return DEGREE_LABELS[value] ?? value;
}

function categoryEntries(review: AdminReview) {
  return Object.entries(review.categories).filter(([, cat]) => {
    if (!cat) return false;
    return Boolean(
      cat.sentiment?.trim() || cat.pros?.trim() || cat.cons?.trim()
    );
  });
}

export function AdminReviewsPanel() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdminReview | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/session", {
          credentials: "same-origin",
        });
        const data = (await res.json()) as { authenticated?: boolean };
        setAuthenticated(Boolean(data.authenticated));
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  const loadReviews = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("limit", "100");
      const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setAuthenticated(false);
        toast.error("Session expired. Sign in again.");
        return;
      }
      const data = (await res.json()) as {
        reviews?: AdminReview[];
        total?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to load reviews");
      }
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load reviews"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void loadReviews(search);
  }, [authenticated, search, loadReviews]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSigningIn(true);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Invalid password");
      }
      setPassword("");
      setAuthenticated(true);
      toast.success("Signed in");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in"
      );
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
    setAuthenticated(false);
    setReviews([]);
    setTotal(0);
    setSelected(null);
  }

  if (!authChecked) {
    return (
      <div className="admin-page">
        <p className="admin-muted">Checking session…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-page admin-page--login">
        <form className="admin-login" onSubmit={handleSignIn}>
          <h1 className="admin-login__title">Admin</h1>
          <p className="admin-login__hint">
            Sign in to view who reviewed which college.
          </p>
          <div className="admin-login__field">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <Button type="submit" disabled={signingIn || !password}>
            {signingIn ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-top">
          <div className="admin-top__brand">
            <div className="admin-top__title-row">
              <h1 className="admin-top__title">Reviews</h1>
              <span className="admin-top__count" title="Total reviews">
                {total}
              </span>
            </div>
            {search ? (
              <p className="admin-top__filter">“{search}”</p>
            ) : null}
          </div>

          <div className="admin-top__actions">
            <div className="admin-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={`admin-view-toggle__btn${view === "list" ? " is-active" : ""}`}
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label="List view"
                title="List view"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                className={`admin-view-toggle__btn${view === "cards" ? " is-active" : ""}`}
                onClick={() => setView("cards")}
                aria-pressed={view === "cards"}
                aria-label="Card view"
                title="Card view"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => void loadReviews(search)}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? "admin-spin" : undefined} />
            </button>
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => void handleSignOut()}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <form
          className="admin-searchbar"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query.trim());
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search reviews"
            className="admin-searchbar__input"
          />
          {query ? (
            <button
              type="button"
              className="admin-icon-btn admin-icon-btn--ghost"
              onClick={() => {
                setQuery("");
                setSearch("");
              }}
              aria-label="Clear search"
              title="Clear"
            >
              <X size={18} />
            </button>
          ) : null}
          <button
            type="submit"
            className="admin-icon-btn admin-icon-btn--primary"
            aria-label="Search"
            title="Search"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {loading ? (
        <p className="admin-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="admin-empty">No reviews found.</p>
      ) : view === "list" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>College</th>
                <th>Review</th>
                <th>Verify</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  tabIndex={0}
                  onClick={() => setSelected(review)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(review);
                    }
                  }}
                >
                  <td>
                    <div className="admin-cell-title">{review.displayName}</div>
                    <div className="admin-cell-sub">
                      {review.email || "No email"}
                      {review.fullyAnonymous ? " · Anonymous" : ""}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell-title">{review.institutionName}</div>
                    <div className="admin-cell-sub">ID {review.institutionId}</div>
                  </td>
                  <td>
                    <div className="admin-cell-title">
                      {sentimentLabel(review.overallSentiment)} ·{" "}
                      {review.recommend}
                    </div>
                    <div className="admin-cell-sub admin-clamp">
                      {review.oneLiner || "—"}
                    </div>
                  </td>
                  <td>
                    <span className="admin-pill">
                      {verificationLabel(review.verificationMethod)}
                    </span>
                  </td>
                  <td className="admin-cell-sub">{formatDate(review.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card-grid">
          {reviews.map((review) => (
            <button
              key={review.id}
              type="button"
              className="admin-card"
              onClick={() => setSelected(review)}
            >
              <div className="admin-card__top">
                <span className="admin-pill">
                  {verificationLabel(review.verificationMethod)}
                </span>
                <span className="admin-card__date">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <h2 className="admin-card__college">{review.institutionName}</h2>
              <p className="admin-card__who">
                <strong>{review.displayName}</strong>
                {review.email ? ` · ${review.email}` : ""}
                {review.fullyAnonymous ? " · Anonymous" : ""}
              </p>
              <p className="admin-card__meta">
                {sentimentLabel(review.overallSentiment)} · Recommend:{" "}
                {review.recommend}
              </p>
              <p className="admin-card__review admin-clamp">{review.oneLiner}</p>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="admin-detail-dialog" showCloseButton>
          {selected ? (
            <>
              <DialogHeader className="admin-detail__header">
                <DialogTitle className="admin-detail__title">
                  {selected.institutionName}
                </DialogTitle>
                <DialogDescription className="admin-detail__subtitle">
                  <span className="admin-detail__who">
                    {selected.displayName}
                    {selected.fullyAnonymous ? " · Anonymous" : ""}
                  </span>
                  {selected.email ? (
                    <span className="admin-detail__email">{selected.email}</span>
                  ) : null}
                  <span className="admin-detail__when">
                    {formatDate(selected.createdAt)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="admin-detail">
                <div className="admin-detail__chips">
                  <span className="admin-pill">
                    {verificationLabel(selected.verificationMethod)}
                  </span>
                  <span className="admin-pill admin-pill--muted">
                    {selected.moderationStatus}
                  </span>
                  <span className="admin-pill admin-pill--muted">
                    {statusLabel(selected.status)}
                  </span>
                  <span className="admin-pill admin-pill--muted">
                    Batch {selected.batchYear}
                  </span>
                </div>

                <section className="admin-detail__hero">
                  <div className="admin-detail__hero-top">
                    <p className="admin-detail__sentiment">
                      {sentimentLabel(selected.overallSentiment)}
                    </p>
                    <span className="admin-detail__recommend">
                      Recommend: {recommendLabel(selected.recommend)}
                    </span>
                  </div>
                  {selected.oneLiner?.trim() ? (
                    <p className="admin-detail__quote">“{selected.oneLiner}”</p>
                  ) : (
                    <p className="admin-detail__empty">No short review written.</p>
                  )}
                  {selected.recommendReason?.trim() ? (
                    <p className="admin-detail__note">
                      {selected.recommendReason}
                    </p>
                  ) : null}
                  {selected.expectationGap ? (
                    <p className="admin-detail__note">
                      Expectation gap: {selected.expectationGap}
                    </p>
                  ) : null}
                </section>

                <div className="admin-detail__meta">
                  <div>
                    <span>Program</span>
                    <strong>
                      {degreeLabel(selected.degreeLevel)} · {selected.branch}
                      {selected.branchOther ? ` (${selected.branchOther})` : ""}
                    </strong>
                  </div>
                  <div>
                    <span>College ID</span>
                    <strong>{selected.institutionId}</strong>
                  </div>
                </div>

                {selected.documentUrl || selected.documentFilename ? (
                  selected.documentUrl ? (
                    <a
                      className="admin-detail__doc"
                      href={`/api/admin/documents?url=${encodeURIComponent(selected.documentUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText size={18} aria-hidden />
                      <span>
                        <strong>
                          {selected.documentType
                            ? selected.documentType.charAt(0).toUpperCase() +
                              selected.documentType.slice(1)
                            : "Document"}
                        </strong>
                        <em>{selected.documentFilename || "Attached file"}</em>
                      </span>
                      <ExternalLink size={16} aria-hidden />
                    </a>
                  ) : (
                    <div className="admin-detail__doc">
                      <FileText size={18} aria-hidden />
                      <span>
                        <strong>
                          {selected.documentType
                            ? selected.documentType.charAt(0).toUpperCase() +
                              selected.documentType.slice(1)
                            : "Document"}
                        </strong>
                        <em>{selected.documentFilename || "Attached file"}</em>
                      </span>
                    </div>
                  )
                ) : null}

                {categoryEntries(selected).length > 0 ? (
                  <section className="admin-detail__block">
                    <h3>Categories</h3>
                    <ul className="admin-detail__categories">
                      {categoryEntries(selected).map(([id, cat]) =>
                        cat ? (
                          <li key={id}>
                            <div className="admin-detail__cat-head">
                              <strong>{CATEGORY_LABELS[id] ?? id}</strong>
                              {cat.sentiment?.trim() ? (
                                <span>{sentimentLabel(cat.sentiment)}</span>
                              ) : null}
                            </div>
                            {cat.pros?.trim() ? (
                              <p>
                                <b>Pros</b> {cat.pros}
                              </p>
                            ) : null}
                            {cat.cons?.trim() ? (
                              <p>
                                <b>Cons</b> {cat.cons}
                              </p>
                            ) : null}
                          </li>
                        ) : null
                      )}
                    </ul>
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
