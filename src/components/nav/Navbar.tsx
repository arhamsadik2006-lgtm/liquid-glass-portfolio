"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUI } from "@/components/providers/UIProvider";
import { PROFILE } from "@/lib/projects";
import { ContrastIcon, FilterIcon, GridIcon, LockIcon, Monogram, PlusIcon, ReelIcon, SearchIcon } from "@/components/ui/Icons";

const LINKS = [
  { href: "/", label: "Showreel", icon: ReelIcon, match: (p: string) => p === "/" },
  { href: "/projects", label: "Projects", icon: GridIcon, match: (p: string) => p.startsWith("/projects") },
];

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const { openModal, toggleContrast, contrast } = useUI();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className="glass glass-nav glass-liquid pointer-events-auto mx-auto flex h-16 max-w-[1440px] items-center gap-2 rounded-[22px] px-3 sm:px-4"
        aria-label="Primary"
      >
        {/* Left cluster */}
        <div className="flex flex-1 items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`focus-ring relative flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                  active ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                <Icon width={16} height={16} />
                <span className="hidden md:inline">{label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.7)]"
                  />
                )}
              </Link>
            );
          })}

          <div className="ml-1 hidden items-center lg:flex">
            <button
              onClick={() => openModal({ type: "search" })}
              className="focus-ring glass group flex h-10 w-[290px] items-center gap-2 rounded-full pl-3 pr-1.5 text-left text-sm text-white/50 transition hover:text-white/80"
              aria-label="Search projects"
            >
              <SearchIcon width={16} height={16} />
              <span className="flex-1 truncate">Search Edits, VFX, Reels...</span>
              <kbd className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60">⌘K</kbd>
              <span
                role="button"
                tabIndex={0}
                aria-label="Open filters"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal({ type: "search", category: "all" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    openModal({ type: "search", category: "all" });
                  }
                }}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
              >
                <FilterIcon width={14} height={14} />
              </span>
            </button>
          </div>
          <button
            onClick={() => openModal({ type: "search" })}
            className="focus-ring grid h-9 w-9 place-items-center rounded-full text-white/70 hover:text-white lg:hidden"
            aria-label="Search projects"
          >
            <SearchIcon width={17} height={17} />
          </button>
        </div>

        {/* Center emblem */}
        <Link href="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-xl px-2" aria-label="Arham Sadik — home">
          <Monogram size={34} />
        </Link>

        {/* Right cluster */}
        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <button
            onClick={() => openModal({ type: "booking" })}
            className="focus-ring group relative hidden h-9 w-9 place-items-center rounded-full text-white/60 hover:text-white sm:grid"
            aria-label="Availability: 2 slots left this quarter — book a call"
            title="2 commission slots left for Q4"
          >
            <LockIcon width={16} height={16} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </button>
          <button
            onClick={toggleContrast}
            className={`focus-ring hidden h-9 w-9 place-items-center rounded-full transition sm:grid ${
              contrast === "high" ? "bg-white text-black" : "text-white/60 hover:text-white"
            }`}
            aria-label="Toggle high contrast"
            aria-pressed={contrast === "high"}
          >
            <ContrastIcon width={16} height={16} />
          </button>

          <div className="glass hidden items-center gap-2 rounded-full py-1 pl-3.5 pr-1 md:flex">
            <span className="font-mono text-xs text-white/85">
              {PROFILE.hoursEdited} <span className="text-white/45">Hours Edited</span>
            </span>
            <button
              onClick={() => openModal({ type: "booking" })}
              className="focus-ring grid h-7 w-7 place-items-center rounded-full bg-white text-black transition hover:scale-110"
              aria-label="Quick book a discovery call"
            >
              <PlusIcon width={14} height={14} />
            </button>
          </div>

          <Link href="/about" className="focus-ring relative ml-1 shrink-0 rounded-full" aria-label="About Arham Sadik">
            <span className="block h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/30">
              <Image
                src={PROFILE.portrait}
                alt="Arham Sadik"
                width={80}
                height={80}
                className="h-full w-full scale-[1.9] object-cover"
                style={{ objectPosition: "44% 38%", transformOrigin: "44% 40%" }}
                priority
              />
            </span>
            <span className="pulse-dot absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0c10] bg-emerald-400" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
