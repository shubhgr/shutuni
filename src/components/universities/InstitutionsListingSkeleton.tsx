"use client";

import { Skeleton } from "@/components/ui/skeleton";

import "@/styles/universities.css";

export function InstitutionsListingSkeleton() {
  return (
    <div className="universities-content">
      <Skeleton style={{ height: "1rem", width: "12rem", marginBottom: "var(--space-4)" }} />
      <div className="institutions-skeleton__list">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="institutions-skeleton__card">
            <div style={{ display: "flex", gap: "var(--space-4)" }}>
              <Skeleton style={{ width: "3.5rem", height: "3.5rem", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton style={{ height: "1.25rem", width: "70%" }} />
                <Skeleton style={{ height: "0.875rem", width: "40%", marginTop: "var(--space-3)" }} />
                <Skeleton style={{ height: "0.875rem", width: "55%", marginTop: "var(--space-2)" }} />
              </div>
            </div>
            <Skeleton style={{ height: "3rem", width: "100%", marginTop: "var(--space-4)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
