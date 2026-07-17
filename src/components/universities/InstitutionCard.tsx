import Link from "next/link";
import { Star } from "lucide-react";

import type { InstitutionListItem } from "@/lib/institutions-types";

import "@/styles/universities.css";

interface InstitutionCardProps {
  institution: InstitutionListItem;
}

function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatType(type?: string): string {
  if (!type) return "—";
  return type;
}

function formatUniversity(university?: string): string {
  if (!university || university === "NOT APPLICABLE") return "—";
  return university;
}

export function InstitutionCard({ institution }: InstitutionCardProps) {
  const detailUrl = institution.state
    ? `/universities/${encodeURIComponent(institution.id)}?state=${encodeURIComponent(institution.state)}`
    : `/universities/${encodeURIComponent(institution.id)}`;

  const location = institution.state
    ? `${institution.district}, ${institution.state}`
    : institution.district;

  const courses = institution.programmes_count ?? 0;
  const reviews = 0;
  const university = formatUniversity(institution.university);
  const rating =
    institution.college_score != null
      ? institution.college_score.toFixed(2)
      : "—";

  return (
    <Link href={detailUrl} className="institution-list-card">
      <div className="institution-list-card__body">
        <div className="institution-list-card__logo" aria-hidden>
          {getInitials(institution.name)}
        </div>

        <div className="institution-list-card__content">
          <h3 className="institution-list-card__name">{institution.name}</h3>

          <div className="institution-list-card__rating-row">
            <Star className="institution-list-card__star" aria-hidden />
            <span className="institution-list-card__rating-value">{rating}</span>
            <span className="institution-list-card__rating-meta">
              ({reviews} reviews)
            </span>
          </div>

          <p className="institution-list-card__meta">
            {formatType(institution.institution_type)}
            <span className="institution-list-card__meta-sep">|</span>
            {location}
          </p>
        </div>
      </div>

      <div className="institution-list-card__stats">
        <div className="institution-list-card__stat">
          <strong>{courses}</strong>
          <span>Courses</span>
        </div>
        <div className="institution-list-card__stat">
          <strong>{reviews}</strong>
          <span>Reviews</span>
        </div>
        <div className="institution-list-card__stat institution-list-card__stat--truncate">
          <strong title={university !== "—" ? university : undefined}>
            {university}
          </strong>
          <span>University</span>
        </div>
        <div className="institution-list-card__stat">
          <strong>{institution.district}</strong>
          <span>District</span>
        </div>
        <div className="institution-list-card__stat">
          <strong>{institution.state || "—"}</strong>
          <span>State</span>
        </div>
      </div>
    </Link>
  );
}
