import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { UIProvider } from "@/components/providers/UIProvider";
import { Navbar } from "@/components/nav/Navbar";
import { LiquidFilters } from "@/components/ui/LiquidFilters";
import { ModalRoot } from "@/components/modals/ActionModals";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: {
    default: "Arham Sadik — Cinematic Edits & Motion Graphics",
    template: "%s · Arham Sadik",
  },
  description:
    "Portfolio of Arham Sadik, a video editor and motion graphics artist crafting programmatic motion, commercial storytelling and high-retention edits.",
  openGraph: {
    title: "Arham Sadik — Cinematic Edits",
    description: "Programmatic motion graphics, commercial storytelling and high-retention video editing.",
    images: ["/images/thumb-commercial.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0C10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <LiquidFilters />
        <SmoothScroll>
          <UIProvider initialProjects={PROJECTS}>
            <Navbar />
            <ErrorBoundary label="page">{children}</ErrorBoundary>
            <ModalRoot />
          </UIProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
