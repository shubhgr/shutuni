"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { InstitutionDetailView } from "@/components/universities/InstitutionDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstitutionsFilter } from "@/contexts/institutions-filter-context";
import type { InstitutionDetail } from "@/lib/institutions-types";

import "@/styles/universities.css";
import "@/styles/university-detail.css";

interface InstitutionPageClientProps {
  id: string;
  state?: string;
}

function InstitutionDetailSkeleton() {
  return (
    <div className="institution-detail-skeleton">
      <Skeleton style={{ height: "2rem", width: "70%" }} />
      <Skeleton style={{ height: "1rem", width: "40%", marginTop: "var(--space-3)" }} />
      <Skeleton style={{ height: "4rem", width: "100%", marginTop: "var(--space-6)" }} />
      <Skeleton style={{ height: "20rem", width: "100%", marginTop: "var(--space-8)" }} />
    </div>
  );
}

export function InstitutionPageClient({ id, state }: InstitutionPageClientProps) {
  const router = useRouter();
  const { setSearch } = useInstitutionsFilter();
  const [institution, setInstitution] = useState<InstitutionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!institution) return;
    setSearch(institution.name);
  }, [institution, setSearch]);

  useEffect(() => {
    return () => setSearch("");
  }, [setSearch]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setNotFoundState(false);

      try {
        const params = new URLSearchParams();
        if (state) params.set("state", state);

        const query = params.toString();
        const res = await fetch(
          `/api/institutions/${encodeURIComponent(id)}${query ? `?${query}` : ""}`
        );

        if (res.status === 404) {
          setNotFoundState(true);
          return;
        }

        if (!res.ok) throw new Error("Failed to load");

        const data = (await res.json()) as InstitutionDetail;
        setInstitution(data);

        if (data.id !== id) {
          const params = new URLSearchParams();
          if (data.state) params.set("state", data.state);
          const query = params.toString();
          router.replace(
            `/universities/${encodeURIComponent(data.id)}${query ? `?${query}` : ""}`
          );
        }
      } catch {
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id, state, router]);

  if (notFoundState) {
    return (
      <div className="universities-empty">
        <p className="universities-empty__title">Institution not found</p>
        <p className="universities-empty__text">
          This link may be outdated. Browse colleges from the listing page to
          open the latest details.
        </p>
        <Link href="/universities" className="universities-empty__action">
          Browse colleges
        </Link>
      </div>
    );
  }

  return (
    <>
      {isLoading || !institution ? (
        <InstitutionDetailSkeleton />
      ) : (
        <InstitutionDetailView institution={institution} />
      )}
    </>
  );
}
