"use client";

import { useState } from "react";

import "@/styles/university-detail.css";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Sharp-pointed star — no rounded line joins. */
function SharpStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden
    >
      <path
        d="M12 2.2 L14.85 9.05 L22.2 9.55 L16.55 14.35 L18.4 21.5 L12 17.55 L5.6 21.5 L7.45 14.35 L1.8 9.55 L9.15 9.05 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/** Fill amount for star index (1–5), in tenths. */
function starFill(value: number, star: number): number {
  const rounded = Math.round(value * 10) / 10;
  return Math.min(1, Math.max(0, rounded - (star - 1)));
}

export function StarRating({ value, onChange, compact = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const labelIndex = Math.round(value);

  return (
    <div
      className={`star-rating${compact ? " star-rating--compact" : ""}`}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const selectedFill = starFill(value, star);
        const isPreview = hovered > value && star > Math.ceil(value) && star <= hovered;
        const fill = isPreview ? 1 : selectedFill;
        const isPartial = !isPreview && fill > 0 && fill < 1;
        const isFull = !isPreview && fill >= 1;
        const stateClass = isPreview
          ? " star-rating__button--preview"
          : isFull || isPartial
            ? " star-rating__button--active"
            : "";

        return (
          <button
            key={star}
            type="button"
            className={`star-rating__button${stateClass}`}
            onClick={() => {
              const lastFilled = Math.ceil(value);
              onChange(value > 0 && star === lastFilled ? 0 : star);
            }}
            onMouseEnter={() => setHovered(star)}
            aria-label={
              value > 0 && star === Math.ceil(value)
                ? `Clear rating (${value} of 5)`
                : `Rate ${star} out of 5 stars`
            }
          >
            <span className="star-rating__icon" aria-hidden>
              <SharpStar className="star-rating__icon-base" />
              {fill > 0 && (
                <span
                  className="star-rating__icon-fill"
                  style={{ width: `${Math.round(fill * 100)}%` }}
                >
                  <SharpStar />
                </span>
              )}
            </span>
          </button>
        );
      })}
      {!compact && value > 0 && Number.isInteger(value) && (
        <span className="star-rating__label">{labels[labelIndex]}</span>
      )}
    </div>
  );
}
