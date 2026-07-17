import { InstitutionPageClient } from "@/components/universities/InstitutionPageClient";

interface UniversityPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}

export default async function UniversityPage({
  params,
  searchParams,
}: UniversityPageProps) {
  const { id } = await params;
  const { state } = await searchParams;

  return <InstitutionPageClient id={id} state={state} />;
}
