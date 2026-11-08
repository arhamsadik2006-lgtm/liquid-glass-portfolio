"use client";

import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import { PROFILE } from "@/lib/projects";
import { useUI } from "@/components/providers/UIProvider";
import { InstagramIcon, MailIcon, Monogram, ArrowUpRight } from "@/components/ui/Icons";

export function ContactSection({ source = "contact-terminal" }: { source?: "contact-terminal" | "contact-page" }) {
  const { openModal, toast } = useUI();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      toast({ kind: "success", title: "Email copied", description: PROFILE.email });
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#06070a] px-4 py-24 sm:px-6 sm:py-32" aria-label="Contact and booking">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F2F3F5]/10 to-transparent" />
      <div className="grid-canvas pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-violet-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[140px]" />

      <div className="glass glass-dark relative mx-auto grid max-w-6xl gap-10 rounded-[34px] p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:p-14">
        <div className="flex flex-col">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">04 — Contact Terminal</p>
          <h2 className="font-display mt-4 text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[0.95] tracking-tight">
            Let&apos;s cut
            <br />
            <span className="text-white/40">something great.</span>
          </h2>

          <div className="mt-8 flex items-center gap-4">
            <span className="relative h-14 w-14 overflow-hidden rounded-full ring-1 ring-white/25">
              <Image src={PROFILE.portrait} alt="Arham Sadik" fill sizes="56px" className="scale-[1.9] object-cover" style={{ objectPosition: "44% 38%", transformOrigin: "44% 40%" }} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">{PROFILE.name}</p>
              <p className="text-sm text-white/50">{PROFILE.role}</p>
            </div>
          </div>

          <div className="glass mt-6 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-white/80">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" /> {PROFILE.availability}
          </div>

          <div className="mt-8 space-y-3">
            <button onClick={copyEmail} className="glass glass-liquid focus-ring flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm">
              <span className="flex items-center gap-3">
                <MailIcon width={17} height={17} /> {PROFILE.email}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Copy</span>
            </button>
            <a href={PROFILE.instagram} target="_blank" rel="noopener noreferrer" className="glass glass-liquid focus-ring flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm">
              <span className="flex items-center gap-3">
                <InstagramIcon width={17} height={17} /> {PROFILE.instagramHandle}
              </span>
              <ArrowUpRight width={15} height={15} className="text-white/40" />
            </a>
            <button onClick={() => openModal({ type: "booking" })} className="glass glass-liquid focus-ring flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm">
              <span>📅 Book a 20-min discovery call</span>
              <ArrowUpRight width={15} height={15} className="text-white/40" />
            </button>
          </div>

          <div className="mt-auto hidden pt-10 font-mono text-[11px] leading-relaxed text-white/35 lg:block">
            <p>&gt; avg. response time: &lt; 24h</p>
            <p>&gt; timezone: GMT+5 · async-friendly</p>
            <p>&gt; deliverables: 4K masters · 9:16 · 1:1 cutdowns</p>
          </div>
        </div>

        <div>
          <ContactForm source={source} />
        </div>
      </div>

      <footer className="relative mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row">
        <div className="flex items-center gap-3">
          <Monogram size={28} />
          <span>© {new Date().getFullYear()} Arham Sadik. Cut with care.</span>
        </div>
        <nav className="flex flex-wrap items-center gap-5" aria-label="Footer">
          <Link href="/projects" className="hover:text-white">Projects</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <button onClick={() => openModal({ type: "showreel" })} className="hover:text-white">Showreel</button>
          <a href={PROFILE.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
        </nav>
      </footer>
    </section>
  );
}
