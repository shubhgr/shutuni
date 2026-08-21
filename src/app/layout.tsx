import type { Metadata } from "next";
import { Stack_Sans_Headline } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const stackSansHeadline = Stack_Sans_Headline({
  variable: "--font-stack-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "VerdictED",
    template: "%s | VerdictED",
  },
  description:
    "Honest college reviews from students — speak freely, without judgment.",
  applicationName: "VerdictED",
  openGraph: {
    siteName: "VerdictED",
    title: "VerdictED",
    description:
      "Honest college reviews from students — speak freely, without judgment.",
  },
  twitter: {
    card: "summary",
    title: "VerdictED",
    description:
      "Honest college reviews from students — speak freely, without judgment.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={stackSansHeadline.variable}>
      <body>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
