"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HeaderSearchBar } from "@/components/layout/HeaderSearchBar";
import { useInstitutionsFilterOptional } from "@/contexts/institutions-filter-context";
import { getAuthEmail, logout } from "@/lib/auth";

import "@/styles/app-shell.css";

function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  if (!local) return "U";
  return local.slice(0, 2).toUpperCase();
}

interface AppHeaderProps {
  showSearch?: boolean;
}

export function AppHeader({ showSearch = false }: AppHeaderProps) {
  const router = useRouter();
  const email = getAuthEmail();
  const initials = email ? getInitials(email) : "U";
  const filterContext = useInstitutionsFilterOptional();
  const canShowSearch = showSearch && filterContext && !filterContext.isLoadingStates;

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleAddReview() {
    toast.info("Open an institution and use the review tab to add a review.");
  }

  return (
    <header className="app-shell__header">
      <Link href="/" className="app-shell__brand">
        <span className="app-shell__brand-icon" aria-hidden />
        VerdictED
      </Link>

      {canShowSearch && (
        <div className="app-shell__header-center">
          <HeaderSearchBar />
        </div>
      )}

      <div className="app-shell__actions">
        {canShowSearch && (
          <button
            type="button"
            className="app-shell__add-review"
            onClick={handleAddReview}
          >
            <Plus aria-hidden />
            <span>Add Review</span>
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="app-shell__profile-trigger">
            <Avatar className="app-shell__profile-avatar">
              <AvatarFallback className="app-shell__profile-fallback">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="app-shell__profile-menu"
          >
            <DropdownMenuItem className="app-shell__profile-menu-item">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="app-shell__profile-menu-item">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="app-shell__profile-menu-item"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
