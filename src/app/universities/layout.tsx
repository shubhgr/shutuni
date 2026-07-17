import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppHeader } from "@/components/layout/AppHeader";
import { InstitutionsFilterProvider } from "@/contexts/institutions-filter-context";

import "@/styles/app-shell.css";

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <InstitutionsFilterProvider>
        <div className="app-shell">
          <AppHeader showSearch />
          <main className="app-shell__main">{children}</main>
        </div>
      </InstitutionsFilterProvider>
    </AuthGuard>
  );
}
