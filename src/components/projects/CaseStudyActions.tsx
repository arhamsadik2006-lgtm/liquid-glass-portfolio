"use client";

import Link from "next/link";
import { useUI } from "@/components/providers/UIProvider";

export function CaseStudyActions() {
  const { openModal } = useUI();
  return (
    <div className="flex flex-col gap-2">
      <Link href="/contact" className="rounded-full bg-white py-3 text-center text-sm font-semibold text-black">
        Start a similar project →
      </Link>
      <button onClick={() => openModal({ type: "booking" })} className="glass rounded-full py-3 text-sm">
        Book a discovery call
      </button>
    </div>
  );
}
