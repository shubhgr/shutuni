"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, List, LogOut, RefreshCw, Search } from "lucide-react";
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
  disappointing: "Disappointing",
  fellShort: "Fell short",
  mixed: "Mixed",
  solid: "Solid",
  impressed: "Impressed",
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
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Review admin</h1>
          <p className="admin-header__meta">
            {total} review{total === 1 ? "" : "s"}
            {search ? ` matching “${search}”` : ""}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void handleSignOut()}>
          <LogOut size={16} />
          Sign out
        </Button>
      </header>

      <div className="admin-toolbar">
        <form
          className="admin-search"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query.trim());
          }}
        >
          <Search size={16} aria-hidden className="admin-search__icon" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviewer, email, or college…"
            aria-label="Search reviews"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="admin-toolbar__right">
          <div className="admin-view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`admin-view-toggle__btn${view === "list" ? " is-active" : ""}`}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              <List size={16} />
              List
            </button>
            <button
              type="button"
              className={`admin-view-toggle__btn${view === "cards" ? " is-active" : ""}`}
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
            >
              <LayoutGrid size={16} />
              Cards
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadReviews(search)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
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
              <DialogHeader>
                <DialogTitle>{selected.institutionName}</DialogTitle>
                <DialogDescription>
                  Review by {selected.displayName}
                  {selected.email ? ` (${selected.email})` : ""} ·{" "}
                  {formatDate(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="admin-detail">
                <dl className="admin-detail__grid">
                  <div>
                    <dt>Program</dt>
                    <dd>
                      {selected.degreeLevel} · {selected.branch}
                      {selected.branchOther ? ` (${selected.branchOther})` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Batch</dt>
                    <dd>{selected.batchYear}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{selected.status}</dd>
                  </div>
                  <div>
                    <dt>Verification</dt>
                    <dd>{verificationLabel(selected.verificationMethod)}</dd>
                  </div>
                  <div>
                    <dt>Moderation</dt>
                    <dd>{selected.moderationStatus}</dd>
                  </div>
                  <div>
                    <dt>Anonymous</dt>
                    <dd>{selected.fullyAnonymous ? "Yes" : "No"}</dd>
                  </div>
                </dl>

                <section className="admin-detail__block">
                  <h3>Overall</h3>
                  <p>
                    <strong>{sentimentLabel(selected.overallSentiment)}</strong>
                    {selected.expectationGap
                      ? ` · ${selected.expectationGap}`
                      : ""}
                  </p>
                  <p>{selected.oneLiner || "No short review."}</p>
                  <p>
                    Recommend: <strong>{selected.recommend}</strong>
                    {selected.recommendReason
                      ? ` — ${selected.recommendReason}`
                      : ""}
                  </p>
                </section>

                {Object.keys(selected.categories).length > 0 ? (
                  <section className="admin-detail__block">
                    <h3>Categories</h3>
                    <ul className="admin-detail__categories">
                      {Object.entries(selected.categories).map(
                        ([id, cat]) =>
                          cat ? (
                            <li key={id}>
                              <strong>{CATEGORY_LABELS[id] ?? id}</strong>
                              <span>
                                {sentimentLabel(cat.sentiment || "—")}
                              </span>
                              {cat.pros ? <p>Pros: {cat.pros}</p> : null}
                              {cat.cons ? <p>Cons: {cat.cons}</p> : null}
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
