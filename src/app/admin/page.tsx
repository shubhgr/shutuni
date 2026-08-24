import type { Metadata } from "next";

import { AdminReviewsPanel } from "@/components/admin/AdminReviewsPanel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminReviewsPanel />;
}
